'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, CheckCircle, Clock, Archive } from 'lucide-react';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const statusBadge: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};
const statusIcon: Record<string, any> = {
  PUBLISHED: CheckCircle,
  DRAFT: Clock,
  ARCHIVED: Archive,
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      const { data } = await postsApi.getAll(params);
      setPosts(data.posts || []);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const handlePublish = async (id: string) => {
    try {
      await postsApi.publish(id);
      toast.success('Post published!');
      fetchPosts();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed to publish'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this post?')) return;
    try {
      await postsApi.delete(id);
      toast.success('Post archived');
      fetchPosts();
    } catch { toast.error('Failed to archive'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif text-ink">Posts</h1>
        <Link href="/dashboard/posts/new" className="btn-primary"><Plus size={16} />New Post</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {['all', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', filter === s ? 'bg-white shadow text-ink' : 'text-ink-muted hover:text-ink')}>
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-4 shimmer h-16" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-xl font-serif mb-3">No posts found</p>
          <Link href="/dashboard/posts/new" className="btn-primary">Create your first post</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden md:table-cell">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden lg:table-cell">Views</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => {
                const StatusIcon = statusIcon[post.status];
                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/posts/${post.id}`} className="font-medium text-ink hover:text-brand-600 text-sm line-clamp-1">{post.title}</Link>
                      <p className="text-xs text-ink-muted">{post.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`badge ${statusBadge[post.status]} flex items-center gap-1 w-fit`}>
                        <StatusIcon size={11} />{post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-sm text-ink-muted">{post.author.name}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-ink-muted">
                      {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-ink-muted"><Eye size={12} />{post._count?.views || 0}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {post.status === 'DRAFT' && (user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                          <button onClick={() => handlePublish(post.id)} title="Publish" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {post.status === 'PUBLISHED' && (
                          <Link href={`/blog/${post.slug}`} target="_blank" title="View" className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <Eye size={15} />
                          </Link>
                        )}
                        <Link href={`/dashboard/posts/${post.id}`} title="Edit" className="p-1.5 text-ink-muted hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => handleDelete(post.id)} title="Archive" className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
