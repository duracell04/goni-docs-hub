import Link from "next/link";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPages, slugifyHeading } from "@/lib/content";

interface MarkdownRendererProps {
  content: string;
  currentSection: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) return extractText(node.props.children);
  return "";
}

const Heading = (Tag: "h2" | "h3") =>
  function HeadingComponent({ children, ...props }: { children?: ReactNode }) {
    const text = extractText(children);
    const id = slugifyHeading(text);
    return (
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  };

export function MarkdownRenderer({ content, currentSection }: MarkdownRendererProps) {
  const allPages = getAllPages();

  const transformLink = (href: string) => {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href;
    }

    if (href.endsWith(".md")) {
      let cleanHref = href.replace(/^\.\//, "").replace(/\.md$/, "");

      if (cleanHref.startsWith("../")) {
        cleanHref = cleanHref.replace(/^\.\.\//, "");

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
                <a href={transformedHref} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              );
            }

            return (
              <Link href={transformedHref} {...props}>
                {children}
              </Link>
            );
          },
          h2: Heading("h2"),
          h3: Heading("h3"),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
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
