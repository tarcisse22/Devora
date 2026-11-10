import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { learnSubjects } from "@/lib/curriculum";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Learn", description: features.learn.summary };

export default function LearnPage() {
  return (
    <PageShell>
      <FeatureHeader id="learn" title="Computer Science, one concept at a time">
        <ButtonLink href="/visualize#preview">
          Try the visualizer preview
          <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </FeatureHeader>

      <section aria-labelledby="subjects" className="mt-16 sm:mt-20">
        <SectionHeading
          id="subjects"
          title="Curriculum outline"
          description="The subjects Devora will cover and the first topics planned for each. Lessons are not published yet."
        />
        <ol className="mt-8 grid overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line [gap:1px] sm:grid-cols-2 lg:grid-cols-4">
          {learnSubjects.map((subject, i) => (
            <li key={subject.name} className="bg-canvas p-6">
              <span className="font-mono text-[12px] text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-fg">{subject.name}</h3>
              <ul className="mt-3 space-y-1.5">
                {subject.topics.map((topic) => (
                  <li key={topic} className="text-[13.5px] text-fg-muted">
                    {topic}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features.learn} />
      </div>
    </PageShell>
  );
}
