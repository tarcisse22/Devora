"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { LIMITS, cooldownRemaining, type Category } from "@/lib/firebase/community";
import { friendlyError } from "@/lib/firebase/errors";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { categoryOptions } from "./thread-list";

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 text-[15px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300";

const categoryHelp: Record<Category, string> = {
  question: "Ask about something you’re stuck on. Include what you tried.",
  discussion: "Start a conversation about a concept, tool or learning path.",
  project: "Share something you built. Add a link to the demo or code.",
  resource: "Share an article, course or tool and why it’s worth reading.",
};

/** Ticks once a second while a cooldown is running. */
export function useCooldown(lastPostAt: Date | null, seconds: number) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = cooldownRemaining(lastPostAt, seconds, now);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [remaining]);
  return remaining;
}

export function NewThreadForm() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [category, setCategory] = useState<Category>("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldown = useCooldown(profile?.lastPostAt ?? null, LIMITS.threadCooldownS);

  if (loading) return <p className="text-[14px] text-fg-muted">Loading…</p>;
  if (!user || !profile) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-8 text-center">
        <p className="text-[15px] text-fg">{user ? "Choose a username to start posting." : "Sign in to start a thread."}</p>
        <ButtonLink href={user ? "/account/setup?next=/community/new" : "/sign-in?next=/community/new"} className="mt-5">
          {user ? "Choose a username" : "Sign in"}
        </ButtonLink>
      </div>
    );
  }

  const linkValid = !link || /^https?:\/\/\S+$/.test(link.trim());
  const valid = title.trim().length >= LIMITS.titleMin && body.trim().length >= 1 && linkValid;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || cooldown > 0) return;
    setBusy(true);
    setError(null);
    try {
      const { createThread } = await import("@/lib/firebase/community");
      const id = await createThread(user.uid, profile.username, { category, title, body, link: link.trim() || undefined });
      router.push(`/community/t/${id}`);
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-fg-muted">Category</legend>
        <div className="grid gap-2 sm:grid-cols-4">
          {categoryOptions.map((c) => (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-3 py-2.5 text-[13.5px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-300",
                category === c.id ? "border-accent-300/50 bg-accent-300/10 text-fg" : "border-line-strong text-fg-muted hover:text-fg",
              )}
            >
              <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => setCategory(c.id)} className="sr-only" />
              {c.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-fg-subtle">{categoryHelp[category]}</p>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 flex justify-between text-[13px] font-medium text-fg-muted">
          Title
          <span className="font-normal text-fg-subtle">
            {title.length}/{LIMITS.titleMax}
          </span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.titleMax))} className={`${inputClass} h-11`} placeholder="Be specific — e.g. “Why is my binary search off by one?”" />
      </label>

      <label className="block">
        <span className="mb-1.5 flex justify-between text-[13px] font-medium text-fg-muted">
          Details
          <span className="font-normal text-fg-subtle">
            {body.length}/{LIMITS.bodyMax}
          </span>
        </span>
        <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, LIMITS.bodyMax))} rows={10} className={`${inputClass} py-3 font-[inherit]`} placeholder={"Write your post. Wrap code in triple backticks:\n```\nconst x = 1;\n```"} />
      </label>

      {(category === "project" || category === "resource" || link) && (
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-fg-muted">Link (optional)</span>
          <input value={link} onChange={(e) => setLink(e.target.value.slice(0, LIMITS.linkMax))} className={cn(`${inputClass} h-11`, !linkValid && "border-[#ff9b9b]/60")} placeholder="https://…" type="url" />
          {!linkValid && <span className="mt-1.5 block text-[12.5px] text-[#ffb3b3]">Links must start with http:// or https://</span>}
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#ffc2c2]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={!valid || busy || cooldown > 0}>
          {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Post thread
        </Button>
        {cooldown > 0 && (
          <span className="text-[13px] text-fg-muted" role="status">
            You can post again in {cooldown}s — a short pause between posts keeps spam out.
          </span>
        )}
        <span className="text-[12.5px] text-fg-subtle">Posting as @{profile.username}. Be kind and constructive.</span>
      </div>
    </form>
  );
}
