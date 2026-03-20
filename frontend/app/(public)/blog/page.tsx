import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import { Post, PostsResponse } from '@/types';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles on business, technology, and startups.',
};

export default async function BlogPage() {
  const [data, popularData, categoriesData] = await Promise.all([
    serverFetch('/posts?limit=12') as Promise<PostsResponse | null>,
    serverFetch('/posts/popular?limit=5') as Promise<Post[] | null>,
    serverFetch('/categories') as Promise<any[] | null>,
  ]);

  const posts = data?.posts || [];
  const popular = popularData || [];
  const categories = categoriesData || [];
  const [featured, ...rest] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-ink mb-3">The Corporate Blog</h1>
        <p className="text-ink-muted text-lg">Insights, strategies, and ideas for modern professionals.</p>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/blog" className="badge bg-ink text-white">All</Link>
          {categories.map((c: any) => (
            <Link key={c.slug} href={`/blog/category/${c.slug}`} className="badge bg-gray-100 hover:bg-brand-50 hover:text-brand-600 transition-colors text-ink-light">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {featured && <PostCard post={featured} featured />}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rest.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
          {posts.length === 0 && (
            <div className="text-center py-20 text-ink-muted">
              <p className="text-xl font-serif mb-2">No posts yet</p>
              <p className="text-sm">Check back soon for new content.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Popular */}
          {popular.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold font-serif text-lg mb-4 pb-2 border-b border-gray-100">🔥 Trending</h2>
              <div className="space-y-4">
                {popular.map((p: any, i: number) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="flex gap-3 group">
                    <span className="text-2xl font-bold font-serif text-gray-200 group-hover:text-brand-200 transition-colors w-8 shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-ink group-hover:text-brand-600 transition-colors line-clamp-2">{p.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{p._count?.views || 0} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold font-serif text-lg mb-4 pb-2 border-b border-gray-100">Categories</h2>
              <div className="space-y-1">
                {categories.map((c: any) => (
                  <Link key={c.slug} href={`/blog/category/${c.slug}`} className="flex items-center justify-between py-2 hover:text-brand-600 transition-colors group">
                    <span className="text-sm text-ink-light group-hover:text-brand-600">{c.name}</span>
                    <span className="badge bg-gray-100 text-ink-muted text-xs">{c._count?.postCategories || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search CTA */}
          <div className="card p-5 bg-brand-50 border-brand-100">
            <h3 className="font-bold text-ink mb-2">Looking for something?</h3>
            <p className="text-sm text-ink-muted mb-4">Search all our articles instantly.</p>
            <Link href="/blog/search" className="btn-primary w-full justify-center text-sm">Search Articles</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
