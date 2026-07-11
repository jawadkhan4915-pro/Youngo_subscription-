import express from 'express';
import {
  getAdminDashboardStats,
  getUserDashboardStats,
  getNotifications,
  markNotificationsAsRead,
  getActiveAnnouncements,
  createAnnouncement,
  getAuditLogs,
  updateSettings,
  getPublicSettings,
  updateBatchSettings,
  redeemLoyaltyPoints
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public Settings query
router.get('/public', getPublicSettings);

// Stats endpoints
router.get('/admin/stats', protect, authorize('Admin'), getAdminDashboardStats);
router.get('/user/stats', protect, getUserDashboardStats);

// Notification endpoints
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markNotificationsAsRead);

// Announcement endpoints
router.get('/announcements', getActiveAnnouncements);
router.post('/announcements', protect, authorize('Admin'), createAnnouncement);

// Audit & Settings endpoints
router.get('/admin/audit-logs', protect, authorize('Admin'), getAuditLogs);
router.post('/admin/settings', protect, authorize('Admin'), updateSettings);
router.post('/admin/settings/batch', protect, authorize('Admin'), updateBatchSettings);

// Wallet points redemption
router.post('/wallet/redeem-loyalty', protect, redeemLoyaltyPoints);

export default router;
