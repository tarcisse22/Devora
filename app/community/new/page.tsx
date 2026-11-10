import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { NewThreadForm } from "@/components/community/new-thread-form";

export const metadata: Metadata = { title: "New thread · Community" };

export default function NewThreadPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[760px]">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-[13.5px] text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Community
        </Link>
        <h1 className="mt-5 text-[clamp(1.8rem,3.6vw,2.3rem)] font-semibold tracking-[-0.03em] text-fg">Start a thread</h1>
        <div className="mt-8">
          <NewThreadForm />
        </div>
      </div>
    </PageShell>
  );
}
