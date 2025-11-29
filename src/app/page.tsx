import { DocLayout } from "@/components/DocLayout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import {
  getAllPages,
  getPageBySlug,
  getPageToc,
  groupPagesBySection,
} from "@/lib/goni-content";
import { ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const pages = await getAllPages();

  if (pages.length === 0) {
    return (
      <DocLayout sections={[]}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Welcome to Goni Docs</h1>
          <p className="text-muted-foreground">No content found. Please add markdown files to your repository.</p>
        </div>
      </DocLayout>
    );
  }

  const sections = groupPagesBySection(pages);
  const overviewSlug = pages.find((page) => page.slug === "overview")?.slug ?? pages[0].slug;
  const page = await getPageBySlug(overviewSlug);
  const tocItems = getPageToc(page.markdown);

  return (
    <DocLayout sections={sections}>
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        <article className="flex-1 max-w-[900px]">
          <MarkdownRenderer content={page.markdown} pages={pages} currentSection={page.meta.section} />

          <div className="mt-12 pt-6 border-t border-border">
            <a
              href={page.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View this page on GitHub</span>
            </a>
          </div>
        </article>

        <TableOfContents items={tocItems} />
      </div>
    </DocLayout>
  );
}
