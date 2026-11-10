import Link from "next/link";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex h-10 items-center rounded-[var(--radius-md)] px-4 text-[15px] font-medium text-fg/85 transition-colors hover:text-fg"
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 bottom-1.5 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-accent-300 to-transparent transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-x-100"
      />
    </Link>
  );
}
