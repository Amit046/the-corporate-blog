import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalUsers, totalViews, recentPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.postView.count(),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { id: true, title: true, slug: true, publishedAt: true, _count: { select: { views: true } } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      stats: { totalPosts, publishedPosts, draftPosts, totalUsers, totalViews },
      recentPosts,
    });
  } catch (err) { next(err); }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    res.json(logs);
  } catch (err) { next(err); }
};
