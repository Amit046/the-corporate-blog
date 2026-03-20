'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/blog', label: 'Blog' },
    { href: '/blog/search', label: 'Search' },
  ];

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-white'
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-serif text-ink">TCB</span>
            <span className="hidden sm:block text-xs font-medium text-ink-muted border-l border-gray-200 pl-2">The Corporate Blog</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={clsx(
                'text-sm font-medium transition-colors',
                pathname === l.href ? 'text-brand-600' : 'text-ink-light hover:text-ink'
              )}>{l.label}</Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 text-sm font-medium text-ink-light hover:text-ink transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                  <ChevronDown size={14} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-ink-light hover:bg-gray-50" onClick={() => setUserMenu(false)}>
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <button onClick={() => { logout(); setUserMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-ink-light hover:text-ink">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-ink" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block py-2 text-sm font-medium text-ink-light" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-sm font-medium text-ink-light" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left py-2 text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 text-sm font-medium text-ink-light" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/auth/register" className="block py-2 text-sm font-medium text-brand-600" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
