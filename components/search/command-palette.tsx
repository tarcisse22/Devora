"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search, SearchX } from "lucide-react";
import { features } from "@/lib/features";
import { entryStatus, searchEntries, searchIndex, type SearchEntry } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const MAX_RESULTS = 8;

/** Shown before the user types: every main area of the product. */
const suggestions: SearchEntry[] = searchIndex.filter((e) => e.id.startsWith("feature-"));

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Search Devora" placement="top" className="max-w-[640px]">
      {/* Remount on open so query and selection always start fresh. */}
      {open && <PaletteBody onClose={onClose} />}
    </Dialog>
  );
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(
    () => (query.trim() ? searchEntries(query).slice(0, MAX_RESULTS) : suggestions),
    [query],
  );
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const go = (entry: SearchEntry) => {
    onClose();
    router.push(entry.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex]);
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-[18px] shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden />
        <input
          data-autofocus
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          placeholder="Search lessons, algorithms, tools, projects…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-14 w-full bg-transparent text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[5px] focus-visible:outline-offset-1"
          aria-label="Close search"
        >
          <Kbd>Esc</Kbd>
        </button>
      </div>

      <div className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <SearchX className="size-6 text-fg-subtle" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm font-medium text-fg">No results for “{query}”</p>
            <p className="mt-1 text-[13px] text-fg-muted">Try a topic like “sorting”, “SQL” or “linked list”.</p>
          </div>
        ) : (
          <>
            <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
              {query.trim() ? "Results" : "Jump to"}
            </p>
            <ul id={listId} role="listbox" aria-label="Search results">
              {results.map((entry, i) => (
                <ResultRow
                  key={entry.id}
                  id={`${listId}-${i}`}
                  entry={entry}
                  active={i === activeIndex}
                  onHover={() => setActive(i)}
                  onSelect={() => go(entry)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[11.5px] text-fg-subtle sm:flex">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeft className="size-3" aria-hidden />
          </Kbd>
          to open
        </span>
      </div>
    </div>
  );
}

function ResultRow({
  id,
  entry,
  active,
  onHover,
  onSelect,
}: {
  id: string;
  entry: SearchEntry;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const Icon = entry.feature ? features[entry.feature].icon : ArrowRight;
  const status = entryStatus(entry);

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors",
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-[8px] border transition-colors",
          active ? "border-accent-300/40 bg-accent-300/10 text-accent-100" : "border-line bg-white/[0.03] text-fg-muted",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-fg">{entry.title}</span>
        {entry.description && (
          <span className="block truncate text-[12.5px] text-fg-muted">{entry.description}</span>
        )}
      </span>
      <span className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
        <span className="text-[11.5px] text-fg-subtle">{entry.kind}</span>
        {status && <span className="text-[11px] text-fg-subtle/80">{status}</span>}
      </span>
    </li>
  );
}
