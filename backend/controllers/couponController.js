import Coupon from '../models/Coupon.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middlewares/error.js';

export const getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, data: coupons });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, type, value, minPurchase, maxDiscount, expiryDate, usageLimit } = req.body;

  const codeUpper = code.toUpperCase();
  const existing = await Coupon.findOne({ code: codeUpper });
  if (existing) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: codeUpper,
    type,
    value: Number(value),
    minPurchase: Number(minPurchase || 0),
    maxDiscount: Number(maxDiscount || 0),
    expiryDate: new Date(expiryDate),
    usageLimit: Number(usageLimit || 100)
  });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Coupon',
    details: `Created coupon code: ${codeUpper}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await Coupon.findByIdAndDelete(req.params.id);

  await AuditLog.create({
    admin: req.user.id,
    action: 'Delete_Coupon',
    details: `Deleted coupon code: ${coupon.code}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
});
