import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small outlined label used above headlines and in panels. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-fg-muted",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inset-0 rounded-full bg-accent-300 animate-pulse-ring" />
        <span className="relative size-1.5 rounded-full bg-accent-300" />
      </span>
      {children}
    </span>
  );
}
