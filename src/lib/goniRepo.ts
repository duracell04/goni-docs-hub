const OWNER = "duracell04";
const REPO = "goni";
const BRANCH = "main";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

export type TreeItem = {
  path: string;
  type: "file" | "dir";
};

type GithubTreeItem = {
  path: string;
  type: "blob" | "tree";
};

function githubHeaders(accept = "application/vnd.github+json"): HeadersInit {
  const token = process.env.GONI_GITHUB_TOKEN;
  const base = {
    Accept: accept,
    "User-Agent": "goni-docs-hub",
  } satisfies HeadersInit;

  return token
    ? {
        ...base,
        Authorization: `Bearer ${token}`,
      }
    : base;
}

async function fetchGithub(url: string, accept: string): Promise<Response> {
  const makeRequest = (headers: HeadersInit) =>
    fetch(url, {
      headers,
      cache: "no-store",
    });

  // Prefer public access; fall back to token if provided.
  const anonymous = await makeRequest({
    Accept: accept,
    "User-Agent": "goni-docs-hub",
  });
  if (anonymous.ok || !process.env.GONI_GITHUB_TOKEN) return anonymous;

  const authed = await makeRequest(githubHeaders(accept));
  return authed;
}

/**
 * Load the full repo tree (files and derived directories).
 */
export async function getRepoTree(): Promise<TreeItem[]> {
  const url = `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;

  const res = await fetchGithub(url, "application/vnd.github+json");

  // Fallback to contents API if tree endpoint is rate-limited/forbidden.
  if (res.status === 403 || res.status === 404) {
    return await getRepoTreeViaContents();
  }

  if (!res.ok) {
    throw new Error(`Failed to load repo tree (${res.status})`);
  }

  const json = await res.json();
  const raw = (json.tree as GithubTreeItem[]) ?? [];

  return dedupeItems(buildTreeFromGitTree(raw));
}

function isDirectChild(candidate: string, parent: string): boolean {
  const prefix = parent ? `${parent}/` : "";
  if (!candidate.startsWith(prefix)) return false;
  const rest = candidate.slice(prefix.length);
  if (!rest) return false;
  return !rest.includes("/");
}

/**
 * Return direct children (files + dirs) of a given path ("" = root).
 */
export async function getChildrenOf(path: string): Promise<TreeItem[]> {
  const tree = await getRepoTree();
  const children = tree.filter((item) => isDirectChild(item.path, path));

  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return children;
}

/**
 * Fetch raw content for a file.
 */
export async function getFileContent(path: string): Promise<string> {
  const rawUrl = `${GITHUB_RAW_BASE}/${OWNER}/${REPO}/${BRANCH}/${path}`;

  // Prefer public access; fall back to token if provided.
  let res = await fetch(rawUrl, {
    headers: { "User-Agent": "goni-docs-hub" },
    cache: "no-store",
  });

  if (!res.ok && process.env.GONI_GITHUB_TOKEN) {
    res = await fetch(rawUrl, {
      headers: githubHeaders("text/plain"),
      cache: "no-store",
    });
  }

  if (!res.ok) {
    throw new Error(`Failed to load file ${path} (${res.status})`);
  }

  return await res.text();
}

/**
 * Build raw and blob URLs for a path.
 */
export function buildGithubLinks(path: string) {
  return {
    rawUrl: `${GITHUB_RAW_BASE}/${OWNER}/${REPO}/${BRANCH}/${path}`,
    blobUrl: `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${path}`,
    repoUrl: `https://github.com/${OWNER}/${REPO}`,
  };
}

function buildTreeFromGitTree(raw: GithubTreeItem[]): TreeItem[] {
  const items: TreeItem[] = [];

  for (const item of raw) {
    if (item.type === "blob") {
      items.push({ path: item.path, type: "file" });
    } else if (item.type === "tree") {
      items.push({ path: item.path, type: "dir" });
    }
  }

  // Derive parent directories
  const dirSet = new Set<string>();
  for (const file of items) {
    const segments = file.path.split("/");
    for (let i = 1; i < segments.length; i++) {
      const dirPath = segments.slice(0, i).join("/");
      dirSet.add(dirPath);
    }
  }
  for (const dir of dirSet) {
    items.push({ path: dir, type: "dir" });
  }

  return items;
}

function dedupeItems(items: TreeItem[]): TreeItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getRepoTreeViaContents(): Promise<TreeItem[]> {
  const items: TreeItem[] = [];

  async function walk(path: string) {
    const url = `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    const res = await fetchGithub(url, "application/vnd.github+json");

    if (!res.ok) {
      throw new Error(`Failed to load repo contents at ${path || "root"} (${res.status})`);
    }

    const json = (await res.json()) as { path: string; type: string }[];

    for (const entry of json) {
      if (entry.type === "file") {
        items.push({ path: entry.path, type: "file" });
      } else if (entry.type === "dir") {
        items.push({ path: entry.path, type: "dir" });
        await walk(entry.path);
      }
    }
  }

  await walk("");
  return dedupeItems(items);
}
