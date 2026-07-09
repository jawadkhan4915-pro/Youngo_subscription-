import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import AITool from '../models/AITool.js';
import Coupon from '../models/Coupon.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middlewares/error.js';
import { uploadImage } from '../config/cloudinary.js';

// @desc    Create new order and submit manual payment details
// @route   POST /api/orders/checkout
// @access  Private
export const checkout = asyncHandler(async (req, res, next) => {
  const { items, paymentMethod, transactionId, couponCode } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in checkout');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload payment proof receipt screenshot');
  }

  // Calculate order price
  let rawTotal = 0;
  const orderItems = [];

  for (const item of items) {
    const tool = await AITool.findById(item.toolId);
    if (!tool) {
      res.status(404);
      throw new Error(`AI Tool with ID ${item.toolId} not found`);
    }
    rawTotal += tool.price;
    orderItems.push({
      tool: tool._id,
      name: tool.name,
      price: tool.price,
      credits: tool.creditsPerPurchase
    });
  }

  // Apply Coupon if exists
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'Active' });
    if (coupon && coupon.expiryDate > Date.now() && coupon.usedCount < coupon.usageLimit) {
      if (rawTotal >= coupon.minPurchase) {
        if (coupon.type === 'Percentage') {
          discount = (rawTotal * coupon.value) / 100;
          if (coupon.maxDiscount > 0) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, rawTotal); // Discount cannot exceed raw price

        // Increment coupon use
        coupon.usedCount += 1;
        if (coupon.usedCount >= coupon.usageLimit) {
          coupon.status = 'Expired';
        }
        await coupon.save();
      }
    }
  }

  const finalAmount = rawTotal - discount;

  // Upload receipt proof to Cloudinary
  const uploadResult = await uploadImage(req.file.buffer, 'youngo_receipts');

  // Create Order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount: finalAmount,
    paymentMethod,
    couponCode: couponCode ? couponCode.toUpperCase() : '',
    discountApplied: discount,
    paymentStatus: 'Pending'
  });

  // Create Payment record
  await Payment.create({
    order: order._id,
    user: req.user.id,
    screenshotUrl: uploadResult.secure_url,
    transactionId: transactionId,
    status: 'Pending'
  });

  // Notify admin (mock/real Notification)
  await Notification.create({
    user: null, // Admin wide alert
    title: 'New Manual Payment Order',
    message: `User ${req.user.name} submitted an order worth ${finalAmount} PKR using ${paymentMethod}.`,
    type: 'Payment'
  });

  res.status(201).json({
    success: true,
    message: 'Order submitted. Wait for payment verification by the Admin.',
    order
  });
});

// @desc    Apply Coupon check
// @route   POST /api/orders/apply-coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, amount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'Active' });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or inactive coupon code');
  }

  if (coupon.expiryDate < Date.now()) {
    coupon.status = 'Expired';
    await coupon.save();
    res.status(400);
    throw new Error('Coupon has expired');
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    coupon.status = 'Expired';
    await coupon.save();
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const minPurchase = coupon.minPurchase || 0;
  if (amount < minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of ${minPurchase} PKR required to use this coupon`);
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Get user's order history
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Get single order and manual payment status details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure owner or admin is requesting
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  const payment = await Payment.findOne({ order: order._id }).populate('verifiedBy', 'name');

  res.status(200).json({
    success: true,
    order,
    payment
  });
});

// ==========================================
// ADMIN CONTROLLERS (Order & Payment Verification)
// ==========================================

// Get all orders (Admin)
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// Get pending manual payments (Admin)
export const getPendingPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ status: 'Pending' })
    .populate('user', 'name email')
    .populate('order')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: payments });
});

// Verify manual payment (Admin approval)
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { paymentId, status, notes } = req.body; // status: 'Approved' or 'Rejected'

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (payment.status !== 'Pending') {
    res.status(400);
    throw new Error('Payment has already been processed');
  }

  const order = await Order.findById(payment.order);
  if (!order) {
    res.status(404);
    throw new Error('Associated order not found');
  }

  payment.status = status;
  payment.notes = notes || '';
  payment.verifiedBy = req.user.id;
  payment.verifiedAt = Date.now();
  await payment.save();

  if (status === 'Approved') {
    // 1. Mark Order Completed
    order.paymentStatus = 'Completed';
    // Generate simulated invoice link
    order.invoiceUrl = `/api/orders/${order._id}/invoice/download`;
    await order.save();

    // 2. Allocate subscriptions and credits to User
    const userWallet = await Wallet.findOne({ user: order.user });
    let totalPurchasedCredits = 0;

    for (const item of order.items) {
      totalPurchasedCredits += item.credits;

      // Check if subscription exists, otherwise create it
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // 30 days duration

      let sub = await Subscription.findOne({ user: order.user, tool: item.tool });

      if (sub) {
        // Extend subscription credits and reset expiration
        sub.creditsRemaining += item.credits;
        sub.expiresAt = expiry;
        sub.status = 'Active';
      } else {
        // Create new
        sub = new Subscription({
          user: order.user,
          tool: item.tool,
          creditsRemaining: item.credits,
          expiresAt: expiry,
          status: 'Active'
        });
      }
      await sub.save();

      // Log subscription transaction
      await Transaction.create({
        user: order.user,
        type: 'Purchase',
        amount: item.credits,
        description: `Purchased ${item.name} access subscription`,
        referenceId: item.tool.toString()
      });
    }

    // 3. Update User overall Wallet credits & add loyalty points (1 point per 10 PKR spent)
    if (userWallet) {
      userWallet.totalCredits += totalPurchasedCredits;
      userWallet.loyaltyPoints += Math.floor(order.totalAmount / 10);
      await userWallet.save();
    }

    // 4. Create Audit Log
    await AuditLog.create({
      admin: req.user.id,
      action: 'Approve_Payment',
      details: `Approved payment for order ${order.orderId}. Credited ${totalPurchasedCredits} credits to user wallet.`,
      ipAddress: req.ip
    });

    // 5. Send notification to user
    await Notification.create({
      user: order.user,
      title: 'Payment Receipt Verified!',
      message: `Your payment of ${order.totalAmount} PKR for order ${order.orderId} was verified. Your credits have been allocated.`,
      type: 'Payment'
    });
  } else {
    // Rejected flow
    order.paymentStatus = 'Cancelled';
    await order.save();

    await AuditLog.create({
      admin: req.user.id,
      action: 'Reject_Payment',
      details: `Rejected payment for order ${order.orderId}. Reason: ${notes || 'No reason provided.'}`,
      ipAddress: req.ip
    });

    await Notification.create({
      user: order.user,
      title: 'Payment Receipt Rejected',
      message: `Your payment of ${order.totalAmount} PKR for order ${order.orderId} was rejected. Reason: ${notes || 'Receipt mismatch.'}`,
      type: 'Payment'
    });
  }

  res.status(200).json({
    success: true,
    message: `Payment status set to ${status}`,
    order
  });
});
