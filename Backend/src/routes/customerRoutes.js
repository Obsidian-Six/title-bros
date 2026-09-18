import { Router } from 'express';
import {
  getCustomers,
  getCustomerDetail,
  createWalkInCustomer,
  deleteCustomerPermanently,
} from '../controllers/customerController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Restrict all customer management routes to Staff & Super Admin
router.use(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', getCustomers);
router.get('/:id', getCustomerDetail);
router.post('/walk-in', createWalkInCustomer);

// Permanent deletion of customer and all records (Super Admin only)
router.delete('/:id', restrictTo(USER_ROLES.SUPER_ADMIN), deleteCustomerPermanently);

export default router;
