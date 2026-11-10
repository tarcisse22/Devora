"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/components/search/search-provider";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/** Opens the search palette. Shows the shortcut on wide screens. */
export function SearchButton({ className }: { className?: string }) {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search (Ctrl+K)"
      title="Search  ·  Ctrl K"
      aria-keyshortcuts="Control+K Meta+K /"
      className={cn(
        "flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-2.5 text-fg-muted transition-colors hover:bg-white/[0.05] hover:text-fg",
        className,
      )}
    >
      <Search className="size-[19px]" strokeWidth={1.75} aria-hidden />
      <Kbd className="hidden 2xl:inline-flex">Ctrl K</Kbd>
    </button>
  );
}
