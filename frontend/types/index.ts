export interface Author {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { postCategories: number };
}

export interface Block {
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'image' | 'table' | 'youtube' | 'faq' | 'callout' | 'code';
  level?: number;
  text?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  headers?: string[];
  rows?: string[][];
  videoId?: string;
  question?: string;
  answer?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  language?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: Block[];
  bannerImage?: string;
  bannerImageAlt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  isSponsored: boolean;
  readingTime?: number;
  wordCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  categories: { category: Category }[];
  _count?: { views: number };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'WRITER' | 'VIEWER';
  slug: string;
  avatar?: string;
  bio?: string;
}
