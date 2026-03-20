import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { serverFetch } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';

export const revalidate = 900;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await serverFetch(`/categories/${params.slug}`);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} Articles`,
    description: category.description || `Browse all articles in ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const [category, data] = await Promise.all([
    serverFetch(`/categories/${params.slug}`),
    serverFetch(`/posts?category=${params.slug}&limit=12`),
  ]);
  if (!category) notFound();

  const posts = data?.posts || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/blog" className="flex items-center gap-1 text-sm text-ink-muted hover:text-brand-600 mb-6"><ArrowLeft size={14} />Back to Blog</Link>
      <div className="mb-10">
        <span className="badge bg-brand-50 text-brand-600 mb-3">Category</span>
        <h1 className="text-4xl font-bold font-serif text-ink mb-2">{category.name}</h1>
        {category.description && <p className="text-ink-muted">{category.description}</p>}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p: any) => <PostCard key={p.id} post={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-xl font-serif mb-2">No posts in this category yet</p>
          <Link href="/blog" className="btn-primary mt-4">Browse all posts</Link>
        </div>
      )}
    </div>
  );
}
