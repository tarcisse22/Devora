import { features } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/** Three primary product pillars, shown beneath the hero call-to-actions. */
export function FeatureList({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-7 sm:grid-cols-3 sm:gap-0", className)}>
      {features.map(({ id, title, description, icon: Icon }, i) => (
        <li
          key={id}
          id={id}
          className={cn(
            "group sm:pr-6",
            i > 0 && "sm:border-l sm:border-line sm:pl-6",
          )}
        >
          <div className="flex items-start gap-4 sm:block">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.04] text-fg/90 transition-[border-color,background-color,color] duration-300 group-hover:border-accent-300/50 group-hover:bg-accent-300/10 group-hover:text-accent-100">
              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="sm:mt-5">
              <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-fg">{title}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{description}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
