"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/learn/types";
import { cn } from "@/lib/utils";
import { LessonText } from "./lesson-text";

function Question({ q, index }: { q: QuizQuestion; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === q.answer;

  return (
    <fieldset className="rounded-[var(--radius-lg)] border border-line bg-surface/50 p-5">
      <legend className="sr-only">Question {index + 1}</legend>
      <p className="text-[15px] font-medium leading-relaxed text-fg">
        <span className="mr-2 font-mono text-[13px] text-accent-300">Q{index + 1}</span>
        <LessonText text={q.question} />
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {q.options.map((option, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              aria-pressed={isPicked}
              className={cn(
                "flex items-center gap-2 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-[14px] transition-colors",
                !answered && "border-line-strong text-fg/90 hover:border-white/25 hover:bg-white/[0.04]",
                answered && isAnswer && "border-success/50 bg-success/10 text-fg",
                answered && isPicked && !isAnswer && "border-[#ff9b9b]/50 bg-[#ff9b9b]/10 text-fg",
                answered && !isAnswer && !isPicked && "border-line text-fg-subtle",
              )}
            >
              {answered && isAnswer && <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Correct answer" />}
              {answered && isPicked && !isAnswer && <XCircle className="size-4 shrink-0 text-[#ff9b9b]" aria-label="Your answer" />}
              <span>
                <LessonText text={option} />
              </span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3" aria-live="polite">
          <p className="text-[14px] leading-relaxed text-fg-muted">
            <span className={cn("font-medium", correct ? "text-success" : "text-[#ffb3b3]")}>{correct ? "Correct. " : "Not quite. "}</span>
            <LessonText text={q.explanation} />
          </p>
          <button type="button" onClick={() => setPicked(null)} className="text-[13px] text-fg-muted transition-colors hover:text-fg">
            Try again
          </button>
        </div>
      )}
    </fieldset>
  );
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <Question key={q.question} q={q} index={i} />
      ))}
    </div>
  );
}
