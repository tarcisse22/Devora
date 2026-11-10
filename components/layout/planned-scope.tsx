import { CircleDashed } from "lucide-react";
import type { Feature } from "@/lib/features";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeading } from "./page-shell";

/**
 * Lists what a feature will include. Used on every route whose feature is not
 * fully available, so the page is informative rather than a dead end.
 */
export function PlannedScope({ feature }: { feature: Feature }) {
  return (
    <section aria-labelledby={`${feature.id}-scope`} className="rounded-[var(--radius-xl)] border border-line bg-surface/60 p-6 sm:p-8">
      <SectionHeading
        id={`${feature.id}-scope`}
        title="Planned scope"
        description={`What ${feature.name} will include once it ships. Nothing in this list is available yet unless marked otherwise.`}
        aside={<StatusBadge status={feature.status} />}
      />
      <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
        {feature.scope.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-fg/85">
            <CircleDashed className="mt-[3px] size-4 shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
