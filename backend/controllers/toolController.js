import AITool from '../models/AITool.js';
import Category from '../models/Category.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middlewares/error.js';
import { uploadImage } from '../config/cloudinary.js';
import axios from 'axios';

// ==========================================
// CATEGORY CONTROLLERS (Admin CRUD, Public List)
// ==========================================

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().lean();
  res.status(200).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, icon, description } = req.body;
  const category = await Category.create({ name, icon, description });

  // Log admin action
  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Category',
    details: `Created category: ${name}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, icon, description } = req.body;

  let category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.name = name || category.name;
  category.icon = icon || category.icon;
  category.description = description || category.description;
  await category.save();

  await AuditLog.create({
    admin: req.user.id,
    action: 'Update_Category',
    details: `Updated category: ${category.name}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if tools belong to this category
  const toolsCount = await AITool.countDocuments({ category: id });
  if (toolsCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category: ${toolsCount} tools belong to it.`);
  }

  await Category.findByIdAndDelete(id);

  await AuditLog.create({
    admin: req.user.id,
    action: 'Delete_Category',
    details: `Deleted category ID: ${id}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'Category deleted' });
});

// ==========================================
// AI TOOL CONTROLLERS (Admin CRUD, Public List)
// ==========================================

// Get all tools (with filtering)
export const getTools = asyncHandler(async (req, res, next) => {
  const { category, search, status } = req.query;
  const query = {};

  // For public users, only return active/available tools
  if (!req.user || req.user.role !== 'Admin') {
    query.status = { $in: ['Available', 'Busy', 'Maintenance'] };
  } else if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const tools = await AITool.find(query).populate('category', 'name icon').lean();
  res.status(200).json({ success: true, count: tools.length, data: tools });
});

// Get single tool details
export const getToolDetails = asyncHandler(async (req, res, next) => {
  const tool = await AITool.findById(req.params.id).populate('category', 'name icon').lean();
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  // Load reviews for this tool
  const reviews = await Review.find({ tool: tool._id }).populate('user', 'name avatar').lean();

  // Check if user has an active subscription to this tool
  let isSubscribed = false;
  let remainingUserCredits = 0;
  if (req.user) {
    const sub = await Subscription.findOne({ user: req.user.id, tool: tool._id, status: 'Active' }).lean();
    if (sub && new Date(sub.expiresAt).getTime() > Date.now()) {
      isSubscribed = true;
      remainingUserCredits = sub.creditsRemaining;
    }
  }

  res.status(200).json({
    success: true,
    data: tool,
    reviews,
    subscription: {
      isSubscribed,
      remainingUserCredits
    }
  });
});

// Create AI Tool (Admin)
export const createTool = asyncHandler(async (req, res, next) => {
  const {
    name, category, price, creditsPerPurchase, description,
    features, rules, maxDailyLimit, maxMonthlyLimit, remainingCredits,
    // API Configuration fields
    apiType, apiKey, apiModel, apiEndpoint
  } = req.body;

  // Process features & rules arrays if stringified
  const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
  const parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules;

  let logoUrl = '';
  let bannerUrl = '';

  // Process file uploads
  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      const uploadResult = await uploadImage(req.files.logo[0].buffer, 'youngo_logos');
      logoUrl = uploadResult.secure_url;
    }
    if (req.files.banner && req.files.banner[0]) {
      const uploadResult = await uploadImage(req.files.banner[0].buffer, 'youngo_banners');
      bannerUrl = uploadResult.secure_url;
    }
  }

  // Determine API status based on provided key
  const resolvedApiType = apiType || 'none';
  const hasApiKey = apiKey && apiKey.trim().length > 0;

  const tool = await AITool.create({
    name,
    category,
    price: Number(price),
    creditsPerPurchase: Number(creditsPerPurchase),
    description,
    features: parsedFeatures || [],
    rules: parsedRules || [],
    maxDailyLimit: Number(maxDailyLimit || 50),
    maxMonthlyLimit: Number(maxMonthlyLimit || 1000),
    remainingCredits: Number(remainingCredits || 10000),
    logo: logoUrl,
    banner: bannerUrl,
    // API config
    apiType: resolvedApiType,
    apiKey: hasApiKey ? apiKey.trim() : '',
    apiModel: apiModel ? apiModel.trim() : '',
    apiEndpoint: apiEndpoint ? apiEndpoint.trim() : '',
    apiStatus: hasApiKey ? 'unverified' : 'none'
  });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Tool',
    details: `Created AI Tool: ${name} (API: ${resolvedApiType}${hasApiKey ? ' — key provided' : ' — no key'})`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: tool });
});

// Update AI Tool (Admin)
export const updateTool = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let tool = await AITool.findById(id).select('+apiKey');

  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  const updateData = { ...req.body };

  // Parse arrays if stringified
  if (typeof updateData.features === 'string') updateData.features = JSON.parse(updateData.features);
  if (typeof updateData.rules === 'string') updateData.rules = JSON.parse(updateData.rules);

  // File uploads
  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      const uploadResult = await uploadImage(req.files.logo[0].buffer, 'youngo_logos');
      updateData.logo = uploadResult.secure_url;
    }
    if (req.files.banner && req.files.banner[0]) {
      const uploadResult = await uploadImage(req.files.banner[0].buffer, 'youngo_banners');
      updateData.banner = uploadResult.secure_url;
    }
  }

  // Handle API key update: if new key is provided, reset status to unverified
  if (updateData.apiKey !== undefined) {
    const newKey = (updateData.apiKey || '').trim();
    if (newKey.length > 0) {
      updateData.apiKey = newKey;
      updateData.apiStatus = 'unverified'; // Requires re-verification
    } else {
      // Empty key submitted — keep existing key (don't overwrite with blank)
      delete updateData.apiKey;
    }
  }

  // If apiType changed to 'none', clear the key
  if (updateData.apiType === 'none') {
    updateData.apiKey = '';
    updateData.apiStatus = 'none';
  }

  tool = await AITool.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Update_Tool',
    details: `Updated AI Tool: ${tool.name}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: tool });
});

// Delete AI Tool (Admin)
export const deleteTool = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const tool = await AITool.findById(id);
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  await AITool.findByIdAndDelete(id);

  await AuditLog.create({
    admin: req.user.id,
    action: 'Delete_Tool',
    details: `Deleted AI Tool: ${tool.name}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'AI Tool deleted successfully' });
});

// ==========================================
// TEST TOOL API — Admin: Verify API Key Works
// @route   POST /api/tools/:id/test-api
// @access  Private (Admin)
// ==========================================
export const testToolAPI = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Fetch with apiKey selected (it's normally hidden)
  const tool = await AITool.findById(id).select('+apiKey');
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  // If API type is none or no key provided, return immediately
  if (tool.apiType === 'none' || !tool.apiKey || tool.apiKey.trim() === '') {
    res.status(400);
    throw new Error('No API key configured for this tool. Please add an API key first.');
  }

  const testPrompt = 'Respond with exactly: "API connection successful."';
  let testResult = '';
  let success = false;
  let errorMessage = '';

  try {
    switch (tool.apiType) {
      case 'openai':
        testResult = await testOpenAI(tool.apiKey, tool.apiModel || 'gpt-3.5-turbo', testPrompt);
        break;
      case 'gemini':
        testResult = await testGemini(tool.apiKey, testPrompt);
        break;
      case 'anthropic':
        testResult = await testAnthropic(tool.apiKey, tool.apiModel || 'claude-3-haiku-20240307', testPrompt);
        break;
      case 'elevenlabs':
        testResult = await testElevenLabs(tool.apiKey);
        break;
      case 'custom':
        testResult = await testCustomEndpoint(tool.apiKey, tool.apiEndpoint, testPrompt);
        break;
      default:
        throw new Error(`Unsupported API type: ${tool.apiType}`);
    }

    success = true;

    // Mark the key as verified in DB
    await AITool.findByIdAndUpdate(id, { apiStatus: 'verified' });

  } catch (err) {
    errorMessage = err.response?.data?.error?.message
      || err.response?.data?.message
      || err.message
      || 'API test failed';

    // Mark as invalid
    await AITool.findByIdAndUpdate(id, { apiStatus: 'invalid' });
  }

  await AuditLog.create({
    admin: req.user.id,
    action: 'Test_Tool_API',
    details: `Tested API for ${tool.name} (${tool.apiType}): ${success ? 'VERIFIED' : 'FAILED — ' + errorMessage}`,
    ipAddress: req.ip
  });

  res.status(200).json({
    success,
    apiType: tool.apiType,
    apiModel: tool.apiModel,
    testResult: success ? testResult : null,
    error: success ? null : errorMessage,
    apiStatus: success ? 'verified' : 'invalid'
  });
});

// ── Internal API Test Helpers ──────────────────────────────────────────────────

async function testOpenAI(apiKey, model, prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000
    }
  );
  return response.data?.choices?.[0]?.message?.content || 'OK';
}

async function testGemini(apiKey, prompt) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 50 } },
    { timeout: 15000 }
  );
  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
}

async function testAnthropic(apiKey, model, prompt) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );
  return response.data?.content?.[0]?.text || 'OK';
}

async function testElevenLabs(apiKey) {
  // Just verify the key by fetching available voices
  const response = await axios.get('https://api.elevenlabs.io/v1/user/subscription', {
    headers: { 'xi-api-key': apiKey },
    timeout: 10000
  });
  const tier = response.data?.tier || 'unknown';
  return `ElevenLabs account verified. Plan: ${tier}`;
}

async function testCustomEndpoint(apiKey, endpoint, prompt) {
  if (!endpoint || !endpoint.startsWith('http')) {
    throw new Error('Custom endpoint URL is invalid or missing');
  }
  const response = await axios.post(
    endpoint,
    { prompt, message: prompt },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000
    }
  );
  return JSON.stringify(response.data).substring(0, 200);
}

// Adjust tool subscription credits for user manually (Admin)
export const adjustUserCredits = asyncHandler(async (req, res, next) => {
  const { userId, toolId, action, credits } = req.body; // Action: 'increase', 'decrease', 'reset'

  const sub = await Subscription.findOne({ user: userId, tool: toolId });
  if (!sub) {
    res.status(404);
    throw new Error('User does not have an active subscription for this tool');
  }

  const parsedCredits = Number(credits);
  const oldCredits = sub.creditsRemaining;

  if (action === 'increase') {
    sub.creditsRemaining += parsedCredits;
  } else if (action === 'decrease') {
    sub.creditsRemaining = Math.max(0, sub.creditsRemaining - parsedCredits);
  } else if (action === 'reset') {
    const tool = await AITool.findById(toolId);
    sub.creditsRemaining = tool ? tool.creditsPerPurchase : 100;
  }

  await sub.save();

  await AuditLog.create({
    admin: req.user.id,
    action: 'Adjust_Credits',
    details: `Adjusted user (${userId}) credits for tool (${toolId}) from ${oldCredits} to ${sub.creditsRemaining}`,
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'User credits updated successfully',
    creditsRemaining: sub.creditsRemaining
  });
});

// ==========================================
// REVIEW CONTROLLERS (User add rating)
// ==========================================

export const addReview = asyncHandler(async (req, res, next) => {
  const { toolId, rating, comment } = req.body;

  // Verify that the user has a subscription to this tool
  const sub = await Subscription.findOne({ user: req.user.id, tool: toolId });
  if (!sub) {
    res.status(403);
    throw new Error('You must purchase/subscribe to this tool before writing a review.');
  }

  // Create or update review
  const review = await Review.findOneAndUpdate(
    { tool: toolId, user: req.user.id },
    { rating: Number(rating), comment },
    { new: true, upsert: true }
  );

  res.status(201).json({ success: true, data: review });
});
