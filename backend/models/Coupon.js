import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Percentage', 'Fixed'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    minPurchase: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 0 // For percentage type
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 100
    },
    usedCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Disabled'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
