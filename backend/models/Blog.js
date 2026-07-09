import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    summary: {
      type: String,
      required: [true, 'Summary is required']
    },
    coverImage: {
      type: String,
      default: ''
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft'
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate slug from title
blogSchema.pre('save', function (next) {
  if (this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
