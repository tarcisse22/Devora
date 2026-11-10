import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { features } from "@/lib/features";
import { languageOrder, languages } from "@/lib/execution/languages";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = { title: "Playground", description: features.playground.summary };

const related = [features["code-tracer"], features["sql-lab"]];

export default function PlaygroundPage() {
  return (
    <PageShell>
      <FeatureHeader id="playground" title="Write code. Run it. See what happens." />

      <section aria-label="Code playground" className="mt-10 sm:mt-12">
        <Playground />
      </section>

      <section aria-labelledby="runtimes" className="mt-16 sm:mt-20">
        <SectionHeading
          id="runtimes"
          title="How your code runs"
          description="Code never runs on Devora’s page itself. Each run happens in an isolated sandbox with no access to your cookies or storage, and long-running programs are stopped automatically."
        />
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
          {languageOrder.map((id) => {
            const lang = languages[id];
            return (
              <li key={id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
                <p className="w-32 shrink-0 font-mono text-[14px] text-fg">{lang.label}</p>
                <p className="flex-1 text-[14px] leading-relaxed text-fg-muted">{lang.note}</p>
                <StatusBadge status={lang.runtime ? "available" : "planned"} className="self-start sm:self-auto" />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="related-tools" className="mt-16 sm:mt-20">
        <SectionHeading id="related-tools" title="Related tools" />
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {related.map(({ id, name, href, icon: Icon, summary, status }) => (
            <li key={id}>
              <Link
                href={href}
                className="group flex h-full items-start gap-4 rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6 transition-colors hover:border-line-strong hover:bg-surface"
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-accent-300" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-[16px] font-semibold text-fg">
                    {name}
                    <ArrowUpRight className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-fg-muted">{summary}</span>
                </span>
                <StatusBadge status={status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
