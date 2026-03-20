import { AuthProvider } from '@/hooks/useAuth';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><div className="min-h-screen bg-paper-soft flex items-center justify-center px-4">{children}</div></AuthProvider>;
}
