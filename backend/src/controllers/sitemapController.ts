import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getSitemapXml = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const [posts, categories] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED', publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const urls: string[] = [
      `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${baseUrl}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      ...posts.map(p =>
        `<url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
      ),
      ...categories.map(c =>
        `<url><loc>${baseUrl}/blog/category/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};

export const getRobotsTxt = (req: Request, res: Response): void => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

Sitemap: ${baseUrl}/sitemap.xml`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
};
