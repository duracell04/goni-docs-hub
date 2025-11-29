import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { buildGithubLinks, getFileContent, getRepoTree, type TreeItem } from "@/lib/goniRepo";

type PageProps = { params: { slug?: string[] } };

export const dynamic = "force-dynamic";

function isImage(path: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
}

function isMarkdown(path: string) {
  return /\.mdx?$/i.test(path);
}

function isTextLike(path: string) {
  return /\.(ts|tsx|js|jsx|json|yml|yaml|toml|css|scss|html|mdx?)$/i.test(path);
}

function getBreadcrumb(path: string) {
  const segments = path ? path.split("/") : [];
  return [
    { label: "goni", href: "/repo" },
    ...segments.map((seg, i) => ({
      label: seg,
      href: "/repo/" + segments.slice(0, i + 1).join("/"),
    })),
  ];
}

function getChildrenFromTree(tree: TreeItem[], parent: string): TreeItem[] {
  const prefix = parent ? `${parent}/` : "";
  const children = tree.filter((item) => {
    if (!item.path.startsWith(prefix)) return false;
    const rest = item.path.slice(prefix.length);
    if (!rest) return false;
    return !rest.includes("/");
  });

  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return children;
}

export default async function RepoPage({ params }: PageProps) {
  const path = params.slug?.join("/") ?? "";
  const isRoot = path === "";

  let tree: TreeItem[] = [];
  let loadError: string | null = null;

  try {
    tree = await getRepoTree();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load repository contents.";
  }

  const current = isRoot ? null : tree.find((item) => item.path === path);

  if (!isRoot && !current) {
    return notFound();
  }

  const { repoUrl, blobUrl, rawUrl } = buildGithubLinks(path || "");
  const breadcrumb = getBreadcrumb(path);

  // Directory view
  if (isRoot || current?.type === "dir") {
    const children = getChildrenFromTree(tree, path);

    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="w-64 border-r border-border bg-card/40 px-4 py-6">
          <h1 className="mb-4 text-lg font-semibold">Goni Repo</h1>
          <p className="mb-2 text-xs text-muted-foreground">Mirroring {repoUrl}</p>
          <Link
            href={repoUrl}
            target="_blank"
            className="text-xs text-muted-foreground hover:underline"
          >
            View on GitHub ↗
          </Link>
        </aside>

        <main className="flex-1 px-8 py-8">
          <div className="mb-4 flex items-center justify-between">
            <nav className="space-x-1 text-sm text-muted-foreground">
              {breadcrumb.map((crumb, i) => (
                <span key={crumb.href}>
                  {i > 0 && " / "}
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>

          <h2 className="mb-4 text-xl font-semibold">{isRoot ? "Root" : path}</h2>

          {loadError ? (
            <div className="rounded border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Unable to load repository right now.</p>
              <p className="mt-2">
                {loadError} — this can happen if GitHub rate limits anonymous access. Try again in a
                bit or set a <code>GONI_GITHUB_TOKEN</code> (classic PAT with <code>public_repo</code>) and restart the dev
                server.
              </p>
            </div>
          ) : children.length === 0 ? (
            <p className="text-sm text-muted-foreground">Empty folder.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-left">GitHub</th>
                </tr>
              </thead>
              <tbody>
                {children.map((item) => {
                  const name = item.path.split("/").pop() ?? item.path;
                  const href = `/repo/${item.path}`;
                  const links = buildGithubLinks(item.path);

                  return (
                    <tr key={item.path} className="border-b border-border/40">
                      <td className="py-2">
                        <Link href={href} className="font-medium hover:underline">
                          {name}
                        </Link>
                      </td>
                      <td className="py-2">{item.type === "dir" ? "folder" : "file"}</td>
                      <td className="py-2 text-xs">
                        <a href={links.blobUrl} target="_blank" className="hover:underline">
                          GitHub ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>
    );
  }

  // File view
  const content = await getFileContent(path);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card/40 px-4 py-6">
        <h1 className="mb-4 text-lg font-semibold">Goni Repo</h1>
        <p className="mb-2 text-xs text-muted-foreground">Mirroring {repoUrl}</p>
        <Link href={repoUrl} target="_blank" className="text-xs text-muted-foreground hover:underline">
          View on GitHub ↗
        </Link>
      </aside>

      <main className="flex-1 px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <nav className="space-x-1 text-sm text-muted-foreground">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.href}>
                {i > 0 && " / "}
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
          <div className="space-x-3 text-xs text-muted-foreground">
            <a href={blobUrl} target="_blank" className="hover:underline">
              Open on GitHub ↗
            </a>
            <a href={rawUrl} target="_blank" className="hover:underline">
              Raw ↗
            </a>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold">{path}</h2>

        {isImage(path) ? (
          <img
            src={rawUrl}
            alt={path}
            className="max-h-[70vh] max-w-full rounded border border-border"
          />
        ) : isMarkdown(path) ? (
          <article className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : isTextLike(path) ? (
          <pre className="max-h-[80vh] overflow-auto rounded border border-border bg-card/60 p-4 text-xs">
            <code>{content}</code>
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            This looks like a binary file. You can{" "}
            <a href={blobUrl} target="_blank" className="underline">
              view or download it on GitHub
            </a>
            .
          </p>
        )}
      </main>
    </div>
  );
}
