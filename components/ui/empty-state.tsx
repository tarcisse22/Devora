import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-xl)] border border-dashed border-line-strong px-6 py-12 text-center sm:py-14",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] text-fg-muted">
        <Icon className="size-5" strokeWidth={1.6} aria-hidden />
      </span>
      <h3 className="mt-4 text-[16px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 max-w-[440px] text-[14px] leading-relaxed text-fg-muted">{description}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
