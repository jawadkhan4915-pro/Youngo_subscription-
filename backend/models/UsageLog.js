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

usageLogSchema.index({ user: 1, createdAt: -1 });
usageLogSchema.index({ tool: 1, createdAt: -1 });
usageLogSchema.index({ user: 1, tool: 1, createdAt: -1 });

const UsageLog = mongoose.model('UsageLog', usageLogSchema);
export default UsageLog;
