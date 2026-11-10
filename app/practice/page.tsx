import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Practice", description: features.practice.summary };

const levels = [
  { name: "Easy", tone: "text-success", text: "One core idea, small inputs. Good for checking you understand a concept." },
  { name: "Medium", tone: "text-warning", text: "Combines ideas and asks you to think about efficiency." },
  { name: "Hard", tone: "text-accent-300", text: "Requires choosing the right data structure or algorithm under tight constraints." },
];

export default function PracticePage() {
  return (
    <PageShell>
      <FeatureHeader id="practice" title="Sharpen your skills with real problems" />

      <section aria-labelledby="levels" className="mt-16 sm:mt-20">
        <SectionHeading id="levels" title="Difficulty levels" description="Every challenge will carry one of three levels." />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {levels.map((level) => (
            <li key={level.name} className="rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6">
              <p className={`text-[15px] font-semibold ${level.tone}`}>{level.name}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{level.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <EmptyState
        className="mt-12"
        icon={ListChecks}
        title="No challenges published yet"
        description="The first set of original challenges — each with real test cases — is in development."
      >
        <ButtonLink href="/visualize#preview" variant="secondary">
          Explore the visualizer preview
        </ButtonLink>
      </EmptyState>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features.practice} />
      </div>
    </PageShell>
  );
}
