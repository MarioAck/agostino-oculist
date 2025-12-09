# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 eyewear e-commerce application called "Agostino Oculist" with an admin panel for managing products. The app displays two categories of eyewear: best sellers and sale items, with full CRUD capabilities through a protected admin interface.

## Technology Stack

- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with @tailwindcss/postcss)
- **Runtime**: Node.js 20 (Alpine Linux in Docker)
- **Deployment**: Docker with standalone output mode

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Docker Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Architecture

### Data Management

- **Data persistence**: JSON file-based storage in `data/items.json`
- **Data structure**: Two arrays - `bestSellers` and `saleItems`
- **File operations**: Direct filesystem I/O using Node.js `fs` module in API routes
- **Docker volume**: The `data/` directory is mounted to persist changes across container restarts

### Authentication

- **Method**: Simple cookie-based authentication (NOT production-ready JWT/session system)
- **Cookie name**: `admin_auth`
- **Credentials**: Configurable via environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD` (defaults: admin/admin123)
- **Auth flow**: Login at `/admin/login` → check endpoint `/api/auth/check` → protected `/admin` panel
- **Security notes**:
  - Uses httpOnly cookies
  - No password hashing (plaintext comparison)
  - Not suitable for production without enhancement

### API Routes Structure

- `app/api/items/route.ts`: CRUD operations (GET, POST, PUT, DELETE) for eyewear items
- `app/api/auth/login/route.ts`: Authentication endpoint that sets auth cookie
- `app/api/auth/check/route.ts`: Validates authentication status
- `app/api/auth/logout/route.ts`: Clears authentication cookie

### Page Routes

- `/` (app/page.tsx): Homepage with navigation cards
- `/best-sellers` (app/best-sellers/page.tsx): Server component displaying best sellers
- `/new-sale` (app/new-sale/page.tsx): Server component displaying sale items
- `/admin/login` (app/admin/login/page.tsx): Admin login form
- `/admin` (app/admin/page.tsx): Protected admin dashboard with item management

### Client vs Server Components

- **Server Components**: Homepage, best-sellers page, new-sale page (fetch data server-side)
- **Client Components**: Admin pages (marked with `'use client'` for state management and auth)

### Data Fetching Patterns

- **Admin panel**: Client-side fetching with `fetch()` for real-time updates after mutations
- **Public pages**: Server-side fetching with `cache: 'no-store'` to ensure fresh data
- **Base URL**: Uses `process.env.NEXT_PUBLIC_BASE_URL` fallback to `http://localhost:3000`

## Item Schema

```typescript
interface Item {
  id: string;              // e.g., "bs1" or "sale1"
  name: string;
  price: number;
  originalPrice?: number;  // Only for sale items
  discount?: number;       // Only for sale items (percentage)
  description: string;
  image: string;           // Emoji or URL
  category: 'best-seller' | 'sale';
}
```

## Environment Variables

Configure in `docker-compose.yml` or `.env`:

```
ADMIN_USERNAME=admin           # Default: admin
ADMIN_PASSWORD=admin123        # Default: admin123
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Docker Configuration

- **Build context**: Multi-stage Dockerfile with deps → builder → runner stages
- **Output mode**: Next.js standalone output (configured in `next.config.ts`)
- **Port**: 3000 (mapped in docker-compose)
- **User**: Runs as non-root user `nextjs` (uid 1001)
- **Volumes**: Mounts `./data` to `/app/data` for persistence
- **Network**: Custom bridge network `app-network`

## Key Implementation Details

1. **File system writes in API routes**: The app directly modifies `data/items.json` using `fs.writeFileSync()`. This works because:
   - In Docker: The data directory is mounted as a volume
   - Locally: Direct access to filesystem
   - This is NOT suitable for serverless deployments (Vercel, etc.)

2. **ID generation**: New items get auto-generated IDs based on array length (e.g., `bs${bestSellers.length + 1}`)

3. **No database**: This is intentionally a simple file-based system, not using PostgreSQL/MongoDB/etc.

4. **Server-side rendering**: Public product pages are server components that fetch data on each request (no ISR/SSG)

5. **Admin panel state**: Uses React state for form management, with optimistic UI updates after mutations

## Common Development Patterns

- **Adding new routes**: Create files in `app/` directory following App Router conventions
- **Adding new API endpoints**: Create `route.ts` files in `app/api/` directory
- **Modifying item structure**: Update both the TypeScript interface and the JSON file structure
- **Styling**: Use Tailwind utility classes, dark mode variants available with `dark:` prefix

## Deployment Notes

- The app is designed for Docker deployment with volume persistence
- NOT compatible with serverless platforms (Vercel, Netlify) due to file system writes
- For serverless deployment, you would need to replace file-based storage with a database
- The standalone output mode produces a self-contained deployment in `.next/standalone/`
