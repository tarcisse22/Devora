import type { Metadata } from "next";
import { Table2 } from "lucide-react";
import { sqlDatasets } from "@/lib/curriculum";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";

export const metadata: Metadata = { title: "SQL Lab", description: features["sql-lab"].summary };

export default function SqlLabPage() {
  return (
    <PageShell>
      <FeatureHeader id="sql-lab" title="Practice SQL against real tables" />

      <section aria-labelledby="datasets" className="mt-16 sm:mt-20">
        <SectionHeading
          id="datasets"
          title="Planned sample datasets"
          description="Small, related tables designed for practising joins and aggregation."
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {sqlDatasets.map((name) => (
            <li
              key={name}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface/50 px-4 py-3.5 font-mono text-[14px] text-fg/90"
            >
              <Table2 className="size-4 text-accent-300" strokeWidth={1.75} aria-hidden />
              {name.toLowerCase()}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features["sql-lab"]} />
      </div>
    </PageShell>
  );
}
