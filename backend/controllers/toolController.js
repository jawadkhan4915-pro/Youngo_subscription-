import AITool from '../models/AITool.js';
import Category from '../models/Category.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middlewares/error.js';
import { uploadImage } from '../config/cloudinary.js';

// ==========================================
// CATEGORY CONTROLLERS (Admin CRUD, Public List)
// ==========================================

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
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

  const tools = await AITool.find(query).populate('category', 'name icon');
  res.status(200).json({ success: true, count: tools.length, data: tools });
});

// Get single tool details
export const getToolDetails = asyncHandler(async (req, res, next) => {
  const tool = await AITool.findById(req.params.id).populate('category', 'name icon');
  if (!tool) {
    res.status(404);
    throw new Error('AI Tool not found');
  }

  // Load reviews for this tool
  const reviews = await Review.find({ tool: tool._id }).populate('user', 'name avatar');

  // Check if user has an active subscription to this tool
  let isSubscribed = false;
  let remainingUserCredits = 0;
  if (req.user) {
    const sub = await Subscription.findOne({ user: req.user.id, tool: tool._id, status: 'Active' });
    if (sub && sub.expiresAt > Date.now()) {
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
  const { name, category, price, creditsPerPurchase, description, features, rules, maxDailyLimit, maxMonthlyLimit, remainingCredits } = req.body;

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
    banner: bannerUrl
  });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Tool',
    details: `Created AI Tool: ${name}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: tool });
});

// Update AI Tool (Admin)
export const updateTool = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let tool = await AITool.findById(id);

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
