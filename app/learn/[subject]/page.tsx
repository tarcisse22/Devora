import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { lessonHref, readingMinutes, subjectBySlug, subjects } from "@/lib/learn";
import { PageShell } from "@/components/layout/page-shell";
import { FadeIn } from "@/components/ui/fade-in";
import { SubjectProgress } from "@/components/learn/lesson-progress";

type Params = { params: Promise<{ subject: string }> };

export function generateStaticParams() {
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = subjectBySlug((await params).subject);
  return s ? { title: `${s.name} · Learn`, description: s.description } : {};
}

export default async function SubjectPage({ params }: Params) {
  const s = subjectBySlug((await params).subject);
  if (!s) notFound();
  return (
    <PageShell>
      <FadeIn>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-fg-muted">
          <Link href="/learn" className="transition-colors hover:text-fg">
            Learn
          </Link>
          <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
          <span>{s.name}</span>
        </nav>
        <h1 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">{s.name}</h1>
        <p className="mt-4 max-w-[680px] text-[16.5px] leading-relaxed text-fg-muted">{s.description}</p>
        <div className="mt-5">
          <SubjectProgress subject={s.slug} total={s.lessons.length} />
        </div>
      </FadeIn>

      <ol className="mt-10 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
        {s.lessons.map((l, i) => (
          <li key={l.slug}>
            <Link href={lessonHref(s.slug, l.slug)} className="group flex items-center gap-5 px-5 py-5 transition-colors hover:bg-white/[0.025] sm:px-6">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[13px] text-accent-200">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-medium text-fg">{l.title}</span>
                <span className="mt-0.5 block text-[13.5px] text-fg-muted">{l.summary}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-1.5 text-[12.5px] text-fg-subtle sm:flex">
                <Clock className="size-3.5" aria-hidden />
                {readingMinutes(l)} min
              </span>
              <ChevronRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
