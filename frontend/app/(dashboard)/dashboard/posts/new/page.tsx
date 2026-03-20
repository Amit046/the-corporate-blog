'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Send, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { postsApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Block, Category } from '@/types';
import ContentEditor from '@/components/dashboard/ContentEditor';
import clsx from 'clsx';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function wordCount(blocks: Block[]) {
  return blocks.reduce((acc, b) => {
    if (b.text) acc += b.text.split(/\s+/).filter(Boolean).length;
    if (b.items) acc += b.items.join(' ').split(/\s+/).filter(Boolean).length;
    return acc;
  }, 0);
}

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    bannerImage: '',
    bannerImageAlt: '',
    seoTitle: '',
    seoDescription: '',
    isSponsored: false,
    categoryIds: [] as string[],
    content: [] as Block[],
  });

  const wc = wordCount(form.content);
  const readingTime = Math.ceil(wc / 200);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.title && !form.slug) {
      setForm(f => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title]);

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (savedId) {
        await postsApi.update(savedId, payload);
        toast.success('Draft saved!');
      } else {
        const { data } = await postsApi.create(payload);
        setSavedId(data.id);
        toast.success('Draft saved!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!form.bannerImage) { toast.error('Banner image required to publish'); return; }
    if (!form.seoDescription && !form.excerpt) { toast.error('SEO description or excerpt required'); return; }
    setPublishing(true);
    try {
      let id = savedId;
      if (!id) {
        const { data } = await postsApi.create(form);
        id = data.id;
        setSavedId(id);
      } else {
        await postsApi.update(id!, form);
      }
      await postsApi.publish(id!);
      toast.success('Post published! 🎉');
      router.push('/dashboard/posts');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to publish');
    } finally { setPublishing(false); }
  };

  const canPublish = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/posts" className="text-ink-muted hover:text-ink"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-ink">New Post</h1>
            <p className="text-xs text-ink-muted mt-0.5">{wc} words · {readingTime} min read</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm disabled:opacity-60">
            <Save size={14} />{saving ? 'Saving...' : 'Save Draft'}
          </button>
          {canPublish && (
            <button onClick={handlePublish} disabled={publishing} className="btn-primary text-sm disabled:opacity-60">
              <Send size={14} />{publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
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
          <div>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Post title..." className="w-full text-3xl font-bold font-serif border-0 border-b-2 border-gray-100 focus:border-brand-300 outline-none py-2 bg-transparent placeholder-gray-300 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted shrink-0">Slug:</span>
            <input value={form.slug} onChange={e => set('slug', slugify(e.target.value))}
              className="text-sm text-brand-600 border-0 border-b border-dashed border-gray-200 focus:outline-none focus:border-brand-400 bg-transparent flex-1" />
          </div>
          <div>
            <label className="label">Excerpt / Summary</label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
              placeholder="Brief summary of this post..." className="input" rows={2} maxLength={500} />
            <p className="text-xs text-ink-muted mt-1">{form.excerpt.length}/500</p>
          </div>
          <div>
            <label className="label">Content Blocks</label>
            <ContentEditor value={form.content} onChange={blocks => set('content', blocks)} />
          </div>
        </div>
      )}

      {tab === 'seo' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card p-4 bg-blue-50 border-blue-100 flex gap-3">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Good SEO improves your post's ranking. Fill all fields for best results.</p>
          </div>
          <div>
            <label className="label">SEO Title <span className="text-ink-muted font-normal">(max 60 chars)</span></label>
            <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)}
              placeholder={form.title || "SEO optimised title..."} className="input" maxLength={70} />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-ink-muted">Leave blank to use post title</p>
              <p className={clsx('text-xs', form.seoTitle.length > 60 ? 'text-red-500' : 'text-ink-muted')}>{form.seoTitle.length}/60</p>
            </div>
          </div>
          <div>
            <label className="label">Meta Description <span className="text-ink-muted font-normal">(max 160 chars)</span></label>
            <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)}
              placeholder="Compelling description for search results..." className="input" rows={3} maxLength={160} />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-ink-muted">Aim for 120–160 characters</p>
              <p className={clsx('text-xs', form.seoDescription.length > 155 ? 'text-yellow-500' : 'text-ink-muted')}>{form.seoDescription.length}/160</p>
            </div>
          </div>
          <div>
            <label className="label">Banner Image URL</label>
            <input value={form.bannerImage} onChange={e => set('bannerImage', e.target.value)} placeholder="https://..." className="input" />
          </div>
          <div>
            <label className="label">Banner Image Alt Text</label>
            <input value={form.bannerImageAlt} onChange={e => set('bannerImageAlt', e.target.value)} placeholder="Describe the image for screen readers" className="input" />
          </div>

          {/* SEO Preview */}
          {(form.seoTitle || form.title) && (
            <div className="card p-4">
              <p className="text-xs font-semibold text-ink-muted mb-3 uppercase tracking-wide">Search Preview</p>
              <p className="text-blue-600 text-lg hover:underline cursor-pointer">{form.seoTitle || form.title}</p>
              <p className="text-green-700 text-xs my-1">{process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/{form.slug}</p>
              <p className="text-sm text-gray-600">{form.seoDescription || form.excerpt || 'No description set.'}</p>
            </div>
          )}
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
                    const ids = form.categoryIds.includes(c.id)
                      ? form.categoryIds.filter(id => id !== c.id)
                      : [...form.categoryIds, c.id];
                    set('categoryIds', ids);
                  }}
                  className={clsx('badge cursor-pointer transition-colors', form.categoryIds.includes(c.id) ? 'bg-brand-500 text-white' : 'bg-gray-100 text-ink-light hover:bg-brand-50 hover:text-brand-600')}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="sponsored" checked={form.isSponsored} onChange={e => set('isSponsored', e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="sponsored" className="text-sm font-medium text-ink-light cursor-pointer">Mark as sponsored content</label>
          </div>
          {!canPublish && (
            <div className="card p-4 bg-yellow-50 border-yellow-100">
              <p className="text-sm text-yellow-700">As a Writer, you can save drafts but only Admins and Editors can publish posts.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
