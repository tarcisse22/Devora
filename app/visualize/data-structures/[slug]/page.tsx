import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { dataStructureBySlug, dataStructures } from "@/lib/data-structures/catalog";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FadeIn } from "@/components/ui/fade-in";
import { DataStructureWorkbench } from "@/components/data-structures/workbench";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return dataStructures.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const info = dataStructureBySlug((await params).slug);
  return info ? { title: `${info.name} visualizer`, description: info.summary } : {};
}

export default async function DataStructurePage({ params }: Params) {
  const info = dataStructureBySlug((await params).slug);
  if (!info) notFound();
  const others = dataStructures.filter((d) => d.slug !== info.slug);

  return (
    <PageShell>
      <FadeIn>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-fg-muted">
          <Link href="/visualize" className="transition-colors hover:text-fg">
            Visualize
          </Link>
          <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
          <span>Data structures</span>
        </nav>
        <h1 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">{info.name}</h1>
        <p className="mt-4 max-w-[680px] text-[16.5px] leading-relaxed text-fg-muted">{info.explanation}</p>
      </FadeIn>

      <section aria-label={`${info.name} workbench`} className="mt-10">
        <DataStructureWorkbench slug={info.slug} />
        <p className="mt-3 text-[12.5px] text-fg-subtle">
          Every step is produced by a real implementation of the structure. Changes live in this page only and reset when you leave.
        </p>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading id="costs" title="Operation costs" />
          <dl className="mt-6 divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line">
            {info.operations.map((op) => (
              <div key={op.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3.5">
                <dt className="text-[14.5px] text-fg">
                  {op.name}
                  {op.note && <span className="ml-2 text-[12.5px] text-fg-subtle">{op.note}</span>}
                </dt>
                <dd className="font-mono text-[14px] text-accent-200">{op.cost}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <SectionHeading id="more" title="More data structures" />
          <ul className="mt-6 grid grid-cols-2 gap-2">
            {others.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/visualize/data-structures/${d.slug}`}
                  className="flex h-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-line px-4 py-3 text-[14px] text-fg/90 transition-colors hover:border-line-strong hover:bg-white/[0.03]"
                >
                  {d.name}
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
