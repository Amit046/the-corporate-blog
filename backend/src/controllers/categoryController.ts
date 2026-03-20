import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { postCategories: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) throw new AppError('Category not found', 404);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = generateSlug(data.name);

    const category = await prisma.category.create({
      data: { name: data.name, slug, description: data.description },
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = categorySchema.partial().parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug: generateSlug(data.name) }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
