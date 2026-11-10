import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { features } from "@/lib/features";
import { subjects } from "@/lib/learn";
import { PageShell } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { ButtonLink } from "@/components/ui/button";
import { SubjectProgress } from "@/components/learn/lesson-progress";

export const metadata: Metadata = { title: "Learn", description: features.learn.summary };

export default function LearnPage() {
  const first = subjects[0];
  return (
    <PageShell>
      <FeatureHeader id="learn" title="Computer Science, one concept at a time">
        <ButtonLink href={`/learn/${first.slug}/${first.lessons[0].slug}`}>Start with the first lesson</ButtonLink>
      </FeatureHeader>

      <section aria-labelledby="subjects" className="mt-14 sm:mt-16">
        <h2 id="subjects" className="sr-only">
          Subjects
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {subjects.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/learn/${s.slug}`}
                className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6 transition-colors hover:border-line-strong hover:bg-surface"
              >
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-200" aria-hidden />
                </span>
                <span className="mt-3 text-[16.5px] font-semibold tracking-[-0.01em] text-fg">{s.name}</span>
                <span className="mt-2 flex-1 text-[13.5px] leading-relaxed text-fg-muted">{s.description}</span>
                <span className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12.5px] text-fg-subtle">{s.lessons.length} lessons</span>
                  <SubjectProgress subject={s.slug} total={s.lessons.length} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[12.5px] text-fg-subtle">Lesson progress is saved in this browser only.</p>
      </section>
    </PageShell>
  );
}
