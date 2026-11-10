import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native <select> styled to match Devora — keeps full keyboard and mobile support. */
export function Select({ className, children, ...props }: ComponentPropsWithoutRef<"select">) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] pl-3 pr-9 text-[13.5px] text-fg transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-accent-300 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-surface-raised"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
    </span>
  );
}
