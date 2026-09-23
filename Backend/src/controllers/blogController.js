import BlogPost from '../models/BlogPost.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a clean URL slug from title
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Estimate read time from text and blocks
 */
function calculateReadTime(description, blocks = []) {
  let wordCount = (description || '').split(/\s+/).filter(Boolean).length;
  for (const b of blocks) {
    if (b.content) {
      wordCount += b.content.split(/\s+/).filter(Boolean).length;
    }
  }
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} min read`;
}

/**
 * Public: Get all published blog posts
 * GET /api/v1/blogs
 */
export const getAllPublishedBlogs = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;

  const query = { status: 'PUBLISHED' };

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { category: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    BlogPost.countDocuments(query),
  ]);

  // Extract available unique categories
  const categories = await BlogPost.distinct('category', { status: 'PUBLISHED' });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        categories: ['All', ...categories],
      },
      'Published blog posts retrieved successfully'
    )
  );
});

/**
 * Public: Get single blog post by slug
 * GET /api/v1/blogs/:slug
 */
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await BlogPost.findOneAndUpdate(
    { slug, status: 'PUBLISHED' },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!post) {
    throw new ApiError(404, `Blog post with slug '${slug}' not found`);
  }

  // Fetch related articles (same category or recent)
  const related = await BlogPost.find({
    _id: { $ne: post._id },
    status: 'PUBLISHED',
  })
    .sort({ category: post.category ? -1 : 1, createdAt: -1 })
    .limit(3)
    .select('title slug coverImage description category readTime createdAt')
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      { post, related },
      'Blog post retrieved successfully'
    )
  );
});

/**
 * Admin: Get all blogs (draft & published)
 * GET /api/v1/blogs/admin/all
 */
export const getAllAdminBlogs = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { category: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [posts, total, publishedCount, draftCount] = await Promise.all([
    BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    BlogPost.countDocuments(query),
    BlogPost.countDocuments({ status: 'PUBLISHED' }),
    BlogPost.countDocuments({ status: 'DRAFT' }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        counts: {
          all: total,
          published: publishedCount,
          draft: draftCount,
        },
      },
      'Admin blogs retrieved successfully'
    )
  );
});

/**
 * Admin: Create new blog post
 * POST /api/v1/blogs
 */
export const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    category = 'Car Title Loans',
    description,
    coverImage,
    author,
    readTime,
    status = 'PUBLISHED',
    blocks = [],
    tags = [],
  } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Title is required');
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, 'Description is required');
  }

  if (!coverImage || !coverImage.trim()) {
    throw new ApiError(400, 'Cover image is required');
  }

  let finalSlug = slug ? slugify(slug) : slugify(title);
  if (!finalSlug) {
    finalSlug = `post-${Date.now()}`;
  }

  // Ensure unique slug
  let slugExists = await BlogPost.findOne({ slug: finalSlug });
  if (slugExists) {
    finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const calculatedReadTime = readTime || calculateReadTime(description, blocks);

  const newPost = await BlogPost.create({
    title: title.trim(),
    slug: finalSlug,
    category: category.trim(),
    description: description.trim(),
    coverImage: coverImage.trim(),
    author: {
      name: author?.name?.trim() || req.user?.name || 'Title Bros Team',
      role: author?.role?.trim() || 'Automotive & Finance Specialist',
      avatar: author?.avatar || '',
    },
    readTime: calculatedReadTime,
    status,
    blocks: blocks.map((b, idx) => ({
      id: b.id || `blk-${idx}-${Date.now()}`,
      type: b.type || 'text',
      content: b.content || '',
      imageUrl: b.imageUrl || '',
      caption: b.caption || '',
      order: typeof b.order === 'number' ? b.order : idx,
    })),
    tags: Array.isArray(tags) ? tags : [],
  });

  return res.status(201).json(
    new ApiResponse(201, newPost, 'Blog post created successfully')
  );
});

/**
 * Admin: Update existing blog post
 * PUT /api/v1/blogs/:id
 */
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await BlogPost.findById(id);

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  const {
    title,
    slug,
    category,
    description,
    coverImage,
    author,
    readTime,
    status,
    blocks,
    tags,
  } = req.body;

  if (title) post.title = title.trim();
  if (category) post.category = category.trim();
  if (description) post.description = description.trim();
  if (coverImage) post.coverImage = coverImage.trim();
  if (status) post.status = status;
  if (tags) post.tags = Array.isArray(tags) ? tags : [];

  if (author) {
    post.author = {
      name: author.name || post.author.name,
      role: author.role || post.author.role,
      avatar: author.avatar || post.author.avatar,
    };
  }

  if (blocks) {
    post.blocks = blocks.map((b, idx) => ({
      id: b.id || `blk-${idx}-${Date.now()}`,
      type: b.type || 'text',
      content: b.content || '',
      imageUrl: b.imageUrl || '',
      caption: b.caption || '',
      order: typeof b.order === 'number' ? b.order : idx,
    }));
  }

  if (slug && slug !== post.slug) {
    let cleanSlug = slugify(slug);
    const existing = await BlogPost.findOne({ slug: cleanSlug, _id: { $ne: id } });
    if (existing) {
      cleanSlug = `${cleanSlug}-${Date.now()}`;
    }
    post.slug = cleanSlug;
  }

  post.readTime = readTime || calculateReadTime(post.description, post.blocks);

  await post.save();

  return res.status(200).json(
    new ApiResponse(200, post, 'Blog post updated successfully')
  );
});

/**
 * Admin: Delete blog post
 * DELETE /api/v1/blogs/:id
 */
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await BlogPost.findByIdAndDelete(id);

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Blog post deleted successfully')
  );
});

/**
 * Admin: Upload image for blog cover or content block
 * POST /api/v1/blogs/upload-image
 */
export const uploadBlogImageFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file uploaded');
  }

  const relativePath = `/uploads/blogs/${req.file.filename}`;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        filename: req.file.filename,
        path: relativePath,
        url: relativePath,
        size: req.file.size,
      },
      'Blog image uploaded successfully'
    )
  );
});
