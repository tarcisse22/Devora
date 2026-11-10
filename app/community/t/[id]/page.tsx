import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ThreadView } from "@/components/community/thread-view";

export const metadata: Metadata = { title: "Thread · Community" };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell>
      <ThreadView id={id} />
    </PageShell>
  );
}
