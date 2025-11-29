const GONI_REPO = "duracell04/goni";
const GONI_BRANCH = "main";

const GITHUB_API_BASE = "https://api.github.com";

const DEFAULT_REVALIDATE_SECONDS = 60;

export type DocMeta = {
  slug: string;
  title: string;
  path: string; // e.g. "docs/overview.md"
  section?: string;
};

type GithubContentItem = {
  name: string;
  path: string;
  type: "file" | "dir";
};

export type DocPage = DocMeta & {
  section: string;
  slugSegments: string[];
};

export type SectionNav = {
  id: string;
  title: string;
  pages: DocPage[];
};

export type TocItem = {
  id: string;
  title: string;
  level: number;
};

function githubHeaders(accept = "application/vnd.github+json"): HeadersInit {
  const token = process.env.GONI_GITHUB_TOKEN;
  return token
    ? {
        Authorization: `Bearer ${token}`,
        Accept: accept,
      }
    : {
        Accept: accept,
      };
}

function normalizeMeta(meta: DocMeta): DocPage {
  const sectionFromPath = meta.path.split("/")[0] || "docs";
  const section = meta.section ?? sectionFromPath;
  const slug = meta.slug || meta.path.replace(/\.md$/, "").split("/").pop() || "page";
  const slugSegments = slug.split("/").filter(Boolean);

  return {
    ...meta,
    section,
    slug,
    slugSegments,
  };
}

function githubApiUrl(path: string): string {
  return `${GITHUB_API_BASE}/repos/${GONI_REPO}/contents/${path}?ref=${GONI_BRANCH}`;
}

function githubBlobUrl(path: string): string {
  return `https://github.com/${GONI_REPO}/blob/${GONI_BRANCH}/${path}`;
}

async function fetchGithubRaw(path: string): Promise<string> {
  const res = await fetch(githubApiUrl(path), {
    headers: githubHeaders("application/vnd.github.raw"),
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Failed to load ${path} from goni (${res.status})`);
  }

  return res.text();
}

/**
 * Load docs/nav.json from the goni repo as the navigation manifest.
 */
export async function getDocsNav(): Promise<DocPage[]> {
  const raw = await fetchGithubRaw("docs/nav.json");
  const manifest = JSON.parse(raw) as DocMeta[];

  return manifest.map(normalizeMeta);
}

/**
 * Fallback: list all .md files under docs/ if you don’t want a nav.json yet.
 */
export async function listDocsFromFolder(): Promise<DocPage[]> {
  const url = githubApiUrl("docs");

  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Failed to list docs/ from goni (${res.status})`);
  }

  const items = (await res.json()) as GithubContentItem[];

  return items
    .filter((item) => item.type === "file" && item.name.endsWith(".md"))
    .map((item) =>
      normalizeMeta({
        slug: item.name.replace(/\.md$/, ""),
        title: item.name.replace(/\.md$/, "").replace(/-/g, " "),
        path: item.path, // e.g. "docs/overview.md"
      }),
    );
}

/**
 * Public function: get all pages – prefer nav.json, fallback to listing.
 */
export async function getAllPages(): Promise<DocPage[]> {
  try {
    return await getDocsNav();
  } catch {
    return await listDocsFromFolder();
  }
}

async function fetchMarkdown(path: string): Promise<string> {
  return fetchGithubRaw(path);
}

export function pageHref(page: DocPage): string {
  const slugPath = page.slugSegments.join("/");
  return `/${page.section}${slugPath ? `/${slugPath}` : ""}`;
}

export async function getPageBySlug(slug: string): Promise<{ meta: DocPage; markdown: string; githubUrl: string }> {
  const pages = await getAllPages();
  const meta =
    pages.find((p) => p.slug === slug) ||
    pages.find((p) => p.slugSegments.join("/") === slug);

  if (!meta) {
    throw new Error(`Doc with slug "${slug}" not found in nav`);
  }

  const markdown = await fetchMarkdown(meta.path);

  return { meta, markdown, githubUrl: githubBlobUrl(meta.path) };
}

export async function getPageBySectionAndSlug(
  section: string,
  slugSegments: string[],
): Promise<{ meta: DocPage; markdown: string; githubUrl: string }> {
  const pages = await getAllPages();
  const slugPath = slugSegments.join("/");

  const meta =
    pages.find(
      (p) =>
        p.section === section &&
        (p.slug === slugPath ||
          p.slugSegments.join("/") === slugPath ||
          (slugSegments.length === 0 && p.slugSegments.length === 0)),
    ) ??
    (slugSegments.length === 0 ? pages.find((p) => p.section === section) : undefined);

  if (!meta) {
    throw new Error(`Doc with section "${section}" and slug "${slugPath}" not found`);
  }

  const markdown = await fetchMarkdown(meta.path);

  return { meta, markdown, githubUrl: githubBlobUrl(meta.path) };
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function getPageToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = slugifyHeading(title);

    toc.push({ id, title, level });
  }

  return toc;
}

export function groupPagesBySection(pages: DocPage[]): SectionNav[] {
  const groups: Record<string, DocPage[]> = {};

  pages.forEach((page) => {
    if (!groups[page.section]) {
      groups[page.section] = [];
    }
    groups[page.section].push(page);
  });

  return Object.entries(groups).map(([id, sectionPages]) => ({
    id,
    title: id.charAt(0).toUpperCase() + id.slice(1),
    pages: sectionPages,
  }));
}
