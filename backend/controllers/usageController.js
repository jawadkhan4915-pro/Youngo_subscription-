import Subscription from '../models/Subscription.js';
import AITool from '../models/AITool.js';
import UsageLog from '../models/UsageLog.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middlewares/error.js';
import axios from 'axios';

// @desc    Execute AI Tool Prompt (Playground proxy)
// @route   POST /api/usage/execute
// @access  Private
export const executeToolPrompt = asyncHandler(async (req, res, next) => {
  const { toolId, prompt } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error('Please enter a prompt or instruction');
  }

  // 1. Fetch AI Tool details
  const tool = await AITool.findById(toolId);
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  if (tool.status === 'Inactive' || tool.status === 'Hidden') {
    res.status(403);
    throw new Error('This tool is currently unavailable');
  }

  // 2. Fetch User's Subscription
  const sub = await Subscription.findOne({ user: req.user.id, tool: toolId, status: 'Active' });
  if (!sub || sub.expiresAt < Date.now()) {
    res.status(403);
    throw new Error('You do not have an active subscription for this tool. Please purchase a plan.');
  }

  // Determine Credit Cost
  // Default: 1 credit for standard chat/productivity/coding, 5 credits for image/voice/video tools
  const categoryName = tool.name.toLowerCase();
  let creditCost = 1;
  if (
    categoryName.includes('midjourney') ||
    categoryName.includes('leonardo') ||
    categoryName.includes('elevenlabs') ||
    categoryName.includes('runway') ||
    categoryName.includes('kling') ||
    categoryName.includes('pika') ||
    categoryName.includes('suno') ||
    categoryName.includes('udio')
  ) {
    creditCost = 5;
  }

  if (sub.creditsRemaining < creditCost) {
    res.status(403);
    throw new Error(`Insufficient credits! This action requires ${creditCost} credits, but you have ${sub.creditsRemaining} remaining.`);
  }

  // 3. Check Daily Usage Limits
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyLogsCount = await UsageLog.countDocuments({
    user: req.user.id,
    tool: toolId,
    createdAt: { $gte: startOfDay }
  });

  if (dailyLogsCount >= tool.maxDailyLimit) {
    res.status(429);
    throw new Error(`Daily limit exceeded! You have reached your limit of ${tool.maxDailyLimit} requests per day for this tool.`);
  }

  // 4. Call real API or use Mock fallback
  let responseData = '';
  let status = 'Success';

  try {
    if (tool.name.includes('Gemini') && process.env.GEMINI_API_KEY) {
      // Call real Google Gemini API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );
      responseData = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini API';
    } else if (tool.name.includes('ChatGPT') && process.env.OPENAI_API_KEY) {
      // Call OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
        }
      );
      responseData = response.data?.choices?.[0]?.message?.content || 'No response from OpenAI API';
    } else {
      // Fallback: Smart Simulated Responses tailored per tool
      responseData = getSimulatedResponse(tool.name, prompt);
    }
  } catch (error) {
    console.error(`External API error for ${tool.name}:`, error.message);
    // Graceful fallback to simulator if real API calls fail
    responseData = `[API Offline Fallback] ${getSimulatedResponse(tool.name, prompt)}`;
  }

  // 5. Deduct Credits
  sub.creditsRemaining -= creditCost;
  sub.dailyUsed += creditCost;
  sub.monthlyUsed += creditCost;
  await sub.save();

  // 6. Log usage & transaction ledger
  await UsageLog.create({
    user: req.user.id,
    tool: toolId,
    prompt: prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt,
    creditsDeducted: creditCost,
    status: status,
    ipAddress: req.ip
  });

  await Transaction.create({
    user: req.user.id,
    type: 'Credit_Deduction',
    amount: creditCost,
    description: `Spent ${creditCost} credits in ${tool.name} playground`,
    referenceId: toolId.toString()
  });

  res.status(200).json({
    success: true,
    tool: tool.name,
    creditsSpent: creditCost,
    creditsRemaining: sub.creditsRemaining,
    result: responseData
  });
});

// Helper: Customized high-quality simulated mock responses
function getSimulatedResponse(toolName, prompt) {
  const name = toolName.toLowerCase();

  if (name.includes('chatgpt') || name.includes('gemini') || name.includes('claude') || name.includes('grok') || name.includes('perplexity')) {
    return `### **${toolName} Response Summary**\n\nHere is a professionally structured response based on your query: *"${prompt}"*\n\n1. **Core Concept**: To accomplish this, we utilize a robust modular setup. We split logical units into stateless services and cache configuration details.\n2. **Optimization Checklist**:\n   - Set appropriate indexing on target variables\n   - Minimize database roundtrips by using aggregated pipelines\n   - Keep client interactions clean and lightweight\n\n*This response was processed securely using Youngo's premium shared subscription.*`;
  }

  if (name.includes('midjourney') || name.includes('leonardo') || name.includes('designer') || name.includes('dall')) {
    const seed = Math.floor(Math.random() * 1000);
    return `### **Midjourney Art Generation**\n\nSuccessfully generated high-resolution 4K render for: *"${prompt}"*\n\n- **Parameters**: \`--v 6.0 --ar 16:9 --style raw --q 2\`\n- **Model**: Midjourney Premium Engine\n\n![Generated Image](https://picsum.photos/seed/art-${seed}/800/450)\n\n*Click right-click to download high-resolution render asset.*`;
  }

  if (name.includes('elevenlabs') || name.includes('suno') || name.includes('udio')) {
    return `### **ElevenLabs Voice Generation**\n\nSynthesized audio output for script: *"${prompt.substring(0, 60)}..."*\n\n- **Voice Model**: Rachel (Cloned/High Quality)\n- **Format**: MP3 Stereo (320kbps)\n- **Stability**: 75% | Clarity: 90%\n\n🔊 **[Youngo Mock Audio File]**: [Click here to listen](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3) (Demo audio player simulation loaded in client)`;
  }

  if (name.includes('copilot') || name.includes('cursor') || name.includes('windsurf') || name.includes('replit') || name.includes('codeium')) {
    return `### **Cursor IDE AI Assistance**\n\nGenerated clean implementation block based on request: *"${prompt}"*:\n\n\`\`\`javascript\n// Optimized function generated by ${toolName}\nconst processSubscriptions = async (users) => {\n  const activeSubs = await Subscription.find({ status: 'Active' });\n  return activeSubs.map(sub => ({\n    id: sub.user,\n    credits: sub.creditsRemaining,\n    expires: sub.expiresAt\n  }));\n};\n\`\`\`\n\n- **Optimization**: O(N) complexity with memory abstraction layers.`;
  }

  return `### **Youngo AI Shared Response**\n\nExecuted request on **${toolName}** shared node.\n\nResult:\nSuccessfully ran prompt: *"${prompt}"*.\nAll variables returned status code 200 OK.`;
}

// @desc    Get user's complete usage history logs
// @route   GET /api/usage/my-logs
// @access  Private
export const getMyLogs = asyncHandler(async (req, res, next) => {
  const logs = await UsageLog.find({ user: req.user.id })
    .populate('tool', 'name logo')
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({
    success: true,
    data: logs
  });
});
