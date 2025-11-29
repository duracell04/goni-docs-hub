import { notFound } from "next/navigation";
import { DocLayout } from "@/components/DocLayout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { getPageBySlug, getPageToc } from "@/lib/content";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: { section: string; slug?: string[] };
}

export default function SectionPage({ params }: PageProps) {
  const slugSegments = params.slug ?? [];
  const page = getPageBySlug(params.section, slugSegments);

  if (!page) {
    return notFound();
  }

  const tocItems = getPageToc(page.content);

  return (
    <DocLayout>
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        <article className="flex-1 max-w-[900px]">
          <MarkdownRenderer content={page.content} currentSection={params.section} />

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
