import { z } from 'zod';

const blockSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'list', 'blockquote', 'image', 'table', 'youtube', 'faq', 'callout', 'code']),
  level: z.number().optional(),
  text: z.string().optional(),
  items: z.array(z.string()).optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  rows: z.array(z.array(z.string())).optional(),
  headers: z.array(z.string()).optional(),
  videoId: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  variant: z.string().optional(),
  language: z.string().optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  content: z.array(blockSchema),
  bannerImage: z.string().url().optional().or(z.literal('')),
  bannerImageAlt: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  isSponsored: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const publishPostSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
