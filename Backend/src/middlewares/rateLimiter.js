/**
 * ==============================================================================
 * Rate Limiting Middleware (express-rate-limit)
 * ==============================================================================
 * Protects public and authentication endpoints against denial of service (DoS),
 * credential stuffing, and brute force password guessing attacks.
 */

import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * Strict rate limiter for Authentication Endpoints (Login, Forgot Password)
 * Max 10 attempts per 15 minutes per IP address
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        'Too many login or authentication attempts from this IP. Please try again after 15 minutes.'
      )
    );
  },
});

/**
 * Moderate rate limiter for Account Creation / Registration
 * Max 5 registrations per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        'Too many accounts created from this IP address. Please try again later.'
      )
    );
  },
});

/**
 * General API Limiter for public endpoints
 * Max 100 requests per 15 minutes per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests. Please slow down.'));
  },
});
