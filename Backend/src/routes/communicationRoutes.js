import { Router } from 'express';
import {
  getCommunicationLogs,
  sendManualMessage,
} from '../controllers/communicationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Restrict to Staff & Super Admin
router.use(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', getCommunicationLogs);
router.post('/send', sendManualMessage);

export default router;
