import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';

const createAffiliateSchema = z.object({
  slug: z.string().min(2).max(100),
  targetUrl: z.string().url(),
  postId: z.string().uuid().optional(),
});

export const redirectAffiliate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const link = await prisma.affiliateLink.findUnique({ where: { slug } });
    if (!link) throw new AppError('Link not found', 404);

    await prisma.affiliateLink.update({
      where: { slug },
      data: { clicks: { increment: 1 } },
    });

    res.redirect(302, link.targetUrl);
  } catch (err) { next(err); }
};

export const createAffiliateLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createAffiliateSchema.parse(req.body);
    const link = await prisma.affiliateLink.create({ data });
    res.status(201).json(link);
  } catch (err) { next(err); }
};

export const getAffiliateLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const links = await prisma.affiliateLink.findMany({ orderBy: { clicks: 'desc' } });
    res.json(links);
  } catch (err) { next(err); }
};
