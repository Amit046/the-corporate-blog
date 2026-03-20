'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, Users, BookOpen, Plus, ArrowRight } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    analyticsApi.stats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Posts', value: stats.stats.totalPosts, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Published', value: stats.stats.publishedPosts, icon: BookOpen, color: 'bg-green-50 text-green-600' },
    { label: 'Drafts', value: stats.stats.draftPosts, icon: FileText, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Views', value: stats.stats.totalViews, icon: Eye, color: 'bg-purple-50 text-purple-600' },
    { label: 'Writers', value: stats.stats.totalUsers, icon: Users, color: 'bg-pink-50 text-pink-600' },
  ] : [];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-ink">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-ink-muted text-sm mt-1">Here's what's happening on your blog.</p>
        </div>
        <Link href="/dashboard/posts/new" className="btn-primary"><Plus size={16} />New Post</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-5 shimmer h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-ink">{value?.toLocaleString()}</p>
              <p className="text-xs text-ink-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.recentPosts?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold font-serif text-lg">Recent Posts</h2>
            <Link href="/dashboard/posts" className="text-sm text-brand-600 hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {stats.recentPosts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <Link href={`/dashboard/posts/${p.id}`} className="font-medium text-ink hover:text-brand-600 text-sm">{p.title}</Link>
                  {p.publishedAt && <p className="text-xs text-ink-muted mt-0.5">{format(new Date(p.publishedAt), 'MMM d, yyyy')}</p>}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span className="flex items-center gap-1"><Eye size={12} />{p._count?.views || 0}</span>
                  <Link href={`/blog/${p.slug}`} target="_blank" className="text-brand-600 hover:underline">View →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
