"use client";

import { Check, RotateCcw } from "lucide-react";
import { clearLocalList, toggleInLocalList, useLocalList } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import { SyncNote } from "@/components/auth/sync-note";

export const checklistKey = (slug: string) => `devora:project:${slug}:checklist`;

export function ProjectChecklist({ slug, items }: { slug: string; items: string[] }) {
  const key = checklistKey(slug);
  const done = useLocalList(key);
  const count = items.filter((_, i) => done.includes(String(i))).length;
  const pct = Math.round((count / items.length) * 100);

  return (
    <section aria-labelledby="checklist-heading" className="rounded-[var(--radius-xl)] border border-line-strong bg-surface/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="checklist-heading" className="text-[18px] font-semibold tracking-[-0.01em] text-fg">
          Completion checklist
        </h2>
        <span className="text-[13px] text-fg-muted" aria-live="polite">
          {count} of {items.length} done
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
        <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-200 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-5 space-y-1">
        {items.map((item, i) => {
          const checked = done.includes(String(i));
          return (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] px-2 py-2 transition-colors hover:bg-white/[0.03]">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggleInLocalList(key, String(i))} />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-300",
                    checked ? "border-accent-300 bg-accent-300 text-[#14101f]" : "border-line-strong",
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className={cn("text-[14.5px] leading-relaxed transition-colors", checked ? "text-fg-muted line-through decoration-fg-subtle" : "text-fg/90")}>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[12.5px] text-fg-subtle">
        <SyncNote />
        {count > 0 && (
          <button type="button" onClick={() => clearLocalList(key)} className="flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg">
            <RotateCcw className="size-3.5" aria-hidden /> Reset checklist
          </button>
        )}
      </div>
    </section>
  );
}

/** Small "3 / 8" progress label for project lists. */
export function ChecklistProgress({ slug, total }: { slug: string; total: number }) {
  const done = useLocalList(checklistKey(slug)).length;
  if (done === 0) return null;
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11.5px]", done >= total ? "border-success/30 bg-success/10 text-success" : "border-line-strong text-fg-muted")}>
      {done >= total ? "Completed" : `${done} / ${total}`}
    </span>
  );
}
