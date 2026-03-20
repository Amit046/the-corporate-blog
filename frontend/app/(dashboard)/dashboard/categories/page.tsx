'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editName, setEditName] = useState('');

  const fetchCategories = () => {
    categoriesApi.getAll()
      .then(({ data }) => setCategories(data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await categoriesApi.create({ name: newName, description: newDesc });
      toast.success('Category created!');
      setNewName(''); setNewDesc(''); setAdding(false);
      fetchCategories();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed to create'); }
  };

  const handleUpdate = async (id: string) => {
    try {
      await categoriesApi.update(id, { name: editName });
      toast.success('Updated!');
      setEditing(null);
      fetchCategories();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('Deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif text-ink">Categories</h1>
        <button onClick={() => setAdding(true)} className="btn-primary"><Plus size={16} />New Category</button>
      </div>

      {adding && (
        <div className="card p-5 mb-6 border-brand-200">
          <h3 className="font-semibold mb-4">Create Category</h3>
          <div className="space-y-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className="input" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="input" />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary text-sm"><Check size={14} />Create</button>
              <button onClick={() => { setAdding(false); setNewName(''); setNewDesc(''); }} className="btn-secondary text-sm"><X size={14} />Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card p-4 shimmer h-14" />)}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-xl font-serif mb-3">No categories yet</p>
          <button onClick={() => setAdding(true)} className="btn-primary">Create first category</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase hidden sm:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase hidden md:table-cell">Posts</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    {editing === cat.id ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="input text-sm py-1"
                        autoFocus onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditing(null); }} />
                    ) : (
                      <span className="font-medium text-sm text-ink">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-ink-muted font-mono">{cat.slug}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-sm text-ink-muted">{cat._count?.postCategories || 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {editing === cat.id ? (
                        <>
                          <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check size={14} /></button>
                          <button onClick={() => setEditing(null)} className="p-1.5 text-ink-muted hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(cat.id); setEditName(cat.name); }} className="p-1.5 text-ink-muted hover:bg-gray-100 rounded-lg"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
