# Goni Docs Frontend

A React + Vite documentation site that treats markdown files in the repository as a CMS.

## Architecture

This frontend is designed to automatically adapt when you add, move, or delete `.md` files in the parent repository, without needing manual route or navigation updates.

### Content Model - "Repo as CMS"

The app expects the following structure in the parent repository:

```
../README.md           → Home page (/)
../docs/**/*.md        → Documentation section (/docs/...)
../hardware/**/*.md    → Hardware section (/hardware/...)
../software/**/*.md    → Software section (/software/...)
```

### How It Works

1. **Content Scanning** (`src/lib/content.ts`):
   - At build time, the app scans markdown files from the parent directories
   - Generates a content tree with sections, pages, titles, and slugs
   - Currently using mock data - **you'll need to implement the actual file scanning**

2. **Dynamic Routing**:
   - `/` renders `../README.md`
   - `/docs/[...slug]` renders files from `../docs/`
   - `/hardware/[...slug]` renders files from `../hardware/`
   - `/software/[...slug]` renders files from `../software/`

3. **Automatic Navigation**:
   - Sidebar navigation is generated from the content tree
   - Active page is highlighted automatically
   - Nested folders create indented navigation items

4. **Markdown Features**:
   - GitHub-flavored markdown support (tables, code blocks, etc.)
   - Relative link transformation (`.md` links → React Router links)
   - Syntax highlighting for code blocks
   - Table of contents from H2/H3 headings
   - "View on GitHub" links for each page

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Parent repository with markdown files in the expected structure

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Building for Production

```bash
npm run build
```

## Implementing Real Content Scanning

The current implementation uses **mock data** in `src/lib/content.ts`. To make it work with your actual repository:

### Option 1: Build-Time Script

Create a Node.js script that runs before the build:

1. Scan `../docs`, `../hardware`, `../software` directories
2. Read markdown files and extract frontmatter/titles
3. Generate a JSON file with the content tree
4. Import this JSON in `src/lib/content.ts`

### Option 2: Vite Plugin

Create a Vite plugin that:

1. Scans markdown files during the build
2. Transforms them into importable modules
3. Provides hot module replacement during development

### Option 3: Static Site Generation

Use a tool like `vite-plugin-pages` or build a custom script to:

1. Pre-render all markdown pages at build time
2. Generate static HTML for each route
3. Deploy as a fully static site

## Design System - Goni Brand

The app uses a minimal, Swiss-inspired design with these core tokens:

### Colors
- **Background**: `#050814` - Deep indigo/black
- **Surface**: `#0B1020` - Card/sidebar background
- **Border**: `#111827` - Subtle borders
- **Text**: `#F9FAFB` - Primary text
- **Text Muted**: `#9CA3AF` - Secondary text
- **Accent**: `#38BDF8` - Cyan for links, active states
- **Danger**: `#F97373` - Errors/warnings

### Typography
- **Body**: Inter (with system font fallbacks)
- **Code**: JetBrains Mono (with monospace fallbacks)
- **Base size**: 16px, line-height: 1.6

### Layout
- **Sidebar**: 280px fixed width
- **Content**: Max 900px centered
- **TOC**: 240px right column (hidden on smaller screens)

## Project Structure

```
src/
├── components/
│   ├── DocLayout.tsx          # Main layout with sidebar
│   ├── Sidebar.tsx            # Left navigation sidebar
│   ├── MarkdownRenderer.tsx   # Markdown rendering component
│   └── TableOfContents.tsx    # Right TOC sidebar
├── lib/
│   └── content.ts             # Content management system
├── pages/
│   ├── HomePage.tsx           # Home page (README.md)
│   └── DocsPage.tsx           # Dynamic doc pages
├── App.tsx                    # Route configuration
└── index.css                  # Design system tokens

```

## Deployment

This is a standard Vite app that can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect to your GitHub repo
- **GitHub Pages**: Build and push to `gh-pages` branch
- **Any static host**: Upload the `dist/` folder after build

## Next Steps

1. **Implement real content scanning** in `src/lib/content.ts`
2. **Add search functionality** (filter nav items by title)
3. **Add keyboard navigation** (arrow keys to navigate pages)
4. **Optimize build** with static generation for faster loads
5. **Add dark/light mode toggle** (optional)

## Contributing

When adding new features:
- Follow the Goni brand design tokens in `src/index.css`
- Keep the Swiss minimal aesthetic
- Ensure all colors use HSL format from the design system
- Test with different markdown file structures

## License

[Your License Here]
