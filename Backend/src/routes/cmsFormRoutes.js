import { Router } from 'express';
import {
  submitForm,
  getFormSubmissions,
  markAsRead,
  deleteFormSubmission,
} from '../controllers/cmsFormController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Public endpoint for submitting forms
router.post('/', submitForm);

// Protected endpoints for Admin to manage forms
router.use(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', getFormSubmissions);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteFormSubmission);

export default router;
