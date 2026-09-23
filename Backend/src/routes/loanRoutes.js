import { Router } from 'express';
import {
  submitApplication,
  getAdminStats,
  getAllLoans,
  getLoanById,
  updateLoanStatus,
  addLoanNote,
  uploadLoanDoc,
  reviewLoanDoc,
  getMyApplications,
  markLoanAsRead,
  geocodeAddress,
} from '../controllers/loanController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import uploadDocument from '../middlewares/uploadMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Public dynamic address geocoding (UK & Worldwide)
router.get('/geocode', geocodeAddress);

// Public / Authenticated loan submission
router.post('/apply', optionalProtect, submitApplication);

// Customer portal: View own applications
router.get('/my-applications', protect, getMyApplications);

// Admin Overview Statistics & Alerts
router.get(
  '/admin/stats',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  getAdminStats
);

// Admin Loan Directory with filters & search
router.get(
  '/',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  getAllLoans
);

// Single Loan Details (Admin or Loan Owner)
router.get('/:id', protect, getLoanById);

// Mark Loan Application as Read (Staff)
router.patch(
  '/:id/read',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  markLoanAsRead
);

// Admin Status Updates (Approve, Reject, Request Docs, Under Review)
router.patch(
  '/:id/status',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  updateLoanStatus
);

// Internal Staff Notes
router.post(
  '/:id/notes',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  addLoanNote
);

// Upload Loan Document (Customer or Staff)
router.post(
  '/:id/documents',
  protect,
  uploadDocument.single('document'),
  uploadLoanDoc
);

// Review Uploaded Document (Accept / Reject)
router.patch(
  '/:id/documents/:docId',
  protect,
  restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  reviewLoanDoc
);

export default router;
