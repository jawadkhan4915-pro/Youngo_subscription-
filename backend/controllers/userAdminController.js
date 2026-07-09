import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middlewares/error.js';

// Get all users (Admin only)
export const getUsers = asyncHandler(async (req, res, next) => {
  const { search, status } = req.query;
  const query = { role: 'User' };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).sort('-createdAt');
  
  // Package users with their wallets
  const usersWithWallets = [];
  for (const user of users) {
    const wallet = await Wallet.findOne({ user: user._id });
    usersWithWallets.push({
      ...user.toObject(),
      wallet: wallet ? { totalCredits: wallet.totalCredits, spentCredits: wallet.spentCredits } : { totalCredits: 0, spentCredits: 0 }
    });
  }

  res.status(200).json({ success: true, count: usersWithWallets.length, data: usersWithWallets });
});

// Update user details (Admin only)
export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, status, role } = req.body;

  let user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const oldStatus = user.status;
  
  user.name = name || user.name;
  user.email = email || user.email;
  user.status = status || user.status;
  user.role = role || user.role;
  await user.save();

  // Audit log if status changed
  if (status && status !== oldStatus) {
    await AuditLog.create({
      admin: req.user.id,
      action: 'Change_User_Status',
      details: `Changed status of user ${user.email} from ${oldStatus} to ${status}`,
      ipAddress: req.ip
    });
  }

  res.status(200).json({ success: true, data: user });
});

// Delete user account (Admin only)
export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(id);
  await Wallet.findOneAndDelete({ user: id });
  await Subscription.deleteMany({ user: id });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Delete_User',
    details: `Deleted user: ${user.email}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// Reset overall user wallet credits (Admin only)
export const resetUserWalletCredits = asyncHandler(async (req, res, next) => {
  const { userId, credits } = req.body;

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    res.status(404);
    throw new Error('User wallet not found');
  }

  const oldCredits = wallet.totalCredits;
  wallet.totalCredits = Number(credits || 0);
  await wallet.save();

  await AuditLog.create({
    admin: req.user.id,
    action: 'Reset_Wallet_Credits',
    details: `Reset wallet credits for user ID ${userId} from ${oldCredits} to ${wallet.totalCredits}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'User wallet reset successfully', data: wallet });
});

// Get user specific purchase history (Admin only)
export const getUserPurchases = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const orders = await Order.find({ user: id }).sort('-createdAt');
  res.status(200).json({ success: true, data: orders });
});
