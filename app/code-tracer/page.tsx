import type { Metadata } from "next";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Code Tracer", description: features["code-tracer"].summary };

export default function CodeTracerPage() {
  return (
    <PageShell>
      <FeatureHeader id="code-tracer" title="Watch your code run, line by line">
        <ButtonLink href="/playground" variant="secondary">
          See the Playground plans
        </ButtonLink>
      </FeatureHeader>
      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features["code-tracer"]} />
      </div>
    </PageShell>
  );
}
