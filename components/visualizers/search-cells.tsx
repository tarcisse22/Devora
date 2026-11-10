import type { SearchFrame } from "@/lib/algorithms/searching";
import { cn } from "@/lib/utils";

export const searchLegend = [
  { label: "Checking", className: "bg-accent-200" },
  { label: "Found", className: "bg-success" },
  { label: "Ruled out", className: "bg-white/[0.08]" },
];

/** Array cells with index labels and lo / mid / hi pointers. */
export function SearchCells({ frame }: { frame: SearchFrame }) {
  const eliminated = new Set(frame.eliminated);

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="mb-6 text-center text-[13px] text-fg-muted">
        Target <span className="ml-1 rounded-md border border-accent-300/40 bg-accent-300/10 px-2 py-0.5 font-mono text-accent-100">{frame.target}</span>
      </p>
      <ol className="flex flex-wrap justify-center gap-1.5 sm:gap-2" aria-label="Array">
        {frame.array.map((value, i) => {
          const isFound = frame.found === i;
          const isCurrent = frame.current === i && !isFound;
          const out = eliminated.has(i) && !isCurrent;
          const pointers = [frame.lo === i && "lo", frame.current === i && "mid", frame.hi === i && "hi"].filter(Boolean) as string[];
          const isBinary = frame.lo !== undefined || frame.hi !== undefined;
          return (
            <li key={i} className="flex w-10 flex-col items-center sm:w-12">
              <span className="mb-1 font-mono text-[10px] text-fg-subtle">{i}</span>
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-[8px] border font-mono text-[13px] transition-all duration-200 sm:size-12 sm:text-[14px]",
                  isFound && "border-success bg-success/20 text-success shadow-[0_0_20px_-4px_rgb(110_231_183/0.6)]",
                  isCurrent && "border-accent-200 bg-accent-200/20 text-fg shadow-[0_0_20px_-4px_rgb(207_196_255/0.6)]",
                  out && "border-line bg-white/[0.02] text-fg-subtle/60",
                  !isFound && !isCurrent && !out && "border-line-strong bg-white/[0.04] text-fg/90",
                )}
              >
                {value}
              </span>
              <span className="mt-1 h-4 font-mono text-[10px] text-accent-300">
                {isBinary ? pointers.filter((p) => p !== "mid" || frame.current === i).join("·") : pointers.includes("mid") ? "i" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
