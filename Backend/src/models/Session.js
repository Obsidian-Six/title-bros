/**
 * ==============================================================================
 * Session Model & Schema (MongoDB / Mongoose)
 * ==============================================================================
 * Tracks active authentication sessions for both Customers and Administrators.
 * Enables:
 * - Device & browser tracking (User-Agent, IP address)
 * - Inactivity timeouts (auto-logout after inactivity)
 * - Explicit session revocation (logout, security invalidation)
 * - Multi-device management and audit tracking
 */

import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-remove expired documents
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Instance method: Check if session has timed out due to inactivity
 * @param {number} inactivityMinutes - Inactivity threshold in minutes
 * @returns {boolean}
 */
sessionSchema.methods.hasTimedOut = function (inactivityMinutes) {
  const thresholdMs = inactivityMinutes * 60 * 1000;
  const elapsedMs = Date.now() - new Date(this.lastActiveAt).getTime();
  return elapsedMs > thresholdMs;
};

/**
 * Instance method: Refresh session activity timestamp
 */
sessionSchema.methods.touch = async function () {
  this.lastActiveAt = new Date();
  await this.save({ validateBeforeSave: false });
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;
