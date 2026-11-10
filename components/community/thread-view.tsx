"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ExternalLink, Heart, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { LIMITS, type Reply, type Thread } from "@/lib/firebase/community";
import { friendlyError } from "@/lib/firebase/errors";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/auth/user-menu";
import { PostBody } from "./post-body";
import { TimeAgo } from "./time-ago";
import { categoryName, categoryStyle } from "./thread-list";
import { useCooldown } from "./new-thread-form";

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300";

const community = () => import("@/lib/firebase/community");

function Meta({ username, createdAt, updatedAt }: { username: string; createdAt: Date | null; updatedAt: Date | null }) {
  const edited = createdAt && updatedAt && updatedAt.getTime() - createdAt.getTime() > 2000;
  return (
    <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-fg-subtle">
      <Link href={`/community/u/${username}`} className="font-medium text-fg-muted hover:text-accent-100">
        @{username}
      </Link>
      <span>·</span>
      <TimeAgo date={createdAt} />
      {edited && <span>· edited</span>}
    </span>
  );
}

function ReplyItem({ threadId, reply, canModerate }: { threadId: string; reply: Reply; canModerate: boolean }) {
  const { user } = useAuth();
  const mine = user?.uid === reply.authorId;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (await community()).updateReply(threadId, reply.id, draft);
      setEditing(false);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await (await community()).deleteReply(threadId, reply.id);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <li className="flex gap-3.5 py-5">
      <Avatar name={reply.authorUsername} className="size-8 text-[13px]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Meta username={reply.authorUsername} createdAt={reply.createdAt} updatedAt={reply.updatedAt} />
          {(mine || canModerate) && !editing && (
            <span className="flex items-center gap-1">
              {mine && (
                <button type="button" onClick={() => setEditing(true)} className="rounded-[6px] p-1.5 text-fg-subtle hover:bg-white/[0.05] hover:text-fg" aria-label="Edit reply">
                  <Pencil className="size-3.5" />
                </button>
              )}
              <button type="button" onClick={remove} className="rounded-[6px] p-1.5 text-fg-subtle hover:bg-white/[0.05] hover:text-[#ffb3b3]" aria-label="Delete reply">
                <Trash2 className="size-3.5" />
              </button>
            </span>
          )}
        </div>
        <div className="mt-2">
          {editing ? (
            <form onSubmit={save} className="space-y-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, LIMITS.replyMax))} rows={4} className={inputClass} aria-label="Edit reply" />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={busy || !draft.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => (setEditing(false), setDraft(reply.body))}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <PostBody text={reply.body} />
          )}
          {error && <p className="mt-2 text-[13px] text-[#ffb3b3]">{error}</p>}
        </div>
      </div>
    </li>
  );
}

function ReplyForm({ threadId }: { threadId: string }) {
  const { user, profile, loading } = useAuth();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldown = useCooldown(profile?.lastPostAt ?? null, LIMITS.replyCooldownS);

  if (loading) return null;
  if (!user || !profile) {
    const next = encodeURIComponent(`/community/t/${threadId}`);
    return (
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface/50 px-5 py-4 text-[14px] text-fg-muted">
        <Link href={user ? `/account/setup?next=${next}` : `/sign-in?next=${next}`} className="font-medium text-accent-200 hover:text-accent-100">
          {user ? "Choose a username" : "Sign in"}
        </Link>{" "}
        to reply.
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim() || cooldown > 0) return;
    setBusy(true);
    setError(null);
    try {
      await (await community()).createReply(threadId, user.uid, profile.username, body);
      setBody("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="sr-only">Your reply</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, LIMITS.replyMax))} rows={4} className={inputClass} placeholder="Write a reply… Wrap code in ``` backticks." />
      </label>
      {error && (
        <p role="alert" className="text-[13.5px] text-[#ffb3b3]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || !body.trim() || cooldown > 0}>
          {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Reply
        </Button>
        {cooldown > 0 && (
          <span className="text-[13px] text-fg-muted" role="status">
            You can reply again in {cooldown}s.
          </span>
        )}
      </div>
    </form>
  );
}

export function ThreadView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null | undefined>(undefined);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", link: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    let cancelled = false;
    community().then((c) => {
      if (cancelled) return;
      const fail = (e: unknown) => setError(friendlyError(e));
      unsubs.push(c.watchThread(id, setThread, fail), c.watchReplies(id, setReplies, fail), c.watchLikes(id, setLikes, fail));
    });
    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-xl)] border border-[#ff9b9b]/25 px-6 py-12 text-center">
        <AlertCircle className="size-6 text-[#ff9b9b]" aria-hidden />
        <p className="mt-3 text-[15px] font-medium text-fg">Couldn’t load this thread</p>
        <p className="mt-1.5 text-[13.5px] text-fg-muted">{error}</p>
      </div>
    );
  }
  if (thread === undefined) {
    return (
      <p className="flex items-center gap-2 py-10 text-[14px] text-fg-muted" role="status">
        <LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading thread…
      </p>
    );
  }
  if (thread === null) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line px-6 py-12 text-center">
        <p className="text-[16px] font-medium text-fg">This thread doesn’t exist</p>
        <p className="mt-1.5 text-[14px] text-fg-muted">It may have been deleted by its author.</p>
        <ButtonLink href="/community" variant="secondary" className="mt-5">
          Back to the community
        </ButtonLink>
      </div>
    );
  }

  const mine = user?.uid === thread.authorId;
  const liked = Boolean(user && likes.includes(user.uid));

  const toggleLike = async () => {
    if (!user) return router.push(`/sign-in?next=${encodeURIComponent(`/community/t/${id}`)}`);
    try {
      await (await community()).setLiked(id, user.uid, !liked);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const startEdit = () => {
    setDraft({ title: thread.title, body: thread.body, link: thread.link ?? "" });
    setEditing(true);
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await (await community()).updateThread(id, { title: draft.title, body: draft.body, link: draft.link.trim() || undefined });
      setEditing(false);
    } catch (err) {
      window.alert(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this thread and all its replies? This can’t be undone.")) return;
    setBusy(true);
    try {
      await (await community()).deleteThread(id);
      router.push("/community");
    } catch (err) {
      window.alert(friendlyError(err));
      setBusy(false);
    }
  };

  const linkValid = !draft.link || /^https?:\/\/\S+$/.test(draft.link.trim());

  return (
    <div className="mx-auto max-w-[820px]">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-[13.5px] text-fg-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Community
      </Link>

      <article className="mt-6">
        <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium", categoryStyle[thread.category])}>{categoryName[thread.category]}</span>
        {editing ? (
          <form onSubmit={saveEdit} className="mt-4 space-y-3">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value.slice(0, LIMITS.titleMax) })} className={cn(inputClass, "text-[18px] font-semibold")} aria-label="Title" />
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value.slice(0, LIMITS.bodyMax) })} rows={10} className={inputClass} aria-label="Details" />
            <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value.slice(0, LIMITS.linkMax) })} className={inputClass} placeholder="Link (optional) https://…" aria-label="Link" />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy || draft.title.trim().length < LIMITS.titleMin || !draft.body.trim() || !linkValid}>
                Save changes
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="mt-3 text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-fg">{thread.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={thread.authorUsername} className="size-8 text-[13px]" />
              <Meta username={thread.authorUsername} createdAt={thread.createdAt} updatedAt={thread.updatedAt} />
            </div>
            <div className="mt-6">
              <PostBody text={thread.body} />
            </div>
            {thread.link && (
              <a
                href={thread.link}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
                className="mt-5 inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-line-strong px-3.5 py-2 text-[13.5px] text-accent-200 hover:border-accent-300/50"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{thread.link}</span>
              </a>
            )}
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-line py-3">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            className={cn(
              "flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13.5px] transition-colors",
              liked ? "border-[#f0a6ca]/50 bg-[#f0a6ca]/10 text-[#f6c3dc]" : "border-line-strong text-fg-muted hover:text-fg",
            )}
          >
            <Heart className={cn("size-4", liked && "fill-current")} aria-hidden />
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </button>
          <span className="text-[13.5px] text-fg-subtle">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
          {mine && !editing && (
            <span className="ml-auto flex gap-1">
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Pencil className="size-3.5" aria-hidden /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={remove} disabled={busy} className="hover:text-[#ffb3b3]">
                <Trash2 className="size-3.5" aria-hidden /> Delete
              </Button>
            </span>
          )}
        </div>
      </article>

      <section aria-label="Replies" className="mt-2">
        {replies.length > 0 && (
          <ol className="divide-y divide-line">
            {replies.map((r) => (
              <ReplyItem key={r.id} threadId={id} reply={r} canModerate={mine} />
            ))}
          </ol>
        )}
        <div className="mt-6">
          <ReplyForm threadId={id} />
        </div>
      </section>
    </div>
  );
}
