import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { serverFetch } from '@/lib/api';
import BlockRenderer from '@/components/blog/BlockRenderer';
import { Post } from '@/types';

export const revalidate = 900;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post: Post | null = await serverFetch(`/posts/slug/${params.slug}`);
  if (!post) return { title: 'Post Not Found' };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: post.canonicalUrl || url },
    openGraph: {
      title,
      description: description || '',
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.bannerImage ? [{ url: post.bannerImage, alt: post.bannerImageAlt || title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || '',
      images: post.bannerImage ? [post.bannerImage] : [],
    },
  };
}

function TableOfContents({ blocks }: { blocks: any[] }) {
  const headings = blocks.filter(b => b.type === 'heading' && (b.level === 2 || b.level === 3));
  if (headings.length < 2) return null;
  return (
    <div className="card p-5 mb-8 bg-paper-soft">
      <h3 className="font-bold font-serif text-base mb-3">Table of Contents</h3>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} className={`text-sm ${h.level === 3 ? 'ml-4' : ''}`}>
            <span className="text-brand-600 hover:underline cursor-pointer">{h.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function PostPage({ params }: Props) {
  const post: Post | null = await serverFetch(`/posts/slug/${params.slug}`);
  if (!post || post.status !== 'PUBLISHED') notFound();

  const suggestions: Post[] = await serverFetch(`/posts/${post.id}/internal-suggestions`) || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.bannerImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author.name, url: `${siteUrl}/blog/author/${post.author.slug}` },
    publisher: { '@type': 'Organization', name: 'The Corporate Blog' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 2, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link href="/blog" className="hover:text-brand-600 flex items-center gap-1"><ArrowLeft size={14} />Blog</Link>
          {post.categories[0] && (
            <>
              <span>/</span>
              <Link href={`/blog/category/${post.categories[0].category.slug}`} className="hover:text-brand-600">{post.categories[0].category.name}</Link>
            </>
          )}
        </nav>

        {post.isSponsored && (
          <div className="badge bg-yellow-100 text-yellow-700 mb-4">Sponsored Content</div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-ink mb-6 leading-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted mb-8 pb-8 border-b border-gray-100">
          <Link href={`/blog/author/${post.author.slug}`} className="flex items-center gap-2 hover:text-brand-600">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{post.author.name[0]}</div>
            <span className="font-medium text-ink">{post.author.name}</span>
          </Link>
          {post.publishedAt && <span className="flex items-center gap-1"><Calendar size={14} />{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>}
          {post.readingTime && <span className="flex items-center gap-1"><Clock size={14} />{post.readingTime} min read</span>}
          {post._count && <span className="flex items-center gap-1"><Eye size={14} />{post._count.views} views</span>}
          {post.categories.map(({ category }) => (
            <Link key={category.slug} href={`/blog/category/${category.slug}`} className="flex items-center gap-1 badge bg-brand-50 text-brand-600 hover:bg-brand-100">
              <Tag size={11} />{category.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2">
            {post.bannerImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
                <Image src={post.bannerImage} alt={post.bannerImageAlt || post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 700px" />
              </div>
            )}
            {post.excerpt && <p className="text-lg text-ink-muted italic mb-8 leading-relaxed border-l-4 border-brand-200 pl-4">{post.excerpt}</p>}
            <BlockRenderer blocks={post.content} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <TableOfContents blocks={post.content} />

            {/* Author card */}
            <div className="card p-5">
              <h3 className="font-bold font-serif text-base mb-3">About the Author</h3>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-bold shrink-0">{post.author.name[0]}</div>
                <div>
                  <Link href={`/blog/author/${post.author.slug}`} className="font-semibold text-ink hover:text-brand-600">{post.author.name}</Link>
                  {post.author.bio && <p className="text-sm text-ink-muted mt-1 leading-relaxed">{post.author.bio}</p>}
                </div>
              </div>
            </div>

            {/* Related posts */}
            {suggestions.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold font-serif text-base mb-4">Related Articles</h3>
                <div className="space-y-3">
                  {suggestions.map((s: any) => (
                    <Link key={s.id} href={`/blog/${s.slug}`} className="block group">
                      <p className="text-sm font-medium text-ink group-hover:text-brand-600 transition-colors line-clamp-2">{s.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
