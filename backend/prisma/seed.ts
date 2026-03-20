import { PrismaClient, Role, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tcblog.com' },
    update: {},
    create: {
      email: 'admin@tcblog.com',
      password: hashedPassword,
      name: 'Admin User',
      slug: 'admin',
      bio: 'Platform administrator',
      role: Role.ADMIN,
    },
  });

  const writer = await prisma.user.upsert({
    where: { email: 'writer@tcblog.com' },
    update: {},
    create: {
      email: 'writer@tcblog.com',
      password: hashedPassword,
      name: 'Jane Writer',
      slug: 'jane-writer',
      bio: 'Content writer and SEO specialist',
      role: Role.WRITER,
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology', description: 'Tech news and insights' },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: { name: 'Business', slug: 'business', description: 'Business strategies and news' },
    }),
    prisma.category.upsert({
      where: { slug: 'startup' },
      update: {},
      create: { name: 'Startup', slug: 'startup', description: 'Startup ecosystem' },
    }),
  ]);

  // Create sample posts
  const sampleContent = [
    { type: 'heading', level: 2, text: 'Introduction' },
    { type: 'paragraph', text: 'This is a sample blog post created for demonstration purposes.' },
    { type: 'heading', level: 2, text: 'Key Points' },
    { type: 'list', items: ['First important point', 'Second important point', 'Third important point'] },
    { type: 'blockquote', text: 'Great things are not done by impulse, but by a series of small things brought together.' },
    { type: 'paragraph', text: 'We hope you enjoy reading our blog posts and find them valuable.' },
  ];

  const post1 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-nextjs-14' },
    update: {},
    create: {
      title: 'Getting Started with Next.js 14',
      slug: 'getting-started-with-nextjs-14',
      excerpt: 'A comprehensive guide to building modern web applications with Next.js 14 App Router.',
      content: sampleContent,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: 'Getting Started with Next.js 14 - Complete Guide',
      seoDescription: 'Learn how to build production-ready web apps with Next.js 14 App Router, Server Components, and more.',
      readingTime: 5,
      wordCount: 1200,
      authorId: writer.id,
      categories: {
        create: [{ categoryId: categories[0].id }],
      },
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'scaling-startup-to-1m-users' },
    update: {},
    create: {
      title: 'Scaling Your Startup to 1M Users',
      slug: 'scaling-startup-to-1m-users',
      excerpt: 'Practical strategies and architecture decisions for scaling your startup infrastructure.',
      content: sampleContent,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: 'How to Scale Your Startup to 1M Users',
      seoDescription: 'Learn the key architectural decisions and strategies to scale your startup from 0 to 1M daily active users.',
      readingTime: 8,
      wordCount: 2000,
      authorId: admin.id,
      categories: {
        create: [{ categoryId: categories[1].id }, { categoryId: categories[2].id }],
      },
    },
  });

  console.log('✅ Seeding complete!');
  console.log(`Created admin: ${admin.email} (password: Admin@123)`);
  console.log(`Created writer: ${writer.email} (password: Admin@123)`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created 2 published posts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
