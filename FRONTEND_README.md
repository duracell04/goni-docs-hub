# Goni Docs Frontend

A Next.js (App Router) + Tailwind CSS documentation site that treats markdown files in the repository as its CMS. Everything is TypeScript-based and uses `pnpm` for package management.

## Architecture

The frontend automatically adapts when you add, move, or delete `.md` files in the parent repository, without manual route or navigation updates.

- **Content Model**: expects `README.md` for `/`, plus markdown under `../docs`, `../hardware`, and `../software` (mocked in `src/lib/content.ts`).
- **Routing**: `app/page.tsx` serves the overview; `app/[section]/[[...slug]]/page.tsx` renders docs, hardware, and software pages.
- **Navigation**: Sidebar is generated from `getSections()`; active states follow the current pathname.
- **Markdown**: GitHub-flavored markdown with transformed `.md` links, syntax highlighting hooks, heading IDs, and a generated table of contents.
- **Branding**: Design tokens live in `src/app/globals.css` and drive the Swiss-inspired, minimal Goni theme.

## Getting Started

Prerequisites: Node.js 18+ and `pnpm`.

```bash
pnpm install
pnpm dev         # http://localhost:3000
pnpm build       # production build
pnpm start       # run the built app
pnpm lint        # Next.js lint
```

## Project Structure

```
src/
├─ app/
│  ├─ page.tsx                    # Overview page
│  ├─ [section]/[[...slug]]/      # Dynamic docs routes
│  ├─ layout.tsx                  # Root layout + providers
│  ├─ providers.tsx               # Tooltip/Toaster providers
│  └─ globals.css                 # Design tokens + base styles
├─ components/
│  ├─ DocLayout.tsx               # Main layout with sidebar/top bar
│  ├─ Sidebar.tsx                 # Left navigation sidebar
│  ├─ MarkdownRenderer.tsx        # Markdown rendering/link transforms
│  └─ TableOfContents.tsx         # Right TOC sidebar
└─ lib/
   └─ content.ts                  # Mock content + helpers (replace with real scanning)
```

## Making Content Real

`src/lib/content.ts` currently uses mock data. Replace it by scanning `../docs`, `../hardware`, and `../software` at build time (e.g., a prebuild script that loads markdown, extracts frontmatter/titles, and builds a JSON content tree consumed by the app).

## Deployment

Deploy as a standard Next.js app (Vercel recommended). You can also export static output if you pre-render all routes once your content scanning is in place.

## Design Tokens

Colors, typography, and layout tokens live in `src/app/globals.css`. All colors use HSL; keep new additions aligned with the Goni palette and spacing rhythm.
