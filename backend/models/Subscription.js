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

// Compiles a compound index to ensure one active subscription per user per tool
subscriptionSchema.index({ user: 1, tool: 1 }, { unique: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
