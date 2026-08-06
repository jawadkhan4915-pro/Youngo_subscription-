import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTools,
  getToolDetails,
  createTool,
  updateTool,
  deleteTool,
  adjustUserCredits,
  addReview
} from '../controllers/toolController.js';
import { protect, authorize, optionalProtect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('Admin'), createCategory);
router.put('/categories/:id', protect, authorize('Admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('Admin'), deleteCategory);

// Credit & Review Routes (Must be before dynamic /:id)
router.post('/adjust-credits', protect, authorize('Admin'), adjustUserCredits);
router.post('/reviews', protect, addReview);

// Tool Routes
router.get('/', optionalProtect, getTools);
router.post('/', protect, authorize('Admin'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), createTool);
router.get('/:id', optionalProtect, getToolDetails);
router.put('/:id', protect, authorize('Admin'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateTool);
router.delete('/:id', protect, authorize('Admin'), deleteTool);

export default router;
