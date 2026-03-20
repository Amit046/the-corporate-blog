import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q.trim()) {
      res.json({ posts: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      return;
    }

    const where = {
      status: 'PUBLISHED' as const,
      publishedAt: { not: null as any },
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { excerpt: { contains: q, mode: 'insensitive' as const } },
        { seoDescription: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          bannerImage: true, publishedAt: true, readingTime: true,
          author: { select: { name: true, slug: true } },
          categories: { select: { category: { select: { name: true, slug: true } } } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      query: q,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};
