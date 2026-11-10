"use client";

import { useEffect, useRef } from "react";
import { Eraser, LoaderCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OutputLine, RunStatus } from "./use-code-runner";

const streamStyles: Record<OutputLine["stream"], string> = {
  stdout: "text-fg/90",
  info: "text-[#8ec5ff]",
  warn: "text-warning",
  stderr: "text-[#ff9b9b]",
  system: "text-fg-muted italic",
};

const statusLabel: Record<RunStatus, string> = {
  idle: "Ready",
  loading: "Loading",
  running: "Running",
  success: "Done",
  error: "Error",
};

const statusDot: Record<RunStatus, string> = {
  idle: "bg-fg-subtle",
  loading: "bg-warning animate-pulse",
  running: "bg-accent-300 animate-pulse",
  success: "bg-success",
  error: "bg-[#ff8a8a]",
};

type Props = {
  output: OutputLine[];
  status: RunStatus;
  statusText: string | null;
  onClear: () => void;
  emptyHint?: string;
  className?: string;
};

export function OutputPanel({ output, status, statusText, onClear, emptyHint = "Run your code to see its output here.", className }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the newest output in view.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output]);

  return (
    <section aria-label="Output" className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
        <div className="flex items-center gap-2.5 text-[13px] font-medium text-fg">
          <Terminal className="size-4 text-fg-subtle" strokeWidth={1.75} aria-hidden />
          Output
          <span className="flex items-center gap-1.5 text-[12px] font-normal text-fg-muted" aria-live="polite">
            <span aria-hidden className={cn("size-1.5 rounded-full", statusDot[status])} />
            {statusLabel[status]}
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={output.length === 0}
          className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[12.5px] text-fg-muted transition-colors hover:bg-white/[0.05] hover:text-fg disabled:pointer-events-none disabled:opacity-40"
        >
          <Eraser className="size-3.5" aria-hidden />
          Clear
        </button>
      </div>

      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        className="min-h-0 flex-1 overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]"
      >
        {output.length === 0 && status !== "loading" && status !== "running" ? (
          <p className="text-fg-subtle">{emptyHint}</p>
        ) : (
          output.map((line) => (
            <pre key={line.id} className={cn("whitespace-pre-wrap break-words", streamStyles[line.stream])}>
              {line.text}
            </pre>
          ))
        )}
        {(status === "loading" || status === "running") && (
          <p className="mt-1 flex items-center gap-2 text-fg-muted">
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            {status === "loading" && statusText ? statusText : "Running…"}
          </p>
        )}
      </div>

      {statusText && status !== "loading" && (
        <p className="shrink-0 border-t border-line px-4 py-2 text-[12px] text-fg-subtle">{statusText}</p>
      )}
    </section>
  );
}
