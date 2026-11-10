import type { Metadata } from "next";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { ChallengeList } from "@/components/practice/challenge-list";

export const metadata: Metadata = { title: "Practice", description: features.practice.summary };

export default function PracticePage() {
  return (
    <PageShell>
      <FeatureHeader id="practice" title="Sharpen your skills with real problems" />
      <section aria-label="Challenges" className="mt-10 sm:mt-12">
        <ChallengeList />
      </section>
    </PageShell>
  );
}
