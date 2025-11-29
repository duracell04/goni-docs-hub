"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSections } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const sections = getSections();
  const pathname = usePathname();

  return (
    <aside className="w-[280px] border-r border-border bg-card flex-shrink-0 overflow-y-auto">
      <div className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="text-2xl font-bold text-foreground">
          Goni
        </Link>
      </div>

      <nav className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 px-3">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.pages.map((page) => {
                const path = section.id === "overview" ? "/" : `/${section.id}/${page.slug.join("/")}`;
                const isActive =
                  path === "/"
                    ? pathname === "/"
                    : pathname === path || pathname?.startsWith(`${path}/`);

                return (
                  <Link
                    key={path}
                    href={path}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm transition-colors relative",
                      isActive
                        ? "bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary"
                        : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
