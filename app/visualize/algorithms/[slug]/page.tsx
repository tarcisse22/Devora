import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { algorithmBySlug, algorithms, categoryLabel } from "@/lib/algorithms/catalog";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FadeIn } from "@/components/ui/fade-in";
import { AlgorithmWorkbench } from "@/components/visualizers/algorithm-workbench";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return algorithms.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const info = algorithmBySlug((await params).slug);
  return info ? { title: `${info.name} visualizer`, description: info.summary } : {};
}

export default async function AlgorithmPage({ params }: Params) {
  const info = algorithmBySlug((await params).slug);
  if (!info) notFound();
  const related = algorithms.filter((a) => a.category === info.category && a.slug !== info.slug);

  return (
    <PageShell>
      <FadeIn>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-fg-muted">
          <Link href="/visualize" className="transition-colors hover:text-fg">
            Visualize
          </Link>
          <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
          <span>{categoryLabel[info.category]}</span>
        </nav>
        <h1 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">{info.name}</h1>
        <p className="mt-4 max-w-[680px] text-[16.5px] leading-relaxed text-fg-muted">{info.explanation}</p>
      </FadeIn>

      <section aria-label={`${info.name} visualization`} className="mt-10">
        <AlgorithmWorkbench slug={info.slug} />
        <p className="mt-3 text-[12.5px] text-fg-subtle">
          Every frame is recorded from a real run of the algorithm on this input. Keyboard: Space to play or pause, ← → to step.
        </p>
      </section>

      <section aria-labelledby="complexity" className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading id="complexity" title="Complexity" />
          <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line [gap:1px] sm:grid-cols-4">
            {(
              [
                ["Best", info.complexity.best],
                ["Average", info.complexity.average],
                ["Worst", info.complexity.worst],
                ["Space", info.complexity.space],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-canvas px-4 py-4">
                <dt className="text-[12px] text-fg-subtle">{label}</dt>
                <dd className="mt-1 font-mono text-[15px] text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 flex flex-wrap gap-2">
            {info.notes.map((note) => (
              <li key={note} className="rounded-full border border-line-strong px-3 py-1 text-[12.5px] text-fg-muted">
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading id="related" title={`More ${categoryLabel[info.category].toLowerCase()} algorithms`} />
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line">
            {related.map((a) => (
              <li key={a.slug}>
                <Link href={`/visualize/algorithms/${a.slug}`} className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]">
                  <span>
                    <span className="block text-[15px] font-medium text-fg">{a.name}</span>
                    <span className="block text-[13px] text-fg-muted">{a.summary}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
