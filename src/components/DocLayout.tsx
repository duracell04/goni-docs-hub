import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ExternalLink } from "lucide-react";

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="text-xl font-semibold text-foreground">Goni Docs</div>
          <a
            href="https://github.com/duracell04/goni"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <span>View repo on GitHub</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
