import express from 'express';
import {
  getAdminDashboardStats,
  getUserDashboardStats,
  getNotifications,
  markNotificationsAsRead,
  getActiveAnnouncements,
  createAnnouncement,
  getAuditLogs,
  updateSettings
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

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

export default router;
