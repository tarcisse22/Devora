"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import type { Mark } from "@/lib/data-structures/types";
import { cn } from "@/lib/utils";
import { OP_SPEEDS, type LogEntry, type OpRunner, type OpSpeed } from "./use-op-runner";

/* ------------------------------------------------------------- marks */

/** Classes for an HTML element with an optional mark. */
export function markClasses(mark: Mark | undefined) {
  switch (mark) {
    case "active":
      return "border-accent-200 bg-accent-200/20 text-fg shadow-[0_0_18px_-4px_rgb(207_196_255/0.7)]";
    case "new":
      return "border-[#f0a6ca] bg-[#f0a6ca]/15 text-fg shadow-[0_0_18px_-4px_rgb(240_166_202/0.6)]";
    case "removed":
      return "border-[#ff9b9b] bg-[#ff9b9b]/15 text-[#ffc2c2] line-through decoration-[#ff9b9b]/70";
    case "found":
      return "border-success bg-success/15 text-success shadow-[0_0_18px_-4px_rgb(110_231_183/0.6)]";
    case "path":
      return "border-accent-400/60 bg-accent-700/30 text-fg";
    default:
      return "border-line-strong bg-white/[0.04] text-fg/90";
  }
}

/** SVG fill / stroke classes for a mark. */
export function markSvg(mark: Mark | undefined) {
  switch (mark) {
    case "active":
      return "fill-[#2a2150] stroke-accent-200";
    case "new":
      return "fill-[#3a1f30] stroke-[#f0a6ca]";
    case "removed":
      return "fill-[#3a1c1f] stroke-[#ff9b9b]";
    case "found":
      return "fill-[#123227] stroke-success";
    case "path":
      return "fill-[#1e1934] stroke-accent-400";
    default:
      return "fill-[#16151f] stroke-white/25";
  }
}

export const markLegend = [
  { label: "Visiting", mark: "active" as const },
  { label: "Inserted / moved", mark: "new" as const },
  { label: "Removed", mark: "removed" as const },
  { label: "Found", mark: "found" as const },
  { label: "Visited", mark: "path" as const },
];

/* ------------------------------------------------------------ inputs */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-fg-muted">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "h-9 rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-2.5 font-mono text-[13px] text-fg focus-visible:outline-2 focus-visible:outline-accent-300";

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  onEnter,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  onEnter?: () => void;
}) {
  return (
    <input
      type="number"
      aria-label={label}
      min={min}
      max={max}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => {
        const v = Math.round(Number(e.target.value));
        if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
      }}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      className={cn(inputClass, "w-[72px]")}
    />
  );
}

export function TextInput({ value, onChange, label, onEnter }: { value: string; onChange: (v: string) => void; label: string; onEnter?: () => void }) {
  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      maxLength={12}
      onChange={(e) => onChange(e.target.value.replace(/\s/g, "").toLowerCase())}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      className={cn(inputClass, "w-[110px]")}
    />
  );
}

export function OpButton({
  children,
  onClick,
  disabled,
  primary,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-9 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        primary
          ? "bg-accent-200 text-[#14101f] hover:bg-accent-100"
          : "border border-line-strong bg-white/[0.02] text-fg hover:border-white/25 hover:bg-white/[0.06]",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- shell */

type ShellProps = {
  /** Inputs + operation buttons. */
  controls: ReactNode;
  canvas: ReactNode;
  message: string;
  busy: boolean;
  log: LogEntry[];
  speed: OpSpeed;
  onSpeed: (s: OpSpeed) => void;
  /** Extra panel under the explanation (e.g. adjacency list). */
  aside?: ReactNode;
};

/** Shared frame for every data-structure workbench. */
export function DSShell({ controls, canvas, message, busy, log, speed, onSpeed, aside }: ShellProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-line px-4 py-3">{controls}</div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-x-auto sm:min-h-[360px]">{canvas}</div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-fg-subtle">
            {markLegend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("inline-block size-2.5 rounded-[3px] border", markClasses(l.mark))} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-4 sm:p-5">
          <div>
            <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
              What’s happening
              {busy && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
            </h3>
            <p className="mt-2 min-h-[66px] text-[14px] leading-relaxed text-fg/90" aria-live="polite">
              {message}
            </p>
          </div>

          {aside}

          <div className="min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Operation log</h3>
              <div className="flex items-center gap-1" role="group" aria-label="Animation speed">
                {(Object.keys(OP_SPEEDS) as OpSpeed[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={speed === s}
                    onClick={() => onSpeed(s)}
                    className={cn("h-7 rounded-[6px] px-2 text-[11.5px] transition-colors", speed === s ? "bg-white/[0.08] text-fg" : "text-fg-subtle hover:text-fg")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <ol className="mt-2.5 max-h-[220px] space-y-1.5 overflow-y-auto pr-1" aria-label="Operation log">
              {log.length === 0 ? (
                <li className="text-[13px] text-fg-subtle">Run an operation to see it explained here.</li>
              ) : (
                log.map((entry) => (
                  <li key={entry.id} className="flex gap-2 text-[12.5px] leading-relaxed">
                    {entry.error ? (
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[#ff9b9b]" aria-label="Rejected" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success/80" aria-label="Done" />
                    )}
                    <span>
                      <span className="font-medium text-fg">{entry.op}</span>
                      <span className="text-fg-muted"> — {entry.text}</span>
                    </span>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The DSShell props that come straight from an operation runner. */
export function shellProps<S>(r: OpRunner<S>) {
  return { message: r.view.message, busy: r.busy, log: r.log, speed: r.speed, onSpeed: r.setSpeed };
}
