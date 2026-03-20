'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-ink mb-1">Welcome back</h1>
          <p className="text-ink-muted text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="input pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">Register</Link>
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-ink-muted">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Admin: admin@tcblog.com / Admin@123</p>
          <p>Writer: writer@tcblog.com / Admin@123</p>
        </div>
      </div>
      <p className="text-center text-sm text-ink-muted mt-4">
        <Link href="/blog" className="hover:text-brand-600">← Back to Blog</Link>
      </p>
    </div>
  );
}
