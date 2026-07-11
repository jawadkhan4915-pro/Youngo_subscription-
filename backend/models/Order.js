import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        tool: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'AITool',
          required: true
        },
        name: String,
        price: Number,
        credits: Number
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'Crypto', 'Stripe'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Refunded'],
      default: 'Pending'
    },
    couponCode: {
      type: String,
      default: ''
    },
    discountApplied: {
      type: Number,
      default: 0
    },
    invoiceUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
