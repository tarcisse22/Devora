import type { SortFrame } from "@/lib/algorithms/sorting";
import { cn } from "@/lib/utils";

export const sortLegend = [
  { label: "Comparing", className: "bg-accent-200" },
  { label: "Swapped / written", className: "bg-[#f0a6ca]" },
  { label: "Pivot / key", className: "bg-warning" },
  { label: "In final place", className: "bg-accent-500/70" },
];

/** Bar chart of the array for a sorting frame. */
export function SortBars({ frame }: { frame: SortFrame }) {
  const max = Math.max(...frame.array, 1);
  const sorted = new Set(frame.sorted);
  const showValues = frame.array.length <= 20;

  const colorFor = (i: number) => {
    if (frame.swap?.includes(i) || frame.write === i) return "bg-[#f0a6ca]";
    if (frame.compare?.includes(i)) return "bg-accent-200";
    if (frame.pivot === i) return "bg-warning";
    if (sorted.has(i)) return "bg-accent-500/70";
    return "bg-white/[0.16]";
  };

  return (
    <div
      className="flex h-full items-end gap-[3px] sm:gap-1"
      role="img"
      aria-label={`Array: ${frame.array.join(", ")}`}
    >
      {frame.array.map((value, i) => {
        const outOfRange = frame.range && (i < frame.range[0] || i > frame.range[1]);
        return (
          <div key={i} className={cn("flex h-full min-w-0 flex-1 flex-col justify-end transition-opacity duration-300", outOfRange && "opacity-30")}>
            {showValues && (
              <span className="mb-1 text-center font-mono text-[10px] text-fg-muted sm:text-[11px]">{value}</span>
            )}
            <div
              className={cn("w-full rounded-t-[3px] transition-[height,background-color] duration-200", colorFor(i))}
              style={{ height: `${(value / max) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
