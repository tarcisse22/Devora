import type { Metadata } from "next";
import { features } from "@/lib/features";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { ThreadList } from "@/components/community/thread-list";

export const metadata: Metadata = { title: "Community", description: features.community.summary };

export default function CommunityPage() {
  return (
    <PageShell>
      <FeatureHeader id="community" title="Learn alongside other developers" />
      <section aria-label="Threads" className="mt-10 sm:mt-12">
        <ThreadList />
      </section>
    </PageShell>
  );
}
