import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
