/**
 * ==============================================================================
 * Authentication Routes (/api/v1/auth)
 * ==============================================================================
 * Mounts public and protected authentication endpoints:
 * - POST /register         -> Public customer registration
 * - POST /login            -> Customer login
 * - POST /admin/login      -> Dedicated admin/staff login
 * - POST /logout           -> Session termination
 * - GET  /me               -> Authenticated user profile & session metadata
 * - POST /forgot-password  -> Request password reset email
 * - POST /reset-password/:token -> Execute password reset
 * - POST /refresh          -> Renew session token
 */

import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/authValidator.js';
import validateRequest from '../middlewares/validationMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authRateLimiter, registerRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public Routes (Rate limited for brute-force defense)
router.post('/register', registerRateLimiter, registerValidator, validateRequest, register);
router.post('/login', authRateLimiter, loginValidator, validateRequest, login);
router.post('/admin/login', authRateLimiter, loginValidator, validateRequest, adminLogin);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validateRequest, resetPassword);

// Protected Routes (Require valid JWT and active session)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);

export default router;
