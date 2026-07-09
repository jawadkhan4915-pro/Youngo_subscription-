import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketDetails,
  replyTicket,
  getAllTickets,
  assignTicket,
  closeTicket
} from '../controllers/supportController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.post('/reply', protect, replyTicket);
router.post('/close/:id', protect, closeTicket);

// Admin endpoints
router.get('/', protect, authorize('Admin'), getAllTickets);
router.post('/assign', protect, authorize('Admin'), assignTicket);

// Detailed fetch (must go at the end to prevent conflict with other paths)
router.get('/:id', protect, getTicketDetails);

export default router;
