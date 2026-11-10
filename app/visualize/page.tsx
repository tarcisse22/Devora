import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { algorithms, categoryLabel, type AlgorithmCategory } from "@/lib/algorithms/catalog";
import { dataStructures } from "@/lib/data-structures/catalog";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = { title: "Visualize", description: features.visualize.summary };

const categories: AlgorithmCategory[] = ["sorting", "searching", "graph"];

export default function VisualizePage() {
  return (
    <PageShell>
      <FeatureHeader id="visualize" title="See algorithms think" />

      <section aria-labelledby="algorithms" className="mt-16 sm:mt-20">
        <SectionHeading
          id="algorithms"
          title="Algorithms"
          description="Each one runs its real implementation on your input and records every step — play it, pause it, step through it, change the input."
          aside={<StatusBadge status="available" />}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat} className="rounded-[var(--radius-lg)] border border-line bg-surface/50 p-2">
              <h3 className="px-4 pb-2 pt-3 text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{categoryLabel[cat]}</h3>
              <ul>
                {algorithms
                  .filter((a) => a.category === cat)
                  .map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/visualize/algorithms/${a.slug}`}
                        className="group flex items-start justify-between gap-3 rounded-[var(--radius-md)] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                      >
                        <span>
                          <span className="block text-[15px] font-medium text-fg">{a.name}</span>
                          <span className="mt-0.5 block text-[13px] leading-relaxed text-fg-muted">{a.summary}</span>
                        </span>
                        <span className="mt-0.5 flex shrink-0 items-center gap-2">
                          <span className="font-mono text-[11.5px] text-fg-subtle">{a.complexity.average}</span>
                          <ArrowUpRight className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-200" aria-hidden />
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="data-structures" className="mt-16 sm:mt-20">
        <SectionHeading
          id="data-structures"
          title="Data structures"
          description="Operate on each structure — insert, delete, push, pop, enqueue — and watch it change, with an explanation of every step."
          aside={<StatusBadge status="available" />}
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dataStructures.map((ds) => (
            <li key={ds.slug}>
              <Link
                href={`/visualize/data-structures/${ds.slug}`}
                className="group flex h-full items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-surface/50 px-5 py-4 transition-colors hover:border-line-strong hover:bg-surface"
              >
                <span>
                  <span className="block text-[15px] font-medium text-fg">{ds.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-fg-muted">{ds.summary}</span>
                </span>
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-200" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
