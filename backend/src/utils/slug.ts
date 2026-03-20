import slugify from 'slug';
import prisma from '../config/prisma';

export const generateSlug = (text: string): string => {
  return slugify(text, { lower: true, trim: true });
};

export const generateUniquePostSlug = async (title: string, excludeId?: string): Promise<string> => {
  const base = generateSlug(title);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

export const generateUniqueUserSlug = async (name: string, excludeId?: string): Promise<string> => {
  const base = generateSlug(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

export const calculateReadingTime = (wordCount: number): number => {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const calculateWordCount = (content: any[]): number => {
  let count = 0;
  for (const block of content) {
    if (block.text) count += block.text.split(/\s+/).length;
    if (block.items) {
      for (const item of block.items) {
        count += item.split(/\s+/).length;
      }
    }
  }
  return count;
};
