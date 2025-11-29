import Link from "next/link";
import { DocLayout } from "@/components/DocLayout";
import { getAllPages, groupPagesBySection, pageHref } from "@/lib/goni-content";

export const revalidate = 60;

export default async function DocsIndexPage() {
  const pages = await getAllPages();
  const sections = groupPagesBySection(pages);

  return (
    <DocLayout sections={sections}>
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Goni documentation</h1>
          <p className="text-sm text-muted-foreground">
            These pages are pulled directly from the <code>duracell04/goni</code> repository.
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.id} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="space-y-2">
              {section.pages.map((page) => (
                <li key={page.slug} className="group">
                  <Link
                    href={pageHref(page)}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">{page.title}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground">
                      {page.path}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </DocLayout>
  );
}
