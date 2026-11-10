"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Search } from "lucide-react";
import { allTopics, challenges, type Difficulty } from "@/lib/practice/challenges";
import { useSolved } from "@/lib/practice/progress";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { difficultyStyle } from "./rich-text";

const levels: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

export function ChallengeList() {
  const solved = useSolved();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Difficulty | "All">("All");
  const [topic, setTopic] = useState("All topics");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return challenges.filter(
      (c) =>
        (level === "All" || c.difficulty === level) &&
        (topic === "All topics" || c.topics.includes(topic)) &&
        (!q || c.title.toLowerCase().includes(q) || c.topics.some((t) => t.toLowerCase().includes(q))),
    );
  }, [query, level, topic]);

  const solvedCount = challenges.filter((c) => solved.includes(c.slug)).length;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search challenges</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or topic…"
            className="h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] pl-9 pr-3 text-[14px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Difficulty" className="flex rounded-[var(--radius-md)] border border-line-strong p-0.5">
            {levels.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                onClick={() => setLevel(l)}
                className={cn("h-8 rounded-[8px] px-3 text-[13px] transition-colors", level === l ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}
              >
                {l}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="topic-filter">
            Topic
          </label>
          <Select id="topic-filter" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-[180px]">
            <option>All topics</option>
            {allTopics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-fg-muted">
        {filtered.length} of {challenges.length} challenges · {solvedCount} solved <span className="text-fg-subtle">(progress is saved in this browser only)</span>
      </p>

      {filtered.length === 0 ? (
        <EmptyState className="mt-6" icon={Search} title="No challenges match" description="Try a different search, difficulty or topic." />
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
          {filtered.map((c) => {
            const done = solved.includes(c.slug);
            return (
              <li key={c.slug}>
                <Link href={`/practice/${c.slug}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]">
                  <CheckCircle2 className={cn("size-5 shrink-0", done ? "text-success" : "text-line-strong")} aria-label={done ? "Solved" : "Not solved"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-fg">{c.title}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-fg-muted">{c.topics.join(" · ")}</span>
                  </span>
                  <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium", difficultyStyle[c.difficulty])}>{c.difficulty}</span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
