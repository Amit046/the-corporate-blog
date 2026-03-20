# 🏢 The Corporate Blog (TCB)
### Full-Stack Production Blog Platform

---

## ⚡ Quick Setup (Step by Step)

Follow these steps **in exact order**. Takes about 10–15 minutes.

---

## ✅ Prerequisites — Install These First

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 LTS or v20 LTS | https://nodejs.org |
| PostgreSQL | v14+ | https://www.postgresql.org/download/ |
| Git | Latest | https://git-scm.com |
| npm | v9+ (comes with Node) | — |

---

## 📁 Project Structure

```
tcb/
├── backend/          ← Node.js + Express + Prisma API
│   ├── src/
│   │   ├── controllers/   ← Route logic
│   │   ├── middleware/    ← Auth, errors, logging
│   │   ├── routes/        ← Express routes
│   │   ├── utils/         ← JWT, slug helpers
│   │   ├── validators/    ← Zod schemas
│   │   ├── config/        ← Prisma client
│   │   └── index.ts       ← Entry point
│   ├── prisma/
│   │   ├── schema.prisma  ← Database schema
│   │   └── seed.ts        ← Sample data
│   └── package.json
│
├── frontend/         ← Next.js 14 App Router
│   ├── app/
│   │   ├── (public)/      ← Blog pages (ISR)
│   │   │   └── blog/      ← /blog, /blog/[slug], /search
│   │   ├── (auth)/        ← Login, Register
│   │   └── (dashboard)/   ← Admin CMS
│   ├── components/
│   │   ├── blog/          ← PostCard, BlockRenderer
│   │   ├── layout/        ← Navbar, Footer
│   │   └── dashboard/     ← ContentEditor
│   ├── hooks/             ← useAuth
│   ├── lib/               ← API client
│   └── types/             ← TypeScript types
│
└── README.md
```

---

## 🗄 Step 1 — Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Recommended for Dev)

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Open **pgAdmin** or **psql** terminal
3. Create the database:

```sql
CREATE DATABASE tcblog;
CREATE USER tcbuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tcblog TO tcbuser;
```

Your DATABASE_URL will be:
```
postgresql://tcbuser:your_password@localhost:5432/tcblog
```

### Option B: Neon (Free Cloud PostgreSQL)

1. Go to https://neon.tech and create a free account
2. Create a new project → new database
3. Copy the connection string from the dashboard
4. It looks like: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/tcblog?sslmode=require`

---

## ⚙️ Step 2 — Configure Backend

```bash
# 1. Go to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env

# 4. Open .env and edit it:
```

Edit `backend/.env`:
```env
# ✅ REQUIRED — Replace with your actual values
DATABASE_URL="postgresql://tcbuser:your_password@localhost:5432/tcblog"

# ✅ REQUIRED — Change these secret keys!
JWT_SECRET="my-super-secret-jwt-key-min-32-chars-long"
REFRESH_TOKEN_SECRET="my-refresh-token-secret-also-long"

# ✅ These can stay as-is for development
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# ⚙️ Optional — Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

## 🗃 Step 3 — Run Database Migrations

```bash
# Still inside backend/ folder

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed sample data (creates admin user + sample posts)
npx ts-node prisma/seed.ts
```

✅ This creates:
- All database tables (users, posts, categories, etc.)
- **Admin user**: admin@tcblog.com / Admin@123
- **Writer user**: writer@tcblog.com / Admin@123
- 3 categories (Technology, Business, Startup)
- 2 published sample posts

---

## 🚀 Step 4 — Start the Backend

```bash
# Inside backend/ folder
npm run dev
```

You should see:
```
🚀 TCB Backend running on http://localhost:5000
📋 Environment: development
💾 Health: http://localhost:5000/health
```

✅ Test it: Open http://localhost:5000/health in your browser
✅ You should see: `{"status":"ok", ...}`

---

## 🎨 Step 5 — Configure Frontend

```bash
# Open a NEW terminal tab/window
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="The Corporate Blog"
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🌐 Step 6 — Start the Frontend

```bash
# Inside frontend/ folder
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in xs
```

---

## 🎉 Step 7 — Open Your App

| URL | Description |
|-----|-------------|
| http://localhost:3000/blog | Public blog homepage |
| http://localhost:3000/blog/search | Search articles |
| http://localhost:3000/auth/login | Login page |
| http://localhost:3000/auth/register | Register page |
| http://localhost:3000/dashboard | Admin dashboard |
| http://localhost:5000/health | Backend health check |
| http://localhost:5000/api/posts | Posts API |
| http://localhost:5000/sitemap.xml | Sitemap XML |

---

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tcblog.com | Admin@123 |
| Writer | writer@tcblog.com | Admin@123 |

**Admin** can: create posts, publish, manage users, manage categories
**Editor** can: create posts, publish (cannot manage users)
**Writer** can: create drafts only (cannot publish)

---

## 📋 Full API Reference

### Authentication
```
POST /api/auth/register    → Create account
POST /api/auth/login       → Login (returns JWT)
POST /api/auth/refresh     → Refresh access token
POST /api/auth/logout      → Logout
GET  /api/auth/me          → Get current user
```

### Posts
```
GET    /api/posts                  → List published posts
GET    /api/posts?status=DRAFT     → List drafts (auth required)
GET    /api/posts/slug/:slug       → Get post by slug
GET    /api/posts/popular          → Get trending posts
GET    /api/posts/:id/internal-suggestions → Related posts
POST   /api/posts                  → Create draft (auth)
PUT    /api/posts/:id              → Update post (auth)
PUT    /api/posts/:id/publish      → Publish post (admin/editor)
DELETE /api/posts/:id              → Archive post (auth)
```

### Categories
```
GET    /api/categories             → List all categories
GET    /api/categories/:slug       → Get by slug
POST   /api/categories             → Create (admin/editor)
PUT    /api/categories/:id         → Update (admin/editor)
DELETE /api/categories/:id         → Delete (admin only)
```

### Search
```
GET /api/search?q=keyword&page=1   → Search posts
```

### Analytics (admin only)
```
GET /api/analytics/stats           → Dashboard statistics
GET /api/analytics/audit-logs      → Audit log history
```

### Users (admin only)
```
GET    /api/users                  → List users
GET    /api/users/:slug            → Get user profile
PUT    /api/users/me/profile       → Update own profile
PUT    /api/users/:id/role         → Change user role
DELETE /api/users/:id              → Delete user
```

### Utilities
```
GET /sitemap.xml    → Dynamic XML sitemap
GET /robots.txt     → Robots file
GET /health         → Health check
GET /r/:slug        → Affiliate redirect
```

---

## 🔑 Authentication Flow

All protected API routes need the Authorization header:
```
Authorization: Bearer <access_token>
```

The frontend handles this automatically via axios interceptors.
Tokens auto-refresh when expired.

---

## 📝 Content Block Types

When creating posts, these block types are supported:

| Type | Fields |
|------|--------|
| `paragraph` | `text` |
| `heading` | `text`, `level` (1-6) |
| `list` | `items` (array of strings) |
| `blockquote` | `text` |
| `image` | `src`, `alt`, `caption` |
| `table` | `headers`, `rows` (2D array) |
| `youtube` | `videoId` |
| `faq` | `question`, `answer` |
| `callout` | `text`, `variant` (info/warning/success/error) |
| `code` | `text`, `language` |

Example post content JSON:
```json
[
  { "type": "heading", "level": 2, "text": "Introduction" },
  { "type": "paragraph", "text": "Welcome to our blog." },
  { "type": "list", "items": ["Point one", "Point two"] },
  { "type": "faq", "question": "What is this?", "answer": "A great blog." }
]
```

---

## 🛡 Security Features

- JWT access tokens (15 min expiry)
- Refresh token rotation (7 days)
- Role-based access control (ADMIN, EDITOR, WRITER, VIEWER)
- Rate limiting (200 req/15min globally, 20 for auth)
- Helmet security headers
- CORS protection
- Zod input validation on all endpoints
- XSS-safe block renderer (no dangerouslySetInnerHTML)
- Admin routes never statically generated
- Drafts excluded from sitemap

---

## 🔧 Common Issues & Fixes

### ❌ "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Make sure database `tcblog` exists

### ❌ "prisma: command not found"
```bash
npx prisma generate
npx prisma migrate dev
```

### ❌ "Module not found" errors
```bash
cd backend && npm install
cd ../frontend && npm install
```

### ❌ Frontend shows blank / CORS error
- Make sure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL=http://localhost:5000/api in frontend/.env.local
- Verify FRONTEND_URL=http://localhost:3000 in backend/.env

### ❌ Login fails even with correct password
- Make sure you ran the seed: `npx ts-node prisma/seed.ts`
- Check backend console for error messages

---

## 🚀 Production Deployment

### Backend → Deploy to Railway / Render / Fly.io
1. Push backend folder to GitHub
2. Connect to Railway (railway.app) or Render (render.com)
3. Set all environment variables from .env
4. Build command: `npm run build`
5. Start command: `npm start`

### Frontend → Deploy to Vercel
1. Push frontend folder to GitHub
2. Import project at vercel.com
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL
4. Deploy!

### Database → Neon (Free)
- Use Neon for production PostgreSQL
- Add `?sslmode=require` to DATABASE_URL
- Run migrations: `npx prisma migrate deploy`

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router + ISR) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + Refresh Tokens |
| Validation | Zod |
| Image CDN | Cloudinary (optional) |
| Deployment | Vercel (FE) + Railway/Render (BE) |

---

## 💡 Features Implemented

### Week 1 — Foundation ✅
- [x] PostgreSQL schema with all tables
- [x] JWT auth with refresh token rotation
- [x] Role-based access control (ADMIN, EDITOR, WRITER, VIEWER)
- [x] Draft creation and editing
- [x] Block-based CMS editor
- [x] Slug auto-generation

### Week 2 — SEO + Publishing ✅
- [x] SSG + ISR (15 min revalidation)
- [x] Dynamic metadata engine (title, description, OG, Twitter)
- [x] JSON-LD structured data (Article, Breadcrumb)
- [x] Publish flow with validation gates
- [x] Dynamic sitemap.xml
- [x] robots.txt
- [x] Table of Contents auto-generation
- [x] XSS-safe block renderer
- [x] 404 for unpublished posts

### Week 3 — Growth Engine ✅
- [x] Internal link suggestions (related posts)
- [x] Post view tracking (IP-hash deduplicated)
- [x] Popular/trending posts widget
- [x] Full-text search
- [x] FAQ block with schema markup
- [x] Callout blocks
- [x] Word count + reading time
- [x] Affiliate redirect tracking

### Week 4 — Production Hardening ✅
- [x] Audit log table
- [x] Request ID logging middleware
- [x] Soft delete (archive) for posts
- [x] Rate limiting (global + auth-specific)
- [x] Security headers (Helmet)
- [x] Health check endpoint
- [x] Dashboard analytics stats
- [x] Sponsored post flag + disclosure

---

*Built with ❤️ — The Corporate Blog Platform v1.0*
