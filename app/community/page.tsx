import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Community", description: features.community.summary };

export default function CommunityPage() {
  return (
    <PageShell>
      <FeatureHeader id="community" title="Learn alongside other developers" />

      <EmptyState
        className="mt-16 sm:mt-20"
        icon={MessagesSquare}
        title="The community hasn’t opened yet"
        description="There are no discussions or members to show — community features need accounts, which aren’t available yet."
      >
        <ButtonLink href="/get-started" variant="secondary">
          What you can use today
        </ButtonLink>
      </EmptyState>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features.community} />
      </div>
    </PageShell>
  );
}
