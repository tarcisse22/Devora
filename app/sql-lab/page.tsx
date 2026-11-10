import type { Metadata } from "next";
import { Suspense } from "react";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { SqlLab } from "@/components/sql/sql-lab";
import { SqlLabFromUrl } from "@/components/shared/from-url";

export const metadata: Metadata = { title: "SQL Lab", description: features["sql-lab"].summary };

export default function SqlLabPage() {
  return (
    <PageShell>
      <FeatureHeader id="sql-lab" title="Practice SQL against real tables" />
      <section aria-label="SQL Lab" className="mt-10 sm:mt-12">
        <Suspense fallback={<SqlLab />}>
          <SqlLabFromUrl />
        </Suspense>
        <p className="mt-3 text-[12.5px] text-fg-subtle">
          The sample data is fictional. Changes you make live in this browser tab only and are discarded when you reset or leave the page.
        </p>
      </section>
    </PageShell>
  );
}
