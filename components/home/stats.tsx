import { placeholderStats } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/**
 * Minimal statistics strip. Values are placeholders and are labelled as such
 * on the page — see `placeholderStats`.
 */
export function Stats({ className }: { className?: string }) {
  return (
    <section aria-labelledby="stats-heading" className={className}>
      <h2 id="stats-heading" className="sr-only">
        Platform at a glance (example figures)
      </h2>
      <dl className="mx-auto grid max-w-[1040px] grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-y-0">
        {placeholderStats.map(({ value, label, icon: Icon }, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2.5 px-2 sm:gap-4 sm:px-4 md:justify-center",
              // Dividers between columns: every item on desktop, only the
              // right-hand column on the 2×2 mobile grid.
              i > 0 && "md:border-l md:border-line",
              i % 2 === 1 && "border-l border-line pl-4 md:border-l md:pl-4",
            )}
          >
            <Icon className="size-6 shrink-0 text-fg-muted sm:size-7" strokeWidth={1.4} aria-hidden />
            <div className="flex flex-col-reverse">
              <dt className="mt-1 text-[13px] min-[360px]:whitespace-nowrap text-fg-muted sm:text-sm">{label}</dt>
              <dd className="text-xl font-semibold tracking-[-0.02em] text-fg tabular-nums sm:text-[22px]">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-center text-[12px] text-fg-subtle">
        Example figures for preview — not live platform data.
      </p>
    </section>
  );
}
