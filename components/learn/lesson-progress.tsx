"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LEARN_PROGRESS_KEY, lessonHref, lessonKey } from "@/lib/learn/keys";
import { toggleInLocalList, useLocalList } from "@/lib/local-store";
import { cn } from "@/lib/utils";

/** Toggle a lesson's completed state (saved in this browser). */
export function MarkComplete({ subject, lesson }: { subject: string; lesson: string }) {
  const done = useLocalList(LEARN_PROGRESS_KEY).includes(lessonKey(subject, lesson));
  return (
    <button
      type="button"
      onClick={() => toggleInLocalList(LEARN_PROGRESS_KEY, lessonKey(subject, lesson))}
      aria-pressed={done}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border text-[14px] font-medium transition-colors",
        done ? "border-success/40 bg-success/10 text-success hover:bg-success/15" : "border-line-strong text-fg hover:border-white/25 hover:bg-white/[0.05]",
      )}
    >
      {done ? <CheckCircle2 className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />}
      {done ? "Completed" : "Mark as complete"}
    </button>
  );
}

/** Lesson list for a subject, with completion marks and the current lesson highlighted. */
export function LessonNav({ subject, lessons, current }: { subject: string; lessons: { slug: string; title: string }[]; current?: string }) {
  const done = useLocalList(LEARN_PROGRESS_KEY);
  return (
    <ol className="space-y-1">
      {lessons.map((l, i) => {
        const complete = done.includes(lessonKey(subject, l.slug));
        const active = l.slug === current;
        return (
          <li key={l.slug}>
            <Link
              href={lessonHref(subject, l.slug)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13.5px] transition-colors",
                active ? "bg-white/[0.06] text-fg" : "text-fg-muted hover:bg-white/[0.03] hover:text-fg",
              )}
            >
              {complete ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completed" />
              ) : (
                <span className="flex size-4 shrink-0 items-center justify-center font-mono text-[11px] text-fg-subtle">{i + 1}</span>
              )}
              {l.title}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** "2 / 3 completed" for a subject. */
export function SubjectProgress({ subject, total }: { subject: string; total: number }) {
  const done = useLocalList(LEARN_PROGRESS_KEY).filter((k) => k.startsWith(`${subject}/`)).length;
  const pct = Math.round((done / total) * 100);
  return (
    <span className="flex items-center gap-2.5 text-[12.5px] text-fg-muted">
      <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
        <span className="block h-full rounded-full bg-accent-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </span>
      {done} / {total} completed
    </span>
  );
}
