import { NavLink } from "react-router-dom";
import { getSections } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const sections = getSections();

  return (
    <aside className="w-[280px] border-r border-border bg-card flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <NavLink to="/" className="text-2xl font-bold text-foreground">
          Goni
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            {/* Section Label */}
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 px-3">
              {section.title}
            </div>

            {/* Section Pages */}
            <div className="space-y-1">
              {section.pages.map((page) => {
                const path = section.id === "overview" 
                  ? "/" 
                  : `/${section.id}/${page.slug.join("/")}`;
                
                return (
                  <NavLink
                    key={path}
                    to={path}
                    end
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors relative",
                        isActive
                          ? "bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary"
                          : "text-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    {page.title}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
