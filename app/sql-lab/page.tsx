import type { Metadata } from "next";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { SqlLab } from "@/components/sql/sql-lab";

export const metadata: Metadata = { title: "SQL Lab", description: features["sql-lab"].summary };

export default function SqlLabPage() {
  return (
    <PageShell>
      <FeatureHeader id="sql-lab" title="Practice SQL against real tables" />
      <section aria-label="SQL Lab" className="mt-10 sm:mt-12">
        <SqlLab />
        <p className="mt-3 text-[12.5px] text-fg-subtle">
          The sample data is fictional. Changes you make live in this browser tab only and are discarded when you reset or leave the page.
        </p>
      </section>
    </PageShell>
  );
}
