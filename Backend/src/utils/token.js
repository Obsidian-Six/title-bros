/**
 * ==============================================================================
 * JWT & Cryptographic Token Utilities
 * ==============================================================================
 * Manages JWT creation, token verification, SHA-256 hash generation for password
 * reset workflows, and HTTP cookie configuration.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate a signed JWT token containing user identity and session ID
 * @param {Object} payload - Token payload ({ id, role, sessionId })
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

/**
 * Verify and decode an existing JWT token
 * @param {string} token - JWT string to verify
 * @returns {Object} - Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate a random 32-byte hex token and its SHA-256 hash
 * Used for secure password reset links sent via email.
 * - The raw token is sent to the user's email.
 * - The hashed token is stored in the database for security.
 * @returns {{ rawToken: string, hashedToken: string }}
 */
export const generateCryptoToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hash a plain string or token with SHA-256
 * @param {string} token
 * @returns {string}
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Standard cookie configuration for storing JWT in browser
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDays = parseInt(process.env.JWT_COOKIE_EXPIRE || '1', 10);

  return {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // Mitigates XSS attacks by disallowing client JS access
    secure: isProduction, // Sent only over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF mitigation
  };
};
