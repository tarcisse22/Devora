import { statusLabel, type FeatureStatus } from "@/lib/features";
import { cn } from "@/lib/utils";

const styles: Record<FeatureStatus, string> = {
  available: "border-success/30 bg-success/10 text-success",
  preview: "border-accent-300/35 bg-accent-300/10 text-accent-200",
  planned: "border-line-strong bg-white/[0.03] text-fg-muted",
};

const dots: Record<FeatureStatus, string> = {
  available: "bg-success",
  preview: "bg-accent-300",
  planned: "bg-fg-subtle",
};

export function StatusBadge({ status, className }: { status: FeatureStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium",
        styles[status],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", dots[status])} />
      {statusLabel[status]}
    </span>
  );
}
