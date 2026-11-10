import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { allLessons, findLesson, lessonHref, readingMinutes } from "@/lib/learn";
import { PageShell } from "@/components/layout/page-shell";
import { FadeIn } from "@/components/ui/fade-in";
import { LessonBlocks } from "@/components/learn/lesson-blocks";
import { Quiz } from "@/components/learn/quiz";
import { LessonNav, MarkComplete } from "@/components/learn/lesson-progress";
import { SyncNote } from "@/components/auth/sync-note";

type Params = { params: Promise<{ subject: string; lesson: string }> };

export function generateStaticParams() {
  return allLessons.map(({ subject, lesson }) => ({ subject: subject.slug, lesson: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject, lesson } = await params;
  const found = findLesson(subject, lesson);
  return found ? { title: `${found.lesson.title} · ${found.subject.name}`, description: found.lesson.summary } : {};
}

export default async function LessonPage({ params }: Params) {
  const { subject: subjectSlug, lesson: lessonSlug } = await params;
  const found = findLesson(subjectSlug, lessonSlug);
  if (!found) notFound();
  const { subject, lesson, prev, next } = found;
  const position = subject.lessons.indexOf(lesson) + 1;

  return (
    <PageShell>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-14">
        <article className="min-w-0 max-w-[760px]">
          <FadeIn>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-fg-muted">
              <Link href="/learn" className="transition-colors hover:text-fg">
                Learn
              </Link>
              <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
              <Link href={`/learn/${subject.slug}`} className="transition-colors hover:text-fg">
                {subject.name}
              </Link>
            </nav>
            <p className="mt-6 text-[13px] font-medium text-accent-300">
              Lesson {position} of {subject.lessons.length}
            </p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg">{lesson.title}</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-fg-muted">{lesson.summary}</p>
            <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
              <Clock className="size-3.5" aria-hidden /> {readingMinutes(lesson)} min read
            </p>
          </FadeIn>

          <div className="mt-10">
            <LessonBlocks blocks={lesson.blocks} />
          </div>

          <section aria-labelledby="exercise" className="mt-14">
            <h2 id="exercise" className="text-[20px] font-semibold tracking-[-0.015em] text-fg">
              Check your understanding
            </h2>
            <p className="mt-1.5 text-[14px] text-fg-muted">Pick an answer to see whether it’s right — and why.</p>
            <div className="mt-5">
              <Quiz questions={lesson.quiz} />
            </div>
          </section>

          <section aria-labelledby="related" className="mt-12">
            <h2 id="related" className="text-[16px] font-semibold text-fg">
              Related
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lesson.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-[13.5px] text-fg/90 transition-colors hover:border-accent-300/50 hover:text-accent-100">
                    {r.label}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <nav aria-label="Lesson navigation" className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={lessonHref(prev.subject.slug, prev.lesson.slug)} className="group rounded-[var(--radius-lg)] border border-line px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-white/[0.02]">
                <span className="flex items-center gap-1.5 text-[12px] text-fg-subtle">
                  <ArrowLeft className="size-3.5" aria-hidden /> Previous
                </span>
                <span className="mt-1 block text-[14.5px] font-medium text-fg">{prev.lesson.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={lessonHref(next.subject.slug, next.lesson.slug)} className="group rounded-[var(--radius-lg)] border border-line px-4 py-3.5 text-right transition-colors hover:border-line-strong hover:bg-white/[0.02]">
                <span className="flex items-center justify-end gap-1.5 text-[12px] text-fg-subtle">
                  Next{next.subject.slug !== subject.slug && ` · ${next.subject.name}`} <ArrowRight className="size-3.5" aria-hidden />
                </span>
                <span className="mt-1 block text-[14.5px] font-medium text-fg">{next.lesson.title}</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <MarkComplete subject={subject.slug} lesson={lesson.slug} />
          <div className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-4">
            <p className="px-2.5 pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{subject.name}</p>
            <LessonNav subject={subject.slug} lessons={subject.lessons} current={lesson.slug} />
          </div>
          <SyncNote className="block px-1" />
        </aside>
      </div>
    </PageShell>
  );
}
