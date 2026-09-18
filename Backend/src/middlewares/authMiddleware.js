/**
 * ==============================================================================
 * Authentication & Session Inactivity Middleware
 * ==============================================================================
 * Core security gatekeeper for protected endpoints:
 * 1. Extracts and verifies JWT bearer token (or HTTP-only cookie)
 * 2. Validates corresponding active database Session
 * 3. Enforces session inactivity timeout (auto logout after inactivity):
 *    - 15 minutes default for ADMIN and SUPER_ADMIN
 *    - 60 minutes default for CUSTOMER
 * 4. Ensures the user account exists, is active, and is not locked
 * 5. Updates session activity timestamp ('touch') on active requests
 */

import { verifyToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import Session from '../models/Session.js';

/**
 * Middleware: Protect routes and enforce authentication + inactivity checks
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header or cookie
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. Please log in to access this resource.');
  }

  // 2. Verify token signature
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session token has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token. Authorization failed.');
  }

  // 3. Locate active session in database
  const session = await Session.findById(decoded.sessionId);

  if (!session || !session.isValid) {
    throw new ApiError(401, 'Session has been invalidated or logged out. Please sign in.');
  }

  // 4. Inactivity timeout evaluation
  const isAdminRole =
    session.role === USER_ROLES.ADMIN || session.role === USER_ROLES.SUPER_ADMIN;

  const inactivityMinutes = isAdminRole
    ? parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_ADMIN || '15', 10)
    : parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_CUSTOMER || '60', 10);

  if (session.hasTimedOut(inactivityMinutes)) {
    // Invalidate session immediately
    session.isValid = false;
    await session.save({ validateBeforeSave: false });

    throw new ApiError(
      401,
      `Session expired due to ${inactivityMinutes} minutes of inactivity. Please log in again.`
    );
  }

  // 5. Fetch associated user account
  const user = await User.findById(session.user);

  if (!user) {
    throw new ApiError(401, 'The user account for this session no longer exists.');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, `Account access restricted. Status: ${user.status}. Contact support.`);
  }

  if (user.isLocked()) {
    throw new ApiError(
      423,
      `Account is temporarily locked due to failed attempts. Try again after ${new Date(
        user.lockUntil
      ).toLocaleTimeString()}.`
    );
  }

  // 6. Touch session to refresh the lastActiveAt timestamp
  await session.touch();

  // 7. Attach user and session to request context
  req.user = user;
  req.session = session;

  next();
});

/**
 * Middleware: Optional authentication (attaches req.user if valid token present, doesn't error if guest)
 */
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const session = await Session.findById(decoded.sessionId);
    if (session && session.isValid) {
      const user = await User.findById(session.user).select('-password');
      if (user && user.status === USER_STATUS.ACTIVE) {
        await session.touch();
        req.user = user;
        req.session = session;
      }
    }
  } catch (err) {
    // Ignore token errors for optional auth
  }

  next();
});

export default protect;

