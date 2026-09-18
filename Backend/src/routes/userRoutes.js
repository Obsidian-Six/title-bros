/**
 * ==============================================================================
 * User & Staff Management Routes (/api/v1/users)
 * ==============================================================================
 * Granular RBAC endpoints:
 * - POST  /create-admin   -> Provision internal staff (SUPER_ADMIN only)
 * - GET   /admins         -> View administrative staff (SUPER_ADMIN & ADMIN)
 * - GET   /customers      -> View customers (SUPER_ADMIN & ADMIN)
 * - PATCH /:id/status     -> Update account status (SUPER_ADMIN only)
 * - PUT   /profile        -> Update own profile (Authenticated users)
 */

import { Router } from 'express';
import {
  createAdmin,
  getAllAdmins,
  getAllCustomers,
  updateUserStatus,
  updateProfile,
} from '../controllers/userController.js';
import { createAdminValidator } from '../validators/authValidator.js';
import validateRequest from '../middlewares/validationMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// All user management routes require valid authentication
router.use(protect);

// Current user profile management
router.put('/profile', updateProfile);

// Staff management (Restricted to SUPER_ADMIN)
router.post(
  '/create-admin',
  restrictTo(USER_ROLES.SUPER_ADMIN),
  createAdminValidator,
  validateRequest,
  createAdmin
);

router.patch(
  '/:id/status',
  restrictTo(USER_ROLES.SUPER_ADMIN),
  updateUserStatus
);

// Staff and Customer overview (SUPER_ADMIN and ADMIN)
router.get(
  '/admins',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  getAllAdmins
);

router.get(
  '/customers',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  getAllCustomers
);

export default router;
