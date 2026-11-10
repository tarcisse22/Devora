"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex h-10 items-center rounded-[var(--radius-md)] px-3.5 text-[15px] font-medium transition-colors",
        active ? "text-fg" : "text-fg/70 hover:text-fg",
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-3.5 bottom-1 h-px origin-center bg-gradient-to-r from-transparent via-accent-300 to-transparent transition-transform duration-300 ease-[var(--ease-out-soft)]",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}
