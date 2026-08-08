import mongoose from 'mongoose';

const aiToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'AI Tool name is required'],
      unique: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'AI Tool category is required']
    },
    price: {
      type: Number,
      required: [true, 'AI Tool price is required'],
      min: [0, 'Price cannot be negative']
    },
    creditsPerPurchase: {
      type: Number,
      required: [true, 'Credits amount is required'],
      default: 100
    },
    description: {
      type: String,
      required: [true, 'AI Tool description is required']
    },
    features: {
      type: [String],
      default: []
    },
    logo: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    screenshots: {
      type: [String],
      default: []
    },
    tutorialUrl: {
      type: String,
      default: ''
    },
    rules: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Maintenance', 'Inactive', 'Hidden'],
      default: 'Available'
    },
    maxDailyLimit: {
      type: Number,
      default: 50 // Limit user queries per day
    },
    maxMonthlyLimit: {
      type: Number,
      default: 1000 // Limit user queries per month
    },
    remainingCredits: {
      type: Number,
      default: 10000 // Admin's shared account remaining credits pool
    },
    resetDate: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // Next month first day
    },

    // ── AI Agent API Configuration ─────────────────────────────────────────────
    // These fields allow each tool to use its own dedicated API key & provider.
    // Priority chain: tool.apiKey → global GEMINI_API_KEY → smart simulation

    apiType: {
      type: String,
      enum: ['none', 'openai', 'gemini', 'anthropic', 'elevenlabs', 'custom'],
      default: 'none'
    },
    // apiKey stored with select:false — NEVER returned in standard GET responses
    apiKey: {
      type: String,
      default: '',
      select: false
    },
    // Optional: specific model name override (e.g. "gpt-4o", "claude-3-5-sonnet-20241022")
    apiModel: {
      type: String,
      default: ''
    },
    // Optional: custom REST endpoint URL (used when apiType = 'custom')
    apiEndpoint: {
      type: String,
      default: ''
    },
    // Tracks whether the stored API key has been successfully verified
    apiStatus: {
      type: String,
      enum: ['unverified', 'verified', 'invalid', 'none'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

const AITool = mongoose.model('AITool', aiToolSchema);
export default AITool;
