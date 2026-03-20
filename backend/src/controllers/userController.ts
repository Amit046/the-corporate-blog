import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'WRITER', 'VIEWER']),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, slug: true, role: true, avatar: true, createdAt: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) { next(err); }
};

export const getUserBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const user = await prisma.user.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, bio: true, avatar: true, createdAt: true, _count: { select: { posts: true } } },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, email: true, name: true, slug: true, bio: true, avatar: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (id === req.user!.userId) throw new AppError('Cannot delete yourself', 400);
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};
