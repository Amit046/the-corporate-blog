'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { postsApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Block, Category, Post } from '@/types';
import ContentEditor from '@/components/dashboard/ContentEditor';
import clsx from 'clsx';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', bannerImage: '', bannerImageAlt: '',
    seoTitle: '', seoDescription: '', isSponsored: false,
    categoryIds: [] as string[], content: [] as Block[],
  });

  useEffect(() => {
    Promise.all([
      postsApi.getBySlug(params.id).catch(() => postsApi.getAll({ limit: 1 })),
      categoriesApi.getAll(),
    ]).catch(() => {});

    // Fetch by ID using a workaround
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?limit=100`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(r => r.json())
      .then(data => {
        const p = data.posts?.find((post: Post) => post.id === params.id);
        if (p) {
          setPost(p);
          setForm({
            title: p.title, slug: p.slug, excerpt: p.excerpt || '',
            bannerImage: p.bannerImage || '', bannerImageAlt: p.bannerImageAlt || '',
            seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '',
            isSponsored: p.isSponsored, content: p.content || [],
            categoryIds: p.categories?.map((c: any) => c.category.id) || [],
          });
        }
      })
      .finally(() => setLoading(false));

    categoriesApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, [params.id]);

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));
  const canPublish = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleSave = async () => {
    setSaving(true);
    try {
      await postsApi.update(params.id, form);
      toast.success('Saved!');
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await postsApi.update(params.id, form);
      await postsApi.publish(params.id);
      toast.success('Published! 🎉');
      router.push('/dashboard/posts');
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Publish failed'); }
    finally { setPublishing(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="text-center py-20"><p>Post not found.</p><Link href="/dashboard/posts" className="btn-primary mt-4">Back to Posts</Link></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/posts" className="text-ink-muted hover:text-ink"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-ink">Edit Post</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx('badge text-xs', post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                {post.status}
              </span>
              {post.status === 'PUBLISHED' && (
                <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
                  <Eye size={11} />View live
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm disabled:opacity-60">
            <Save size={14} />{saving ? 'Saving...' : 'Save'}
          </button>
          {canPublish && post.status !== 'PUBLISHED' && (
            <button onClick={handlePublish} disabled={publishing} className="btn-primary text-sm disabled:opacity-60">
              <Send size={14} />{publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {post.status === 'PUBLISHED' && (
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
              <CheckCircle size={14} />{saving ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(['content', 'seo', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px',
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-muted hover:text-ink')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-5">
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full text-3xl font-bold font-serif border-0 border-b-2 border-gray-100 focus:border-brand-300 outline-none py-2 bg-transparent" />
          <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
            placeholder="Excerpt..." className="input" rows={2} />
          <ContentEditor value={form.content} onChange={blocks => set('content', blocks)} />
        </div>
      )}

      {tab === 'seo' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className="label">SEO Title</label>
            <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder={form.title} className="input" maxLength={70} />
          </div>
          <div>
            <label className="label">Meta Description</label>
            <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} className="input" rows={3} maxLength={160} />
          </div>
          <div>
            <label className="label">Banner Image URL</label>
            <input value={form.bannerImage} onChange={e => set('bannerImage', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Banner Alt Text</label>
            <input value={form.bannerImageAlt} onChange={e => set('bannerImageAlt', e.target.value)} className="input" />
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className="label">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c.id} type="button"
                  onClick={() => {
                    const ids = form.categoryIds.includes(c.id) ? form.categoryIds.filter(id => id !== c.id) : [...form.categoryIds, c.id];
                    set('categoryIds', ids);
                  }}
                  className={clsx('badge cursor-pointer', form.categoryIds.includes(c.id) ? 'bg-brand-500 text-white' : 'bg-gray-100 text-ink-light hover:bg-brand-50 hover:text-brand-600')}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="sponsored" checked={form.isSponsored} onChange={e => set('isSponsored', e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="sponsored" className="text-sm font-medium text-ink-light cursor-pointer">Mark as sponsored content</label>
          </div>
        </div>
      )}
    </div>
  );
}
