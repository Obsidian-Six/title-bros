import mongoose from 'mongoose';

/**
 * ==============================================================================
 * Blog Post Schema
 * ==============================================================================
 * Supports full rich blog articles with dynamic, reorderable content blocks:
 * - Cover image + short description (with card character budgeting)
 * - Flexible sequence of blocks (text, image, heading, quote)
 * - Category, tags, read time, and view count tracking
 */
const contentBlockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'heading', 'quote'],
      required: true,
      default: 'text',
    },
    content: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      default: 'Car Title Loans',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Short description is required for card display'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      trim: true,
    },
    author: {
      name: {
        type: String,
        default: 'Title Bros Team',
      },
      role: {
        type: String,
        default: 'Automotive & Finance Specialist',
      },
      avatar: {
        type: String,
        default: '',
      },
    },
    readTime: {
      type: String,
      default: '4 min read',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'PUBLISHED',
    },
    blocks: {
      type: [contentBlockSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
blogPostSchema.index({ status: 1, createdAt: -1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ title: 'text', description: 'text' });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
