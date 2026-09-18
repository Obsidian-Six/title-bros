/**
 * ==============================================================================
 * Authentication Controller
 * ==============================================================================
 * Implements the complete authentication lifecycle:
 * - Public customer account self-registration
 * - Secure customer authentication
 * - Dedicated internal staff/admin authentication
 * - Session tracking (IP, User-Agent, device metadata)
 * - Logout & session revocation
 * - Forgot password link generation & email dispatch
 * - Token-based password reset & session termination
 * - Active session token renewal
 */

import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import Session from '../models/Session.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken, getCookieOptions, hashToken } from '../utils/token.js';
import { sendEmail, getPasswordResetEmailTemplate } from '../utils/emailService.js';

/**
 * Helper: Establish session and construct authentication response payload
 * @param {Object} user - User document
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {number} statusCode - HTTP status code (200 or 201)
 * @param {string} message - Custom message
 */
const sendAuthResponse = async (user, req, res, statusCode = 200, message = 'Authenticated successfully') => {
  // Determine session expiration in days
  const sessionDays = parseInt(process.env.JWT_COOKIE_EXPIRE || '1', 10);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  // Extract client metadata for audit & security tracking
  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'Unknown';

  const userAgent = req.headers['user-agent'] || 'Unknown Device';

  // 1. Create a new active Session record in MongoDB
  const session = await Session.create({
    user: user._id,
    role: user.role,
    ipAddress,
    userAgent,
    isValid: true,
    lastActiveAt: new Date(),
    expiresAt,
  });

  // 2. Generate signed JWT containing user ID, role, and Session ID
  const token = generateToken({
    id: user._id,
    role: user.role,
    sessionId: session._id,
  });

  // 3. Update user's last login timestamp
  user.lastLoginAt = new Date();
  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  // 4. Set secure HTTP-only cookie
  res.cookie('token', token, getCookieOptions());

  // 5. Send standardized JSON response (password excluded)
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: userData,
        token,
        sessionId: session._id,
      },
      message
    )
  );
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/v1/auth/register
 * @access  Public (Customer role forced)
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // 1. Check if email is already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists.');
  }

  // 2. Security: Always force role to CUSTOMER for public self-registration
  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    role: USER_ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
  });

  // 3. Issue session & token
  await sendAuthResponse(user, req, res, 201, 'Account created successfully.');
});

/**
 * @desc    Customer Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Query user with hidden password field included
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // 2. Verify account status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, `Your account is ${user.status}. Please contact Title Bros support.`);
  }

  // 3. Check for account lockout
  if (user.isLocked()) {
    const lockRemainingMinutes = Math.ceil((new Date(user.lockUntil) - Date.now()) / (60 * 1000));
    throw new ApiError(
      423,
      `Account locked due to multiple failed login attempts. Try again in ${lockRemainingMinutes} minutes.`
    );
  }

  // 4. Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.handleFailedLogin();
    throw new ApiError(401, 'Invalid email or password.');
  }

  // 5. Reset failed login counter on success
  await user.resetFailedLogin();

  // 6. Generate session and return token
  await sendAuthResponse(user, req, res, 200, 'Logged in successfully.');
});

/**
 * @desc    Admin & Staff Dedicated Login
 * @route   POST /api/v1/auth/admin/login
 * @access  Public (Staff only)
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Query user with password included
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid administrative credentials.');
  }

  // 2. Enforce strict role boundary: Only ADMIN and SUPER_ADMIN can authenticate here
  if (user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.SUPER_ADMIN) {
    console.warn(`[Security Notice] Customer account ${email} attempted unauthorized admin login.`);
    throw new ApiError(
      403,
      'Access Denied: You do not have permission to access the Title Bros Admin Portal.'
    );
  }

  // 3. Verify status and lock status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, `Admin account is currently ${user.status}. Please contact a Super Admin.`);
  }

  if (user.isLocked()) {
    const lockMinutes = Math.ceil((new Date(user.lockUntil) - Date.now()) / (60 * 1000));
    throw new ApiError(
      423,
      `Administrative account locked due to security policy. Try again in ${lockMinutes} minutes.`
    );
  }

  // 4. Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.handleFailedLogin(5, 30); // 30-min lockout for admin accounts
    throw new ApiError(401, 'Invalid administrative credentials.');
  }

  // 5. Reset failed attempts
  await user.resetFailedLogin();

  // 6. Issue admin session
  await sendAuthResponse(user, req, res, 200, `Welcome back, ${user.name} (${user.role}).`);
});

/**
 * @desc    Log out current session
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Invalidate current session record in database
  if (req.session) {
    req.session.isValid = false;
    await req.session.save({ validateBeforeSave: false });
  }

  // Clear cookie in browser
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

/**
 * @desc    Get currently logged in user profile with active session
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const userData = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
    status: req.user.status,
    lastLoginAt: req.user.lastLoginAt,
    lastActiveAt: req.session.lastActiveAt,
    sessionCreated: req.session.createdAt,
    ipAddress: req.session.ipAddress,
  };

  res.status(200).json(new ApiResponse(200, userData, 'User profile retrieved successfully.'));
});

/**
 * @desc    Request Password Reset Link via Email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // For security reasons, do not reveal if the email does not exist
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'If that email address is registered, a password reset link has been dispatched.'
        )
      );
  }

  // Generate 32-byte crypto token and save hash
  const resetToken = user.createPasswordResetToken(15); // 15-minute expiration
  await user.save({ validateBeforeSave: false });

  // Build reset link pointing to client frontend
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/en/reset-password/${resetToken}`;

  try {
    const htmlTemplate = getPasswordResetEmailTemplate(user.name, resetUrl, 15);
    await sendEmail({
      email: user.email,
      subject: 'Reset Your Title Bros Account Password',
      html: htmlTemplate,
      text: `Hello ${user.name},\n\nYou requested a password reset. Please open the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined },
          'If that email address is registered, a password reset link has been dispatched.'
        )
      );
  } catch (error) {
    // If email fails, clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, 'Unable to send password reset email. Please try again later.');
  }
});

/**
 * @desc    Reset password using received crypto token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the incoming raw token to compare against database record
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset link is invalid or has expired. Please request a new one.');
  }

  // Set new password (will be automatically hashed by pre-save hook)
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // Invalidate all prior active sessions for this user as a security measure
  await Session.updateMany({ user: user._id, isValid: true }, { isValid: false });

  // Issue a fresh authenticated session
  await sendAuthResponse(user, req, res, 200, 'Password updated successfully. You are now logged in.');
});

/**
 * @desc    Refresh session token
 * @route   POST /api/v1/auth/refresh
 * @access  Private
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = generateToken({
    id: req.user._id,
    role: req.user.role,
    sessionId: req.session._id,
  });

  res.cookie('token', token, getCookieOptions());

  res.status(200).json(
    new ApiResponse(
      200,
      { token },
      'Session token refreshed successfully.'
    )
  );
});
