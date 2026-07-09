import User from '../models/User.js';
import Order from '../models/Order.js';
import AITool from '../models/AITool.js';
import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';
import AuditLog from '../models/AuditLog.js';
import Settings from '../models/Settings.js';
import Wallet from '../models/Wallet.js';
import { asyncHandler } from '../middlewares/error.js';

// ==========================================
// ADMIN ANALYTICS CONTROLLERS
// ==========================================

export const getAdminDashboardStats = asyncHandler(async (req, res, next) => {
  // Counts
  const totalUsers = await User.countDocuments({ role: 'User' });
  const activeUsers = await User.countDocuments({ role: 'User', status: 'Active' });
  const totalTools = await AITool.countDocuments();
  
  // Revenue
  const completedOrders = await Order.find({ paymentStatus: 'Completed' });
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const totalOrders = await Order.countDocuments();
  const pendingPayments = await Payment.countDocuments({ status: 'Pending' });
  const activeSubs = await Subscription.countDocuments({ status: 'Active', expiresAt: { $gt: new Date() } });

  // Credits Used Today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayLogs = await UsageLog.find({ createdAt: { $gte: startOfDay } });
  const creditsUsedToday = todayLogs.reduce((sum, log) => sum + log.creditsDeducted, 0);

  // Monthly Revenue (current month)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const currentMonthOrders = await Order.find({
    paymentStatus: 'Completed',
    createdAt: { $gte: startOfMonth }
  });
  const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  // Recent usage activities
  const recentActivities = await UsageLog.find()
    .populate('user', 'name')
    .populate('tool', 'name')
    .sort('-createdAt')
    .limit(5);

  // Revenue analytics (Daily chart data for last 7 days)
  const revenueChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayOrders = await Order.find({
      paymentStatus: 'Completed',
      createdAt: { $gte: d, $lt: nextD }
    });
    const dayRev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    revenueChartData.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: dayRev
    });
  }

  // AI Tool Popularity based on Usage Logs
  const toolUsageData = [];
  const tools = await AITool.find().limit(5);
  for (const tool of tools) {
    const usageCount = await UsageLog.countDocuments({ tool: tool._id });
    toolUsageData.push({
      name: tool.name,
      value: usageCount
    });
  }

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        totalTools,
        totalRevenue,
        totalOrders,
        pendingPayments,
        activeSubs,
        creditsUsedToday,
        monthlyRevenue
      },
      recentOrders,
      recentActivities,
      charts: {
        revenue: revenueChartData,
        toolPopularity: toolUsageData
      }
    }
  });
});

// ==========================================
// USER DASHBOARD STATS CONTROLLERS
// ==========================================

export const getUserDashboardStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Wallet credits & loyalty points
  const wallet = await Wallet.findOne({ user: userId });

  // Subscriptions Count & Details
  const activeSubscriptions = await Subscription.find({
    user: userId,
    status: 'Active',
    expiresAt: { $gt: new Date() }
  }).populate('tool', 'name logo status');

  // Total Orders count
  const ordersCount = await Order.countDocuments({ user: userId });

  // Usage Logs counts
  const totalRequests = await UsageLog.countDocuments({ user: userId });

  // Recent usage
  const recentLogs = await UsageLog.find({ user: userId })
    .populate('tool', 'name logo')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      wallet: {
        credits: wallet ? wallet.totalCredits : 0,
        spent: wallet ? wallet.spentCredits : 0,
        loyaltyPoints: wallet ? wallet.loyaltyPoints : 0
      },
      activeSubscriptions,
      ordersCount,
      totalRequests,
      recentLogs
    }
  });
});

// ==========================================
// NOTIFICATIONS CONTROLLERS
// ==========================================

export const getNotifications = asyncHandler(async (req, res, next) => {
  // Return user's notifications and general system announcements
  const notifications = await Notification.find({
    $or: [{ user: req.user.id }, { user: null }]
  }).sort('-createdAt').limit(20);

  res.status(200).json({ success: true, data: notifications });
});

export const markNotificationsAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { $or: [{ user: req.user.id }, { user: null }] },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// ANNOUNCEMENT CONTROLLERS
// ==========================================

export const getActiveAnnouncements = asyncHandler(async (req, res, next) => {
  const currentDate = new Date();
  const announcements = await Announcement.find({
    isActive: true,
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate }
  }).sort('-createdAt');

  res.status(200).json({ success: true, data: announcements });
});

export const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, message, type, endDate } = req.body;

  const announcement = await Announcement.create({
    title,
    message,
    type,
    endDate: new Date(endDate)
  });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Announcement',
    details: `Created announcement: ${title}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: announcement });
});

// ==========================================
// SYSTEM SETTINGS & AUDIT LOGS (Admin)
// ==========================================

export const getAuditLogs = asyncHandler(async (req, res, next) => {
  const logs = await AuditLog.find()
    .populate('admin', 'name email')
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({ success: true, data: logs });
});

export const updateSettings = asyncHandler(async (req, res, next) => {
  const { key, value } = req.body;

  const setting = await Settings.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    admin: req.user.id,
    action: 'Update_Settings',
    details: `Updated settings key: ${key}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: setting });
});
