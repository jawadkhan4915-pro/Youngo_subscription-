import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AITool',
      required: true
    },
    creditsRemaining: {
      type: Number,
      required: true,
      default: 0
    },
    dailyUsed: {
      type: Number,
      default: 0
    },
    monthlyUsed: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Expired'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Compiles indexes to ensure fast subscription lookup & one active subscription per user per tool
subscriptionSchema.index({ user: 1, tool: 1 }, { unique: true });
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1, expiresAt: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
