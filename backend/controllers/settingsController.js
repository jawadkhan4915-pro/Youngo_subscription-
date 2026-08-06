import mongoose from 'mongoose';
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
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middlewares/error.js';

// ==========================================
// ADMIN ANALYTICS CONTROLLERS
// ==========================================

export const getAdminDashboardStats = asyncHandler(async (req, res, next) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Execute all aggregated DB operations in parallel
  const [
    totalUsers,
    activeUsers,
    totalTools,
    totalOrders,
    pendingPayments,
    activeSubs,
    totalRevenueAgg,
    monthlyRevenueAgg,
    creditsUsedTodayAgg,
    recentOrders,
    recentActivities,
    totalRevenueChartAgg,
    toolUsageAgg
  ] = await Promise.all([
    User.countDocuments({ role: 'User' }),
    User.countDocuments({ role: 'User', status: 'Active' }),
    AITool.countDocuments(),
    Order.countDocuments(),
    Payment.countDocuments({ status: 'Pending' }),
    Subscription.countDocuments({ status: 'Active', expiresAt: { $gt: new Date() } }),
    Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'Completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    UsageLog.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$creditsDeducted' } } }
    ]),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(5).lean(),
    UsageLog.find().populate('user', 'name').populate('tool', 'name').sort('-createdAt').limit(5).lean(),
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    UsageLog.aggregate([
      { $group: { _id: "$tool", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ])
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const creditsUsedToday = creditsUsedTodayAgg[0]?.total || 0;

  // Build 7-day revenue map for missing dates
  const revenueMap = new Map(totalRevenueChartAgg.map(item => [item._id, item.revenue]));
  const revenueChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const formattedLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    revenueChartData.push({
      date: formattedLabel,
      revenue: revenueMap.get(dateStr) || 0
    });
  }

  // Populate tool popularity chart
  const toolIds = toolUsageAgg.map(t => t._id).filter(Boolean);
  const toolDocs = await AITool.find({ _id: { $in: toolIds } }).select('name').lean();
  const toolMap = new Map(toolDocs.map(t => [t._id.toString(), t.name]));

  const toolUsageData = toolUsageAgg.map(item => ({
    name: item._id ? (toolMap.get(item._id.toString()) || 'Unknown Tool') : 'Unknown Tool',
    value: item.value
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
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    wallet,
    activeSubscriptions,
    ordersCount,
    totalRequests,
    recentLogs,
    dailyUsage,
    toolUsage
  ] = await Promise.all([
    Wallet.findOne({ user: userId }).lean(),
    Subscription.find({
      user: userId,
      status: 'Active',
      expiresAt: { $gt: new Date() }
    }).populate('tool', 'name logo status').lean(),
    Order.countDocuments({ user: userId }),
    UsageLog.countDocuments({ user: userId }),
    UsageLog.find({ user: userId })
      .populate('tool', 'name logo')
      .sort('-createdAt')
      .limit(5)
      .lean(),
    UsageLog.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          creditsSpent: { $sum: "$creditsDeducted" },
          requestsCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    UsageLog.aggregate([
      {
        $match: {
          user: userObjectId
        }
      },
      {
        $group: {
          _id: "$tool",
          creditsSpent: { $sum: "$creditsDeducted" },
          requestsCount: { $sum: 1 }
        }
      }
    ])
  ]);

  // Batch populate tool details in 1 single query (eliminates N+1 loop)
  const toolIds = toolUsage.map(item => item._id).filter(Boolean);
  const toolsInfo = await AITool.find({ _id: { $in: toolIds } }).select('name logo').lean();
  const toolMap = new Map(toolsInfo.map(t => [t._id.toString(), t.name]));

  const populatedToolUsage = toolUsage.map((item) => ({
    toolName: item._id ? (toolMap.get(item._id.toString()) || 'Unknown') : 'Unknown',
    creditsSpent: item.creditsSpent,
    requestsCount: item.requestsCount
  }));

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
      recentLogs,
      dailyUsage,
      toolUsage: populatedToolUsage
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
  }).sort('-createdAt').limit(20).lean();

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
  }).sort('-createdAt').lean();

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
    .limit(100)
    .lean();

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
  const settings = await Settings.find({ key: { $in: keys } }).lean();
  
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

  // Conversion: 10 loyalty points = 1 wallet credit
  const creditsToAward = Math.floor(parsedPoints / 10);
  if (creditsToAward <= 0) {
    res.status(400);
    throw new Error('Conversion failed. A minimum of 10 loyalty points is required to redeem 1 credit.');
  }

  const pointsUsed = creditsToAward * 10;

  // Atomic Update with concurrency guard (prevents double redemption exploits)
  const updatedWallet = await Wallet.findOneAndUpdate(
    { user: req.user.id, loyaltyPoints: { $gte: pointsUsed } },
    {
      $inc: {
        loyaltyPoints: -pointsUsed,
        totalCredits: creditsToAward
      }
    },
    { new: true }
  );

  if (!updatedWallet) {
    res.status(400);
    throw new Error('Insufficient loyalty points or concurrent transaction conflict!');
  }

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
      loyaltyPoints: updatedWallet.loyaltyPoints,
      totalCredits: updatedWallet.totalCredits
    }
  });
});
