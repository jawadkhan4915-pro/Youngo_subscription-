import express from 'express';
import {
  checkout,
  applyCoupon,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  getPendingPayments,
  verifyPayment
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// User checkout & order routes
router.post('/checkout', protect, upload.single('receipt'), checkout);
router.post('/apply-coupon', protect, applyCoupon);
router.get('/my-orders', protect, getMyOrders);

// Admin verification routes
router.get('/admin/pending-payments', protect, authorize('Admin'), getPendingPayments);
router.post('/admin/verify-payment', protect, authorize('Admin'), verifyPayment);
router.get('/', protect, authorize('Admin'), getAllOrders);

// Dynamic ID route (Must be evaluated after static paths)
router.get('/:id', protect, getOrderDetails);

export default router;
