import { Router } from 'express';
import {
  getAllPublishedBlogs,
  getBlogBySlug,
  getAllAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImageFile,
} from '../controllers/blogController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { uploadBlogImage } from '../middlewares/blogUploadMiddleware.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/', getAllPublishedBlogs);
router.get('/:slug', getBlogBySlug);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/admin/all', getAllAdminBlogs);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.post('/upload-image', uploadBlogImage.single('image'), uploadBlogImageFile);

export default router;
