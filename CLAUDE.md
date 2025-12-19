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

# Cleanup unused upload files
npm run cleanup
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

- `app/api/items/route.ts`: CRUD operations (GET, POST, PUT, DELETE, PATCH) for eyewear items
  - GET: Fetches items with automatic normalization of image/images fields
  - POST: Creates new item with auto-generated ID
  - PUT: Updates existing item
  - DELETE: Removes item by ID
  - PATCH: Reorders items within category (up/down direction)
- `app/api/upload/route.ts`: Image upload endpoint with Sharp optimization
- `app/api/images/[filename]/route.ts`: Image serving with aggressive caching
- `app/api/auth/login/route.ts`: Authentication endpoint that sets auth cookie
- `app/api/auth/check/route.ts`: Validates authentication status
- `app/api/auth/logout/route.ts`: Clears authentication cookie

### Page Routes

- `/` (app/page.tsx): Homepage with navigation cards
- `/best-sellers` (app/best-sellers/page.tsx): Server component displaying best sellers
- `/new-sale` (app/new-sale/page.tsx): Server component displaying sale items
- `/item/[id]` (app/item/[id]/page.tsx): Client component with image carousel and swipe support
- `/admin/login` (app/admin/login/page.tsx): Admin login form
- `/admin` (app/admin/page.tsx): Protected admin dashboard with item management and reordering

### Client vs Server Components

- **Server Components**: Homepage, best-sellers page, new-sale page (fetch data server-side)
- **Client Components**: Admin pages, item detail page (marked with `'use client'` for state management, auth, and carousel interactions)

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
  discount?: number;       // Only for sale items (percentage, auto-calculates price)
  description: string;
  image: string;           // Single image URL (maintained for backward compatibility, always set to images[0])
  images: string[];        // Array of image URLs, primary source of truth for multiple images
  category: 'best-seller' | 'sale';
}
```

**Note**: The GET endpoint automatically normalizes items to ensure both `image` and `images` fields exist, migrating old data transparently.

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
- **Volumes**:
  - `data:/app/data` - Persists items.json across restarts
  - `uploads:/app/public/uploads` - Persists uploaded images
- **Network**: Custom bridge network `app-network`
- **Entrypoint**: `docker-entrypoint.sh` runs cleanup script before starting server

## Key Implementation Details

1. **File system writes in API routes**: The app directly modifies `data/items.json` using `fs.writeFileSync()`. This works because:
   - In Docker: The data directory is mounted as a volume
   - Locally: Direct access to filesystem
   - This is NOT suitable for serverless deployments (Vercel, etc.)

2. **ID generation**: New items get auto-generated IDs based on array length (e.g., `bs${bestSellers.length + 1}`)

3. **No database**: This is intentionally a simple file-based system, not using PostgreSQL/MongoDB/etc.

4. **Server-side rendering**: Public product pages are server components that fetch data on each request (no ISR/SSG)

5. **Admin panel state**: Uses React state for form management, with optimistic UI updates after mutations

6. **Image upload and optimization**: All uploaded images are processed with Sharp library:
   - Resized to 2000x2000px with center crop positioning
   - Converted to WebP format at 95% quality with compression effort level 6
   - GIF files preserved as-is to maintain animations
   - Unique filenames: `{timestamp}-{random}-{originalName}.webp`
   - Images served via `/api/images/{filename}` with immutable caching (max-age=31536000)
   - Maximum file size: 50MB per upload
   - Supports multiple file uploads simultaneously

7. **Multiple images per item**: Items support both single and multiple images:
   - `images` array is the primary source (supports drag-to-reorder in admin)
   - `image` field maintained for backward compatibility (always set to first image)
   - Admin panel shows first image as "MAIN" with badge
   - Item detail page features touch-enabled carousel with swipe gestures

8. **Cleanup system**: Orphaned upload files are automatically removed:
   - `scripts/cleanup-uploads.js` compares database references with actual files
   - Runs automatically on Docker container startup via `docker-entrypoint.sh`
   - Can be run manually with `npm run cleanup`
   - Handles both `/uploads/` and `/api/images/` URL patterns
   - Reports deleted files and space freed

9. **Item reordering**: Admin panel supports drag-free reordering:
   - Up/down arrow buttons on each item card
   - PATCH endpoint swaps item positions within category
   - Validates bounds to prevent invalid moves
   - Works independently for best-sellers and sale items

10. **Localization**: All UI text is in Italian throughout the application

## Common Development Patterns

- **Adding new routes**: Create files in `app/` directory following App Router conventions
- **Adding new API endpoints**: Create `route.ts` files in `app/api/` directory
- **Modifying item structure**: Update both the TypeScript interface and the JSON file structure
- **Styling**: Use Tailwind utility classes, dark mode variants available with `dark:` prefix
- **Adding images to items**: Images upload immediately on file selection (not on form submit), returns array of URLs
- **Price calculations**: Sale items auto-calculate price from originalPrice and discount percentage
- **Carousel implementation**: Uses touch events with `touchStart`, `touchEnd`, drag offset, and transition states

## Deployment Notes

- The app is designed for Docker deployment with volume persistence
- NOT compatible with serverless platforms (Vercel, Netlify) due to file system writes
- For serverless deployment, you would need to replace file-based storage with a database
- The standalone output mode produces a self-contained deployment in `.next/standalone/`
- Container startup runs cleanup script automatically to remove orphaned uploads
- Both data and uploads directories have 777 permissions for read/write access
