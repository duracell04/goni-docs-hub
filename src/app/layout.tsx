import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Goni Docs",
  description: "Documentation hub for the Goni platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background text-foreground")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
