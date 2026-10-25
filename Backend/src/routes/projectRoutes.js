import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { USER_ROLES } from '../models/User.js';
import uploadDocument from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes (Admin only)
router.use(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post('/', uploadDocument.single('media'), createProject);
router.put('/:id', uploadDocument.single('media'), updateProject);
router.delete('/:id', deleteProject);

export default router;
