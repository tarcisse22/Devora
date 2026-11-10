import type { Metadata } from "next";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { CodeTracer } from "@/components/code-tracer/code-tracer";

export const metadata: Metadata = { title: "Code Tracer", description: features["code-tracer"].summary };

export default function CodeTracerPage() {
  return (
    <PageShell>
      <FeatureHeader id="code-tracer" title="Watch your code run, line by line" />
      <section aria-label="Code tracer" className="mt-10 sm:mt-12">
        <CodeTracer />
        <p className="mt-3 max-w-[820px] text-[12.5px] leading-relaxed text-fg-subtle">
          Your code runs in the same isolated sandbox as the Playground, instrumented to record each step (up to 3,000). Synchronous
          JavaScript is traced precisely; code inside async callbacks still runs, but its steps may interleave. Keyboard: ← → to step, Space to
          play.
        </p>
      </section>
    </PageShell>
  );
}
