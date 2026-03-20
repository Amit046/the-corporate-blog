import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar } from 'lucide-react';
import { Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface Props {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: Props) {
  const publishDate = post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : '';

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="card overflow-hidden flex flex-col md:flex-row gap-0">
          <div className="md:w-1/2 relative aspect-video md:aspect-auto overflow-hidden bg-gray-100">
            {post.bannerImage ? (
              <Image src={post.bannerImage} alt={post.bannerImageAlt || post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <span className="text-brand-500 font-serif text-4xl font-bold">{post.title[0]}</span>
              </div>
            )}
            {post.isSponsored && <span className="badge absolute top-3 left-3 bg-yellow-100 text-yellow-700">Sponsored</span>}
          </div>
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            {post.categories[0] && (
              <span className="badge bg-brand-50 text-brand-600 mb-3">{post.categories[0].category.name}</span>
            )}
            <h2 className="text-2xl font-bold font-serif text-ink group-hover:text-brand-600 transition-colors mb-3 line-clamp-2">{post.title}</h2>
            {post.excerpt && <p className="text-ink-muted text-sm leading-relaxed line-clamp-3 mb-5">{post.excerpt}</p>}
            <div className="flex items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1"><Calendar size={12} />{publishDate}</span>
              {post.readingTime && <span className="flex items-center gap-1"><Clock size={12} />{post.readingTime} min</span>}
              {post._count && <span className="flex items-center gap-1"><Eye size={12} />{post._count.views}</span>}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                {post.author.name[0]}
              </div>
              <span className="text-sm font-medium text-ink-light">{post.author.name}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block card overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {post.bannerImage ? (
          <Image src={post.bannerImage} alt={post.bannerImageAlt || post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
            <span className="text-brand-400 font-serif text-3xl font-bold">{post.title[0]}</span>
          </div>
        )}
        {post.isSponsored && <span className="badge absolute top-2 left-2 bg-yellow-100 text-yellow-700 text-xs">Sponsored</span>}
      </div>
      <div className="p-5">
        {post.categories[0] && (
          <span className="badge bg-brand-50 text-brand-600 text-xs mb-2">{post.categories[0].category.name}</span>
        )}
        <h3 className="font-bold font-serif text-ink group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 text-lg">{post.title}</h3>
        {post.excerpt && <p className="text-ink-muted text-sm line-clamp-2 mb-4">{post.excerpt}</p>}
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{post.author.name[0]}</div>
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {post.readingTime && <span className="flex items-center gap-1"><Clock size={11} />{post.readingTime}m</span>}
            {post._count && <span className="flex items-center gap-1"><Eye size={11} />{post._count.views}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
