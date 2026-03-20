import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from localStorage on client side
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (d: any) => api.post('/auth/register', d),
  login: (d: any) => api.post('/auth/login', d),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// ── Posts ─────────────────────────────────────────────
export const postsApi = {
  getAll: (params?: any) => api.get('/posts', { params }),
  getBySlug: (slug: string) => api.get(`/posts/slug/${slug}`),
  getPopular: (limit = 5) => api.get(`/posts/popular?limit=${limit}`),
  getSuggestions: (id: string) => api.get(`/posts/${id}/internal-suggestions`),
  create: (d: any) => api.post('/posts', d),
  update: (id: string, d: any) => api.put(`/posts/${id}`, d),
  publish: (id: string) => api.put(`/posts/${id}/publish`),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

// ── Categories ────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (d: any) => api.post('/categories', d),
  update: (id: string, d: any) => api.put(`/categories/${id}`, d),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── Search ────────────────────────────────────────────
export const searchApi = {
  search: (q: string, page = 1) => api.get(`/search?q=${encodeURIComponent(q)}&page=${page}`),
};

// ── Analytics ─────────────────────────────────────────
export const analyticsApi = {
  stats: () => api.get('/analytics/stats'),
  auditLogs: () => api.get('/analytics/audit-logs'),
};

// ── Users ─────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get('/users'),
  getBySlug: (slug: string) => api.get(`/users/${slug}`),
  updateProfile: (d: any) => api.put('/users/me/profile', d),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Server-side fetch (no auth token needed for public) ──
export async function serverFetch(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const res = await fetch(`${base}${path}`, { next: { revalidate: 900 } });
  if (!res.ok) return null;
  return res.json();
}
