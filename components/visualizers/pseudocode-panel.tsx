import { cn } from "@/lib/utils";

/** Pseudocode with the currently executing line highlighted. */
export function PseudocodePanel({ lines, active }: { lines: string[]; active: number }) {
  return (
    <div>
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Pseudocode</h3>
      <ol className="mt-3 rounded-[var(--radius-md)] border border-line bg-black/30 py-2 font-mono text-[12px] leading-[1.8]">
        {lines.map((line, i) => {
          const isActive = i + 1 === active;
          return (
            <li
              key={i}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex gap-3 whitespace-pre-wrap break-words px-3 transition-colors duration-200",
                isActive ? "bg-accent-300/15 text-fg shadow-[inset_2px_0_0_#b7a6ff]" : "text-fg-muted",
              )}
            >
              <span className="w-4 shrink-0 select-none text-right text-fg-subtle">{i + 1}</span>
              {line}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
