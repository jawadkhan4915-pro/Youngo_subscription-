import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Credit_Deduction', 'Refund', 'Purchase', 'Referral_Reward', 'Loyalty_Claim'],
      required: true
    },
    amount: {
      type: Number,
      required: true // Credits or currency value
    },
    description: {
      type: String,
      required: true
    },
    referenceId: {
      type: String, // ID of the tool, order, or ticket
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
