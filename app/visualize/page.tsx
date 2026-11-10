import type { Metadata } from "next";
import { algorithmCatalog, dataStructureCatalog } from "@/lib/curriculum";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";
import { StatusBadge } from "@/components/ui/status-badge";
import { DijkstraPreview } from "@/components/visualizers/dijkstra-preview";

export const metadata: Metadata = { title: "Visualize", description: features.visualize.summary };

export default function VisualizePage() {
  return (
    <PageShell>
      <FeatureHeader id="visualize" title="See algorithms think" />

      <section aria-labelledby="preview" className="mt-16 sm:mt-20">
        <SectionHeading
          id="preview"
          title="Dijkstra’s shortest path"
          description="Available now as a preview. Each step is computed by a real implementation of the algorithm — use the arrows or the ← → keys."
          aside={<StatusBadge status="preview" />}
        />
        <div className="mt-8">
          <DijkstraPreview />
        </div>
      </section>

      <section aria-labelledby="algorithms" className="mt-16 sm:mt-20">
        <SectionHeading
          id="algorithms"
          title="Algorithms"
          description="Each algorithm will get its own visualization driven by its real logic — not a shared animation."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {algorithmCatalog.map((group) => (
            <div key={group.group} className="rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6">
              <h3 className="text-[13px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{group.group}</h3>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center justify-between gap-3 text-[14.5px] text-fg/90">
                    {item}
                    <StatusBadge status={item.startsWith("Dijkstra") ? "preview" : "planned"} />
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
          aside={<StatusBadge status="planned" />}
        />
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {dataStructureCatalog.map((ds) => (
            <li key={ds} className="rounded-full border border-line-strong bg-white/[0.02] px-4 py-2 text-[14px] text-fg/85">
              {ds}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features.visualize} />
      </div>
    </PageShell>
  );
}
