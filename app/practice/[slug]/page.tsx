import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { challengeBySlug, challenges } from "@/lib/practice/challenges";
import { PageShell } from "@/components/layout/page-shell";
import { ChallengeWorkspace } from "@/components/practice/challenge-workspace";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return challenges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = challengeBySlug((await params).slug);
  return c ? { title: `${c.title} · Practice`, description: `${c.difficulty} challenge: ${c.topics.join(", ")}` } : {};
}

export default async function ChallengePage({ params }: Params) {
  const c = challengeBySlug((await params).slug);
  if (!c) notFound();
  const i = challenges.indexOf(c);
  const next = challenges[i + 1];

  return (
    <PageShell>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-fg-muted">
        <Link href="/practice" className="transition-colors hover:text-fg">
          Practice
        </Link>
        <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
        <span>{c.difficulty}</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(1.8rem,3.6vw,2.5rem)] font-semibold tracking-[-0.03em] text-fg">{c.title}</h1>
        {next && (
          <Link href={`/practice/${next.slug}`} className="flex items-center gap-1 text-[13.5px] text-fg-muted transition-colors hover:text-fg">
            Next: {next.title}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      <div className="mt-8">
        <ChallengeWorkspace slug={c.slug} />
      </div>
    </PageShell>
  );
}
