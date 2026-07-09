import Blog from '../models/Blog.js';
import FAQ from '../models/FAQ.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middlewares/error.js';
import { uploadImage } from '../config/cloudinary.js';

// ==========================================
// BLOGS CONTROLLERS (Public & Admin CRUD)
// ==========================================

// Get all blogs (Public - Published only, Admin - All)
export const getBlogs = asyncHandler(async (req, res, next) => {
  const query = {};
  
  if (!req.user || req.user.role !== 'Admin') {
    query.status = 'Published';
  }

  const blogs = await Blog.find(query).populate('author', 'name').sort('-createdAt');
  res.status(200).json({ success: true, count: blogs.length, data: blogs });
});

// Get single blog by slug
export const getBlogBySlug = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  if (blog.status === 'Draft' && (!req.user || req.user.role !== 'Admin')) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.status(200).json({ success: true, data: blog });
});

// Create Blog (Admin)
export const createBlog = asyncHandler(async (req, res, next) => {
  const { title, content, summary, tags, status } = req.body;
  
  let coverImageUrl = '';
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, 'youngo_blogs');
    coverImageUrl = uploadResult.secure_url;
  }

  const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

  const blog = await Blog.create({
    title,
    content,
    summary,
    tags: parsedTags || [],
    status,
    coverImage: coverImageUrl,
    author: req.user.id
  });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_Blog',
    details: `Published blog post: ${title}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: blog });
});

// Update Blog (Admin)
export const updateBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let blog = await Blog.findById(id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  const updateData = { ...req.body };

  if (typeof updateData.tags === 'string') {
    updateData.tags = JSON.parse(updateData.tags);
  }

  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, 'youngo_blogs');
    updateData.coverImage = uploadResult.secure_url;
  }

  blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Update_Blog',
    details: `Updated blog post: ${blog.title}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: blog });
});

// Delete Blog (Admin)
export const deleteBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  await Blog.findByIdAndDelete(id);

  await AuditLog.create({
    admin: req.user.id,
    action: 'Delete_Blog',
    details: `Deleted blog: ${blog.title}`,
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, message: 'Blog post deleted' });
});

// ==========================================
// FAQ CONTROLLERS (Public & Admin CRUD)
// ==========================================

export const getFAQs = asyncHandler(async (req, res, next) => {
  const faqs = await FAQ.find().sort('-createdAt');
  res.status(200).json({ success: true, data: faqs });
});

export const createFAQ = asyncHandler(async (req, res, next) => {
  const { question, answer, category } = req.body;
  const faq = await FAQ.create({ question, answer, category });

  await AuditLog.create({
    admin: req.user.id,
    action: 'Create_FAQ',
    details: `Created FAQ question`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: faq });
});

export const updateFAQ = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!faq) {
    res.status(404);
    throw new Error('FAQ not found');
  }

  res.status(200).json({ success: true, data: faq });
});

export const deleteFAQ = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) {
    res.status(404);
    throw new Error('FAQ not found');
  }

  await FAQ.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: 'FAQ deleted' });
});
