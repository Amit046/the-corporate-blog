'use client';
import { useEffect, useState } from 'react';
import { Shield, Trash2, FileText } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLES = ['ADMIN', 'EDITOR', 'WRITER', 'VIEWER'];
const roleBadge: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  EDITOR: 'bg-purple-100 text-purple-700',
  WRITER: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-500',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: me } = useAuth();

  const fetchUsers = () => {
    usersApi.getAll()
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await usersApi.updateRole(id, role);
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersApi.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-ink">Users</h1>
          <p className="text-sm text-ink-muted mt-1">Manage team members and their roles</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card p-4 shimmer h-16" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase hidden md:table-cell">Posts</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{u.name[0]}</div>
                      <div>
                        <p className="font-medium text-sm text-ink">{u.name} {u.id === me?.id && <span className="text-xs text-ink-muted">(you)</span>}</p>
                        <p className="text-xs text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {u.id !== me?.id ? (
                      <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={clsx('badge cursor-pointer border-0 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-full px-2.5 py-0.5', roleBadge[u.role])}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-sm text-ink-muted"><FileText size={13} />{u._count?.posts || 0}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-ink-muted">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id !== me?.id && (
                      <div className="flex justify-end">
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
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
