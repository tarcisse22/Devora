"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Heart, LoaderCircle, MessageSquare, MessagesSquare, PenSquare, RefreshCw, Search } from "lucide-react";
import type { Category, Thread } from "@/lib/firebase/community";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { TimeAgo } from "./time-ago";

export const categoryOptions: { id: Category; label: string }[] = [
  { id: "question", label: "Questions" },
  { id: "discussion", label: "Discussions" },
  { id: "project", label: "Shared projects" },
  { id: "resource", label: "Resources" },
];

export const categoryStyle: Record<Category, string> = {
  question: "border-accent-300/40 bg-accent-300/10 text-accent-100",
  discussion: "border-line-strong bg-white/[0.04] text-fg-muted",
  project: "border-success/30 bg-success/10 text-success",
  resource: "border-warning/30 bg-warning/10 text-warning",
};

export const categoryName: Record<Category, string> = { question: "Question", discussion: "Discussion", project: "Project", resource: "Resource" };

function Counts({ id }: { id: string }) {
  const [counts, setCounts] = useState<{ replies: number; likes: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("@/lib/firebase/community")
      .then(({ threadCounts }) => threadCounts(id))
      .then((c) => !cancelled && setCounts(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);
  return (
    <span className="flex items-center gap-3 text-[12.5px] text-fg-subtle">
      <span className="flex items-center gap-1" aria-label={counts ? `${counts.replies} replies` : undefined}>
        <MessageSquare className="size-3.5" aria-hidden />
        {counts?.replies ?? "–"}
      </span>
      <span className="flex items-center gap-1" aria-label={counts ? `${counts.likes} likes` : undefined}>
        <Heart className="size-3.5" aria-hidden />
        {counts?.likes ?? "–"}
      </span>
    </span>
  );
}

export function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <li>
      <Link href={`/community/t/${thread.id}`} className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:gap-5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", categoryStyle[thread.category])}>{categoryName[thread.category]}</span>
            <span className="text-[15.5px] font-medium text-fg group-hover:text-accent-100">{thread.title}</span>
          </span>
          <span className="mt-1 block text-[12.5px] text-fg-subtle">
            <span className="text-fg-muted">@{thread.authorUsername}</span> · <TimeAgo date={thread.createdAt} />
          </span>
        </span>
        <Counts id={thread.id} />
      </Link>
    </li>
  );
}

export function ThreadList() {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // Fetch threads; state only changes when the request settles.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { listThreads } = await import("@/lib/firebase/community");
        const result = await listThreads();
        if (!cancelled) setThreads(result);
      } catch (err) {
        const { friendlyError } = await import("@/lib/firebase/errors");
        if (!cancelled) setError(friendlyError(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const load = useCallback(() => {
    setError(null);
    setThreads(null);
    setReloadKey((k) => k + 1);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (threads ?? []).filter(
      (t) => (category === "all" || t.category === category) && (!q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.authorUsername.includes(q)),
    );
  }, [threads, category, query]);

  const newHref = !user ? "/sign-in?next=/community/new" : !profile ? "/account/setup?next=/community/new" : "/community/new";

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div role="tablist" aria-label="Category" className="flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-line-strong p-0.5">
          {[{ id: "all" as const, label: "All" }, ...categoryOptions].map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn("h-8 rounded-[8px] px-3 text-[13px] transition-colors", category === c.id ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <span className="sr-only">Search threads</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search threads…"
            className="h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] pl-9 pr-3 text-[14px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300"
          />
        </label>
        <ButtonLink href={newHref} className="shrink-0">
          <PenSquare className="size-4" aria-hidden />
          New thread
        </ButtonLink>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="flex flex-col items-center rounded-[var(--radius-xl)] border border-[#ff9b9b]/25 px-6 py-12 text-center">
            <AlertCircle className="size-6 text-[#ff9b9b]" aria-hidden />
            <p className="mt-3 text-[15px] font-medium text-fg">Couldn’t load the community</p>
            <p className="mt-1.5 max-w-[420px] text-[13.5px] text-fg-muted">{error}</p>
            <Button variant="secondary" className="mt-5" onClick={load}>
              <RefreshCw className="size-4" aria-hidden /> Try again
            </Button>
          </div>
        ) : threads === null ? (
          <p className="flex items-center gap-2 px-1 py-10 text-[14px] text-fg-muted" role="status">
            <LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading threads…
          </p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title={threads.length === 0 ? "No threads yet" : "No threads match"}
            description={threads.length === 0 ? "The community is brand new. Start the first conversation — ask a question or share what you’re building." : "Try another category or search."}
          >
            {threads.length === 0 && <ButtonLink href={newHref}>Start a thread</ButtonLink>}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
            {filtered.map((t) => (
              <ThreadRow key={t.id} thread={t} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
