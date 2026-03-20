'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, FolderOpen, Users, Settings, LogOut, Plus, BarChart2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/hooks/useAuth';
import clsx from 'clsx';

function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText },
    { href: '/dashboard/posts/new', label: 'New Post', icon: Plus },
    { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
    ...(user?.role === 'ADMIN' ? [{ href: '/dashboard/users', label: 'Users', icon: Users }] : []),
  ];

  const handleLogout = async () => { await logout(); router.push('/auth/login'); };

  return (
    <aside className="w-64 bg-ink min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-800">
        <Link href="/blog" className="flex items-center gap-2 text-white font-bold font-serif text-lg">
          TCB <span className="text-gray-400 text-xs font-normal font-sans">Dashboard</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === href ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/blog" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ExternalLink size={16} />View Blog
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{user?.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors"><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>
        <div className="flex min-h-screen bg-paper-soft">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </DashboardGuard>
    </AuthProvider>
  );
}
