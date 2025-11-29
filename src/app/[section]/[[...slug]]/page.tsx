import { notFound } from "next/navigation";
import { DocLayout } from "@/components/DocLayout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import {
  getAllPages,
  getPageBySectionAndSlug,
  getPageToc,
  groupPagesBySection,
} from "@/lib/goni-content";
import { ExternalLink } from "lucide-react";

export const revalidate = 60;

interface PageProps {
  params: { section: string; slug?: string[] };
}

export default async function SectionPage({ params }: PageProps) {
  const slugSegments = params.slug ?? [];

  const pages = await getAllPages();
  const sections = groupPagesBySection(pages);

  let page: Awaited<ReturnType<typeof getPageBySectionAndSlug>>;

  try {
    page = await getPageBySectionAndSlug(params.section, slugSegments);
  } catch {
    return notFound();
  }

  const tocItems = getPageToc(page.markdown);

  return (
    <DocLayout sections={sections}>
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        <article className="flex-1 max-w-[900px]">
          <MarkdownRenderer
            content={page.markdown}
            pages={pages}
            currentSection={page.meta.section}
          />

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
