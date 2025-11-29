import { useParams, Navigate } from "react-router-dom";
import { DocLayout } from "@/components/DocLayout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { getPageBySlug, getPageToc } from "@/lib/content";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function DocsPage() {
  const params = useParams();
  const section = params["*"]?.split("/")[0] || "overview";
  const slugSegments = params["*"]?.split("/").slice(1) || [];

  const page = getPageBySlug(section, slugSegments);

  useEffect(() => {
    // Add IDs to headings for TOC navigation
    if (page) {
      const headings = document.querySelectorAll(".markdown-content h2, .markdown-content h3");
      headings.forEach((heading) => {
        const id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-") || "";
        heading.id = id;
      });
    }
  }, [page]);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const tocItems = getPageToc(page.content);

  return (
    <DocLayout>
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        {/* Main Content */}
        <article className="flex-1 max-w-[900px]">
          <MarkdownRenderer content={page.content} currentSection={section} />

          {/* GitHub Link Footer */}
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

        {/* Table of Contents */}
        <TableOfContents items={tocItems} />
      </div>
    </DocLayout>
  );
}
