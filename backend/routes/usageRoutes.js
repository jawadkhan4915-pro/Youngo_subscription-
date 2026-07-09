import express from 'express';
import { executeToolPrompt, getMyLogs } from '../controllers/usageController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/execute', protect, executeToolPrompt);
router.get('/my-logs', protect, getMyLogs);

export default router;
