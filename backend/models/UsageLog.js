import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema(
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
    prompt: {
      type: String,
      required: true
    },
    creditsDeducted: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Success', 'Failed'],
      default: 'Success'
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const UsageLog = mongoose.model('UsageLog', usageLogSchema);
export default UsageLog;
