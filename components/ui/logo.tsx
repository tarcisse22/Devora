import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** Isometric cube mark — three faces in descending lavender tones. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id={`${id}-top`} x1="6" y1="4" x2="26" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f3f0ff" />
          <stop offset="1" stopColor="#cfc4ff" />
        </linearGradient>
        <linearGradient id={`${id}-left`} x1="4" y1="10" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b7a6ff" />
          <stop offset="1" stopColor="#6c4fd1" />
        </linearGradient>
      </defs>
      {/* top */}
      <path d="M16 3 28 9.5 16 16 4 9.5Z" fill={`url(#${id}-top)`} />
      {/* left */}
      <path d="M4 9.5 16 16v13L4 22.5Z" fill={`url(#${id}-left)`} />
      {/* right */}
      <path d="M28 9.5 16 16v13l12-6.5Z" fill="#3b2a7a" />
      {/* inner notch gives the mark its "D" cut */}
      <path d="M16 11.2 21 14v5.6l-5 2.8Z" fill="#0a0a0f" opacity="0.85" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Devora home"
      className={cn("flex items-center gap-2.5 rounded-md text-fg transition-opacity hover:opacity-90", className)}
    >
      <LogoMark />
      <span className="text-[22px] font-semibold tracking-[-0.02em]">Devora</span>
    </Link>
  );
}
