import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold font-serif mb-3">The Corporate Blog</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Insights, strategies, and ideas for the modern professional. Built with performance and SEO at its core.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300">Content</h4>
            <ul className="space-y-2">
              {[['Blog', '/blog'], ['Search', '/blog/search']].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300">Platform</h4>
            <ul className="space-y-2">
              {[['Login', '/auth/login'], ['Register', '/auth/register'], ['Dashboard', '/dashboard']].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} The Corporate Blog. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="text-gray-500 hover:text-gray-300 text-xs">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
