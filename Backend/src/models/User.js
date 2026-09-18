/**
 * ==============================================================================
 * User Model & Schema (MongoDB / Mongoose)
 * ==============================================================================
 * Defines the core User entity supporting three distinct permission tiers:
 * - SUPER_ADMIN: Full system control, can provision Admin accounts.
 * - ADMIN: Title Bros internal operations team, loan processors.
 * - CUSTOMER: Public client / loan applicant.
 *
 * Security features:
 * - Bcrypt password hashing (12 salt rounds)
 * - Failed login attempts tracking and 15-minute account lockout
 * - Cryptographic password reset tokens with expiration
 * - Pre-save hooks to prevent accidental plain-text storage
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Exported user role constants for use across the application
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
};

// Exported user account statuses
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address format',
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Prevents password from being returned in general queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Role must be either SUPER_ADMIN, ADMIN, or CUSTOMER',
      },
      default: USER_ROLES.CUSTOMER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      index: true,
    },
    // Brute force protection attributes
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Password reset attributes
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    // Activity timestamps
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

/**
 * Pre-save middleware: Automatically hash password using bcrypt before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare input password with stored bcrypt hash
 * @param {string} candidatePassword - Plain text candidate password
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method: Check if account is currently locked due to failed attempts
 * @returns {boolean}
 */
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Instance method: Increment failed login attempts and lock account if limit reached
 * @param {number} maxAttempts - Maximum allowed failed attempts (default: 5)
 * @param {number} lockMinutes - Duration in minutes to lock account (default: 15)
 */
userSchema.methods.handleFailedLogin = async function (maxAttempts = 5, lockMinutes = 15) {
  // If lock already expired, reset counter
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.failedLoginAttempts += 1;
  }

  // If failed attempts reach threshold, lock the account
  if (this.failedLoginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    console.warn(`[Security Alert] User account locked for ${this.email} until ${this.lockUntil}`);
  }

  await this.save({ validateBeforeSave: false });
};

/**
 * Instance method: Reset failed login attempts upon successful login
 */
userSchema.methods.resetFailedLogin = async function () {
  if (this.failedLoginAttempts !== 0 || this.lockUntil !== null) {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    await this.save({ validateBeforeSave: false });
  }
};

/**
 * Instance method: Generate cryptographically secure SHA-256 password reset token
 * @param {number} expireMinutes - Validity duration (default: 15 mins)
 * @returns {string} - Unhashed raw token to send via email
 */
userSchema.methods.createPasswordResetToken = function (expireMinutes = 15) {
  // Generate random 32-byte hex token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and store in user document
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = new Date(Date.now() + expireMinutes * 60 * 1000);

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
