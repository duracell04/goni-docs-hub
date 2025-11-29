# Goni Docs Hub

**Goni Docs Hub** is a small Next.js app that turns the [`duracell04/goni`](https://github.com/duracell04/goni) repository into a clean, browsable documentation site.

It acts like a **read-only GitHub UI** optimised for reading:

- Folders are rendered as navigable sections
- Files are rendered based on type (Markdown, code, images, etc.)
- All content and structure comes live from the `goni` repo

Whenever `duracell04/goni` changes, the docs hub reflects the new state automatically, without manually copying any content.

---

## Features

- 🗂 **Live repo browser**  
  - `/repo` shows the root of `duracell04/goni`  
  - `/repo/<path>` shows folders and files under that path  
- 📄 **File rendering by type**
  - `*.md` / `*.mdx`: rendered as Markdown
  - Common text/code files (`*.ts`, `*.tsx`, `*.js`, `*.json`, `*.yml`, `*.css`, `*.html`, …): rendered in a code block
  - Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`): displayed inline
  - Other / binary files: linked to GitHub for viewing or download
- 🔗 **Tight GitHub integration**
  - “View on GitHub” and “Raw” links for every file
  - Mirrors the actual repo tree via the GitHub API
- 🔄 **Always up-to-date**
  - Uses runtime fetches to GitHub  
  - No need to redeploy the docs when `goni` changes (as long as the app is running with SSR)

---

## How it works

The app is a **Next.js 14** project (App Router) that:

1. Uses the GitHub API to fetch the full tree for `duracell04/goni`:
   - `GET /repos/:owner/:repo/git/trees/:branch?recursive=1`
2. Builds a list of:
   - `dir` items (folders, constructed from paths)
   - `file` items (actual blobs)
3. Exposes a catch-all route:

   - `/repo/[[...slug]]`

   which:

   - Renders a **directory view** when the path is a folder
   - Renders a **file view** when the path is a file

4. Uses [React Markdown](https://github.com/remarkjs/react-markdown) for `*.md` files and a simple `<pre><code>` viewer for text/code.

The target repo, owner and branch are configured in `src/lib/goniRepo.ts`.

---

## Getting started

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- `pnpm` installed globally

### 1. Clone and install

```bash
git clone https://github.com/duracell04/goni-docs-hub.git
cd goni-docs-hub
pnpm install
```

### 2. (Optional but recommended) set `GONI_GITHUB_TOKEN`

For public access, GitHub allows unauthenticated reads, but using a token gives you higher rate limits and fewer surprises.

Create a **GitHub Personal Access Token** (classic or fine-grained) with at least **read access to `duracell04/goni`** (for public repos, `public_repo` on a classic PAT is enough).

Then, either:

#### Option A – `.env.local` (recommended)

Create a file `.env.local` in the project root:

```env
GONI_GITHUB_TOKEN=ghp_your_token_here
```

#### Option B – environment variable in your shell

**PowerShell:**

```powershell
$env:GONI_GITHUB_TOKEN = "ghp_your_token_here"
pnpm dev
```

**bash/zsh:**

```bash
export GONI_GITHUB_TOKEN="ghp_your_token_here"
pnpm dev
```

> ⚠️ Never commit your token. `.env.local` should stay in `.gitignore`.

### 3. Run the dev server

```bash
pnpm dev
```

Then open:

* [http://localhost:3000/repo](http://localhost:3000/repo)

You should see the `goni` repo structure, starting at the root.

---

## Routes & UX

* `/`  
  Redirects to `/repo` (or whatever the app root is configured to do).

* `/repo`  
  Shows the **root** of the `goni` repo: top-level folders and files.

* `/repo/<path>`  
  * If `<path>` is a folder → directory listing (subfolders + files)  
  * If `<path>` is a file → file view (Markdown / code / image / binary hint)

Each file view includes:

* Breadcrumb navigation (`goni / hardware / ...`)
* “Open on GitHub” link (blob URL)
* “Raw” link (raw.githubusercontent.com)

---

## Configuration

Most configuration lives in `src/lib/goniRepo.ts`:

```ts
const OWNER = "duracell04";
const REPO = "goni";
const BRANCH = "main";
```

To point the docs hub at a different repo (for reuse), change those values.

Caching is currently tuned for “always show latest”:

* `cache: "no-store"`
* `export const dynamic = "force-dynamic";`

If you want some caching, you can swap to `next: { revalidate: 60 }` in the fetch calls.

---

## Deployment

You can deploy `goni-docs-hub` like any standard Next.js 14 SSR app:

* Vercel
* Netlify (Next.js adapter)
* Render / Fly.io
* Your own Node server (`pnpm build && pnpm start`)

Make sure to:

1. Set `GONI_GITHUB_TOKEN` as an environment variable in your hosting platform.
2. Enable SSR / edge / server functions (don’t export as a purely static site, otherwise it won’t see new commits without rebuilds).

---

## Roadmap / Ideas

Some potential future additions:

* 🔍 Full-text search across Markdown in `goni`
* 🧭 Sidebar “favourites” or pinned paths
* 🎨 Syntax highlighting for code files
* 📝 Optional custom docs view (e.g. filter only `/docs` and `/hardware`)

---

## License

TBD – add your preferred license here (e.g. MIT, Apache-2.0, etc.).
