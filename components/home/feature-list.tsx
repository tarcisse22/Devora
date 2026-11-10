import Link from "next/link";
import { heroPillars } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/** Three product pillars beneath the hero call-to-actions; each links to its area. */
export function FeatureList({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-3 sm:gap-0", className)}>
      {heroPillars.map(({ title, description, href, icon: Icon }, i) => (
        <li key={href} className={cn(i > 0 && "sm:border-l sm:border-line")}>
          <Link
            href={href}
            className={cn(
              "group flex items-start gap-4 rounded-[var(--radius-md)] py-2 sm:block sm:py-0 sm:pr-6",
              i > 0 && "sm:pl-6",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.04] text-fg/90 transition-[border-color,background-color,color] duration-300 group-hover:border-accent-300/50 group-hover:bg-accent-300/10 group-hover:text-accent-100">
              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="block sm:mt-5">
              <span className="block text-[17px] font-semibold tracking-[-0.01em] text-fg transition-colors group-hover:text-accent-100">
                {title}
              </span>
              <span className="mt-1.5 block text-[14px] leading-relaxed text-fg-muted">{description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
