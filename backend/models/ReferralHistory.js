import mongoose from 'mongoose';

const referralHistorySchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // A referee can only be referred once
    },
    rewardCredits: {
      type: Number,
      default: 20 // Default credit payout per referral
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Completed'
    }
  },
  {
    timestamps: true
  }
);

const ReferralHistory = mongoose.model('ReferralHistory', referralHistorySchema);
export default ReferralHistory;
