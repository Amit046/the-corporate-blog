import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { createPostSchema, updatePostSchema } from '../validators/posts';
import { generateUniquePostSlug, calculateWordCount, calculateReadingTime } from '../utils/slug';
import { AuthRequest } from '../middleware/auth';

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  bannerImage: true,
  bannerImageAlt: true,
  status: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  isSponsored: true,
  readingTime: true,
  wordCount: true,
  publishedAt: true,
  scheduledAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, slug: true, avatar: true, bio: true } },
  categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { views: true } },
};

// GET /posts - list posts (published only for public)
export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const author = req.query.author as string;
    const status = req.query.status as string;

    const isAdmin = req.user && ['ADMIN', 'EDITOR'].includes(req.user.role);

    const where: any = {};

    if (!isAdmin || !status) {
      where.status = 'PUBLISHED';
      where.publishedAt = { not: null };
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }

    if (author) {
      where.author = { slug: author };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: postSelect,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/popular
export const getPopularPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        bannerImage: true, publishedAt: true, readingTime: true,
        author: { select: { name: true, slug: true } },
        _count: { select: { views: true } },
      },
      orderBy: { views: { _count: 'desc' } },
      take: limit,
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /posts/slug/:slug
export const getPostBySlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const isAdmin = req.user && ['ADMIN', 'EDITOR', 'WRITER'].includes(req.user.role);

    const where: any = { slug };
    if (!isAdmin) {
      where.status = 'PUBLISHED';
      where.publishedAt = { not: null };
    }

    const post = await prisma.post.findFirst({ where, select: postSelect });
    if (!post) throw new AppError('Post not found', 404);

    // Track view (fire and forget)
    const ip = req.ip || '';
    const ipHash = Buffer.from(ip).toString('base64').slice(0, 32);
    prisma.postView.upsert({
      where: {
        postId_ipHash_viewedAt: {
          postId: post.id,
          ipHash,
          viewedAt: new Date(new Date().toDateString()),
        },
      },
      create: {
        postId: post.id,
        ipHash,
        userAgent: req.headers['user-agent'],
        viewedAt: new Date(new Date().toDateString()),
      },
      update: {},
    }).catch(() => {});

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// POST /posts
export const createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createPostSchema.parse(req.body);
    const authorId = req.user!.userId;

    const slug = data.slug
      ? await generateUniquePostSlug(data.slug)
      : await generateUniquePostSlug(data.title);

    const wordCount = calculateWordCount(data.content as any[]);
    const readingTime = calculateReadingTime(wordCount);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        bannerImage: data.bannerImage,
        bannerImageAlt: data.bannerImageAlt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        isSponsored: data.isSponsored || false,
        wordCount,
        readingTime,
        authorId,
        categories: data.categoryIds ? {
          create: data.categoryIds.map((id) => ({ categoryId: id })),
        } : undefined,
      },
      select: postSelect,
    });

    await prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'post', entityId: post.id, userId: authorId, postId: post.id },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// PUT /posts/:id
export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updatePostSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new AppError('Post not found', 404);

    if (existing.authorId !== userId && !['ADMIN', 'EDITOR'].includes(userRole)) {
      throw new AppError('Forbidden', 403);
    }

    let wordCount = existing.wordCount;
    let readingTime = existing.readingTime;

    if (data.content) {
      wordCount = calculateWordCount(data.content as any[]);
      readingTime = calculateReadingTime(wordCount);
    }

    // Handle categories
    if (data.categoryIds) {
      await prisma.postCategory.deleteMany({ where: { postId: id } });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content && { content: data.content }),
        ...(data.bannerImage !== undefined && { bannerImage: data.bannerImage }),
        ...(data.bannerImageAlt !== undefined && { bannerImageAlt: data.bannerImageAlt }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        ...(data.isSponsored !== undefined && { isSponsored: data.isSponsored }),
        wordCount,
        readingTime,
        ...(data.categoryIds && {
          categories: {
            create: data.categoryIds.map((cid) => ({ categoryId: cid })),
          },
        }),
      },
      select: postSelect,
    });

    await prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'post', entityId: id, userId, postId: id },
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// PUT /posts/:id/publish
export const publishPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true, title: true, bannerImage: true, seoDescription: true, excerpt: true } });
    if (!post) throw new AppError('Post not found', 404);

    // Validate required fields
    if (!post.title) throw new AppError('Title is required to publish', 400);
    if (!post.bannerImage) throw new AppError('Banner image is required to publish', 400);
    if (!post.seoDescription && !post.excerpt) throw new AppError('SEO description or excerpt required to publish', 400);

    const updated = await prisma.post.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      select: postSelect,
    });

    await prisma.auditLog.create({
      data: { action: 'PUBLISH', entity: 'post', entityId: id, userId, postId: id },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /posts/:id
export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new AppError('Post not found', 404);

    if (existing.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    await prisma.post.update({ where: { id }, data: { status: 'ARCHIVED' } });
    await prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'post', entityId: id, userId, postId: id },
    });

    res.json({ message: 'Post archived successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /posts/:id/internal-suggestions
export const getInternalSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { categories: { select: { categoryId: true } } },
    });
    if (!post) throw new AppError('Post not found', 404);

    const categoryIds = post.categories.map((c) => c.categoryId);

    const suggestions = await prisma.post.findMany({
      where: {
        id: { not: id },
        status: 'PUBLISHED',
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      select: { id: true, title: true, slug: true, excerpt: true, bannerImage: true, publishedAt: true },
      take: 5,
    });

    res.json(suggestions);
  } catch (err) {
    next(err);
  }
};
