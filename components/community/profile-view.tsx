"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, MessagesSquare } from "lucide-react";
import type { Thread } from "@/lib/firebase/community";
import type { Profile } from "@/lib/firebase/profiles";
import { friendlyError } from "@/lib/firebase/errors";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/auth/user-menu";
import { ThreadRow } from "./thread-list";

type State = { status: "loading" } | { status: "missing" } | { status: "error"; message: string } | { status: "ready"; profile: Profile; threads: Thread[] };

export function ProfileView({ username }: { username: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ profileByUsername }, { threadsByAuthor }] = await Promise.all([import("@/lib/firebase/profiles"), import("@/lib/firebase/community")]);
        const profile = await profileByUsername(username);
        if (cancelled) return;
        if (!profile) return setState({ status: "missing" });
        const threads = await threadsByAuthor(profile.uid);
        if (!cancelled) setState({ status: "ready", profile, threads });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: friendlyError(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state.status === "loading") {
    return (
      <p className="flex items-center gap-2 py-10 text-[14px] text-fg-muted" role="status">
        <LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading profile…
      </p>
    );
  }
  if (state.status === "error") return <p className="py-10 text-[14px] text-[#ffb3b3]">{state.message}</p>;
  if (state.status === "missing") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line px-6 py-12 text-center">
        <p className="text-[16px] font-medium text-fg">No profile for @{username}</p>
        <p className="mt-1.5 text-[14px] text-fg-muted">The account may not exist, or it was deleted.</p>
        <ButtonLink href="/community" variant="secondary" className="mt-5">
          Back to the community
        </ButtonLink>
      </div>
    );
  }

  const { profile, threads } = state;
  const isMe = user?.uid === profile.uid;

  return (
    <div className="mx-auto max-w-[820px]">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile.displayName || profile.username} className="size-16 text-[24px]" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[clamp(1.6rem,3.4vw,2.1rem)] font-semibold tracking-[-0.025em] text-fg">{profile.displayName}</h1>
          <p className="font-mono text-[14px] text-fg-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-3 max-w-[560px] whitespace-pre-wrap text-[15px] leading-relaxed text-fg/90">{profile.bio}</p>}
          <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
            <CalendarDays className="size-3.5" aria-hidden />
            Joined {profile.createdAt ? profile.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "recently"}
          </p>
        </div>
        {isMe && (
          <ButtonLink href="/account" variant="secondary" size="sm">
            Edit profile
          </ButtonLink>
        )}
      </header>

      <section aria-labelledby="threads-heading" className="mt-10">
        <h2 id="threads-heading" className="text-[16px] font-semibold text-fg">
          Threads <span className="font-normal text-fg-subtle">({threads.length})</span>
        </h2>
        {threads.length === 0 ? (
          <EmptyState className="mt-4" icon={MessagesSquare} title="No threads yet" description={isMe ? "Start your first conversation." : `@${profile.username} hasn’t started a thread yet.`}>
            {isMe && <ButtonLink href="/community/new">Start a thread</ButtonLink>}
          </EmptyState>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
            {threads.map((t) => (
              <ThreadRow key={t.id} thread={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
