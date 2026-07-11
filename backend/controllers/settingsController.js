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
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Generate 7-day date ranges for parallel queries
  const dayRanges = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    dayRanges.push({ d, nextD });
  }

  // Query counts, stats, recent data, and daily charts in parallel
  const [
    totalUsers,
    activeUsers,
    totalTools,
    completedOrders,
    totalOrders,
    pendingPayments,
    activeSubs,
    todayLogs,
    currentMonthOrders,
    recentOrders,
    recentActivities,
    tools,
    ...dayOrdersResults
  ] = await Promise.all([
    User.countDocuments({ role: 'User' }),
    User.countDocuments({ role: 'User', status: 'Active' }),
    AITool.countDocuments(),
    Order.find({ paymentStatus: 'Completed' }),
    Order.countDocuments(),
    Payment.countDocuments({ status: 'Pending' }),
    Subscription.countDocuments({ status: 'Active', expiresAt: { $gt: new Date() } }),
    UsageLog.find({ createdAt: { $gte: startOfDay } }),
    Order.find({ paymentStatus: 'Completed', createdAt: { $gte: startOfMonth } }),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(5),
    UsageLog.find().populate('user', 'name').populate('tool', 'name').sort('-createdAt').limit(5),
    AITool.find().limit(5),
    // Spread 7-day order queries
    ...dayRanges.map(range => Order.find({
      paymentStatus: 'Completed',
      createdAt: { $gte: range.d, $lt: range.nextD }
    }))
  ]);

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const creditsUsedToday = todayLogs.reduce((sum, log) => sum + log.creditsDeducted, 0);
  const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Map 7-day revenue chart data
  const revenueChartData = dayOrdersResults.map((dayOrders, index) => {
    const { d } = dayRanges[index];
    const dayRev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: dayRev
    };
  });

  // Query tool usage counts in parallel
  const toolPromises = tools.map(tool => UsageLog.countDocuments({ tool: tool._id }));
  const toolCounts = await Promise.all(toolPromises);
  const toolUsageData = tools.map((tool, index) => ({
    name: tool.name,
    value: toolCounts[index]
  }));

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

// @desc    Get all public system settings
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = asyncHandler(async (req, res, next) => {
  const keys = ['bank_account', 'easypaisa_number', 'jazzcash_number', 'maintenance_mode'];
  const settings = await Settings.find({ key: { $in: keys } });
  
  const settingsMap = {};
  // Set default fallbacks matching standard developer config
  settingsMap['bank_account'] = '1234-5678-9012';
  settingsMap['easypaisa_number'] = '0300-1234567';
  settingsMap['jazzcash_number'] = '0312-7654321';
  settingsMap['maintenance_mode'] = false;

  settings.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  res.status(200).json({ success: true, data: settingsMap });
});

// @desc    Update batch admin settings
// @route   POST /api/settings/admin/settings/batch
// @access  Private/Admin
export const updateBatchSettings = asyncHandler(async (req, res, next) => {
  const settingsObj = req.body;

  for (const [key, value] of Object.entries(settingsObj)) {
    // Cast value types properly
    let finalValue = value;
    if (key === 'maintenance_mode') {
      finalValue = value === true || value === 'true';
    }

    await Settings.findOneAndUpdate(
      { key },
      { value: finalValue },
      { new: true, upsert: true }
    );
  }

  await AuditLog.create({
    admin: req.user.id,
    action: 'Update_Settings_Batch',
    details: `Updated settings batch keys: ${Object.keys(settingsObj).join(', ')}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'Settings batch updated successfully' });
});

// @desc    Redeem loyalty points for wallet credits
// @route   POST /api/settings/wallet/redeem-loyalty
// @access  Private
export const redeemLoyaltyPoints = asyncHandler(async (req, res, next) => {
  const { points } = req.body;
  const parsedPoints = Number(points);

  if (!parsedPoints || parsedPoints <= 0 || isNaN(parsedPoints)) {
    res.status(400);
    throw new Error('Please enter a valid amount of loyalty points to redeem.');
  }

  const wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  if (wallet.loyaltyPoints < parsedPoints) {
    res.status(400);
    throw new Error(`Insufficient loyalty points! You have ${wallet.loyaltyPoints} points, but requested ${parsedPoints}.`);
  }

  // Conversion: 10 loyalty points = 1 wallet credit
  const creditsToAward = Math.floor(parsedPoints / 10);
  if (creditsToAward <= 0) {
    res.status(400);
    throw new Error('Conversion failed. A minimum of 10 loyalty points is required to redeem 1 credit.');
  }

  const pointsUsed = creditsToAward * 10;
  wallet.loyaltyPoints -= pointsUsed;
  wallet.totalCredits += creditsToAward;
  await wallet.save();

  // Audit transaction log
  await Transaction.create({
    user: req.user.id,
    type: 'Loyalty_Claim',
    amount: creditsToAward,
    description: `Redeemed ${pointsUsed} loyalty points for ${creditsToAward} wallet credits.`,
    referenceId: ''
  });

  res.status(200).json({
    success: true,
    message: `Successfully redeemed ${pointsUsed} loyalty points for ${creditsToAward} wallet credits!`,
    data: {
      loyaltyPoints: wallet.loyaltyPoints,
      totalCredits: wallet.totalCredits
    }
  });
});
