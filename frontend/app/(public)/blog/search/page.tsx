'use client';
import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { searchApi } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import { Post } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const { data } = await searchApi.search(q);
      setResults(data.posts || []);
      setSearched(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-4xl font-bold font-serif text-ink mb-2">Search</h1>
      <p className="text-ink-muted mb-8">Find articles across our entire library.</p>

      <form onSubmit={handleSubmit} className="relative mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="input pl-11 pr-28 py-3.5 text-base"
          autoFocus
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
            className="absolute right-24 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
            <X size={16} />
          </button>
        )}
        <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 py-2">Search</button>
      </form>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="shimmer aspect-video" />
              <div className="p-5 space-y-2">
                <div className="shimmer h-4 rounded w-1/4" />
                <div className="shimmer h-5 rounded w-full" />
                <div className="shimmer h-4 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <p className="text-sm text-ink-muted mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"</p>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-ink-muted">
              <p className="text-xl font-serif mb-2">No results found</p>
              <p className="text-sm mb-6">Try different keywords or browse all posts.</p>
              <Link href="/blog" className="btn-primary">Browse all posts</Link>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-16 text-ink-muted">
          <Search size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="font-serif text-xl mb-2">Start searching</p>
          <p className="text-sm">Enter a keyword to search our articles.</p>
        </div>
      )}
    </div>
  );
}
