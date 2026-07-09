import express from 'express';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../controllers/blogController.js';
import { protect, authorize, optionalProtect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Blog Routes
router.get('/', optionalProtect, getBlogs);
router.get('/slug/:slug', optionalProtect, getBlogBySlug);
router.post('/', protect, authorize('Admin'), upload.single('coverImage'), createBlog);
router.put('/:id', protect, authorize('Admin'), upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, authorize('Admin'), deleteBlog);

// FAQ Routes
router.get('/faqs/all', getFAQs); // public FAQ fetch
router.post('/faqs', protect, authorize('Admin'), createFAQ);
router.put('/faqs/:id', protect, authorize('Admin'), updateFAQ);
router.delete('/faqs/:id', protect, authorize('Admin'), deleteFAQ);

export default router;
