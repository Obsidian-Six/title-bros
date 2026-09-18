/**
 * ==============================================================================
 * User & Staff Management Controller
 * ==============================================================================
 * Manages administrative provisioning, RBAC delegation, and user status controls:
 * - Provisioning internal staff / Admin accounts (Restricted to SUPER_ADMIN)
 * - Listing internal team members
 * - Account activation / deactivation / suspension
 * - Profile updates
 */

import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import Session from '../models/Session.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Create a new internal Admin account
 * @route   POST /api/v1/users/create-admin
 * @access  Private (SUPER_ADMIN only)
 */
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // 1. Check if email is already taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'A user account with this email address already exists.');
  }

  // 2. Validate targeted role
  const targetRole = role === USER_ROLES.SUPER_ADMIN ? USER_ROLES.SUPER_ADMIN : USER_ROLES.ADMIN;

  // 3. Create the administrative account
  const newAdmin = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    role: targetRole,
    status: USER_STATUS.ACTIVE,
  });

  const createdData = {
    _id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
    status: newAdmin.status,
    createdAt: newAdmin.createdAt,
  };

  res.status(201).json(
    new ApiResponse(
      201,
      createdData,
      `Staff account for '${newAdmin.name}' created successfully with role ${newAdmin.role}.`
    )
  );
});

/**
 * @desc    Get all administrative staff members
 * @route   GET /api/v1/users/admins
 * @access  Private (SUPER_ADMIN and ADMIN)
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
  })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { admins, count: admins.length }, 'Staff list retrieved successfully.')
  );
});

/**
 * @desc    Get all customers / platform users
 * @route   GET /api/v1/users/customers
 * @access  Private (SUPER_ADMIN and ADMIN)
 */
export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const filter = { role: USER_ROLES.CUSTOMER };

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        customers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      'Customers retrieved successfully.'
    )
  );
});

/**
 * @desc    Update user or staff account status (ACTIVE, INACTIVE, SUSPENDED)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private (SUPER_ADMIN only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!Object.values(USER_STATUS).includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Prevent Super Admin from deactivating their own account
  if (user._id.toString() === req.user._id.toString() && status !== USER_STATUS.ACTIVE) {
    throw new ApiError(400, 'Security Constraint: You cannot deactivate your own Super Admin account.');
  }

  user.status = status;
  await user.save();

  // If suspended or deactivated, invalidate all active sessions immediately
  if (status !== USER_STATUS.ACTIVE) {
    await Session.updateMany({ user: user._id, isValid: true }, { isValid: false });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { _id: user._id, name: user.name, email: user.email, status: user.status },
      `Account status updated to ${status}.`
    )
  );
});

/**
 * @desc    Update current authenticated user's own profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      'Profile updated successfully.'
    )
  );
});
