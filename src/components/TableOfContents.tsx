"use client";

import { TocItem } from "@/lib/goni-content";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" },
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is Element => Boolean(element));

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="hidden xl:block w-[240px] flex-shrink-0">
      <div className="sticky top-8 pl-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
          On this page
        </div>
        <nav className="space-y-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block text-sm transition-colors hover:text-primary",
                item.level === 3 ? "pl-4" : "",
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
