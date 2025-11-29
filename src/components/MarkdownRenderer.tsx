import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { getAllPages } from "@/lib/content";

interface MarkdownRendererProps {
  content: string;
  currentSection: string;
}

export function MarkdownRenderer({ content, currentSection }: MarkdownRendererProps) {
  const allPages = getAllPages();

  // Convert relative markdown links to React Router links
  const transformLink = (href: string) => {
    // If it's an absolute URL, keep it as is
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href;
    }

    // If it's a markdown file reference
    if (href.endsWith(".md")) {
      // Remove .md extension and ./
      let cleanHref = href.replace(/^\.\//, "").replace(/\.md$/, "");
      
      // Handle ../ (parent directory references)
      if (cleanHref.startsWith("../")) {
        cleanHref = cleanHref.replace(/^\.\.\//, "");
        // Try to find the page in our content
        const targetPage = allPages.find((page) => {
          const pagePath = page.section === "overview" ? "" : `${page.section}/${page.slug.join("/")}`;
          return pagePath.endsWith(cleanHref);
        });
        
        if (targetPage) {
          return targetPage.section === "overview" 
            ? "/" 
            : `/${targetPage.section}/${targetPage.slug.join("/")}`;
        }
      }
      
      // Same directory reference
      return `/${currentSection}/${cleanHref}`;
    }

    return href;
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const transformedHref = transformLink(href || "");
            const isExternal = transformedHref.startsWith("http");

            if (isExternal) {
              return (
                <a
                  href={transformedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            return (
              <Link to={transformedHref} {...props}>
                {children}
              </Link>
            );
          },
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            // For block code, just return the code element
            // react-markdown wraps it in <pre> automatically
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
