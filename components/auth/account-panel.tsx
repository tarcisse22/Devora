"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, LogOut, MailWarning, RefreshCw, Trash2, UserRound } from "lucide-react";
import { friendlyError } from "@/lib/firebase/errors";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 text-[15px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-fg">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AccountPanel() {
  const router = useRouter();
  const { user, profile, loading, needsProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fill the form once the profile arrives (and when it changes elsewhere).
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (profile && loadedFor !== `${profile.uid}:${profile.displayName}:${profile.bio}`) {
    setLoadedFor(`${profile.uid}:${profile.displayName}:${profile.bio}`);
    setDisplayName(profile.displayName);
    setBio(profile.bio);
  }

  useEffect(() => {
    if (!loading && needsProfile) router.replace("/account/setup?next=/account");
  }, [loading, needsProfile, router]);

  if (loading) return <p className="text-[14px] text-fg-muted">Loading…</p>;
  if (!user) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-8 text-center">
        <UserRound className="mx-auto size-7 text-fg-subtle" aria-hidden />
        <p className="mt-3 text-[15px] text-fg">You’re not signed in.</p>
        <ButtonLink href="/sign-in?next=/account" className="mt-5">
          Sign in
        </ButtonLink>
      </div>
    );
  }
  if (!profile) return <p className="text-[14px] text-fg-muted">Loading your profile…</p>;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { updateProfile } = await import("@/lib/firebase/profiles");
      await updateProfile(user.uid, { displayName: displayName.trim(), bio: bio.trim() });
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const resendVerification = async () => {
    const { sendEmailVerification } = await import("firebase/auth");
    await sendEmailVerification(user).catch(() => {});
    setVerifySent(true);
  };

  const refreshVerification = async () => {
    await user.reload();
    window.location.reload();
  };

  const signOut = async () => {
    const [{ auth }, { signOut: fbSignOut }] = await Promise.all([import("@/lib/firebase/client"), import("firebase/auth")]);
    await fbSignOut(auth());
    router.push("/");
  };

  const remove = async (e: FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);
    try {
      const { deleteAccount } = await import("@/lib/firebase/account");
      await deleteAccount(user, password);
      router.push("/");
    } catch (err) {
      setDeleteError(friendlyError(err));
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <Card title="Profile">
          <form onSubmit={save} className="space-y-4">
            <p className="text-[14px] text-fg-muted">
              Username:{" "}
              <Link href={`/community/u/${profile.username}`} className="font-mono text-accent-200 hover:text-accent-100">
                @{profile.username}
              </Link>{" "}
              <span className="text-fg-subtle">(permanent)</span>
            </p>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-fg-muted">Display name</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 40))} className={`${inputClass} h-11`} required />
            </label>
            <label className="block">
              <span className="mb-1.5 flex justify-between text-[13px] font-medium text-fg-muted">
                Bio <span className="font-normal text-fg-subtle">{bio.length}/280</span>
              </span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} rows={3} className={`${inputClass} py-2.5`} placeholder="What are you learning?" />
            </label>
            {error && <p role="alert" className="text-[13.5px] text-[#ffb3b3]">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving || !displayName.trim()}>
                {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                Save profile
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-[13px] text-success" role="status">
                  <CheckCircle2 className="size-4" aria-hidden /> Saved
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card title="Progress">
          <p className="text-[14px] leading-relaxed text-fg-muted">
            Completed lessons, solved challenges and project checklists are saved to your account and synced across every browser where you
            sign in. Code drafts stay in each browser.
          </p>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Sign-in">
          <p className="break-all text-[14px] text-fg">{user.email}</p>
          {user.emailVerified ? (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-success">
              <CheckCircle2 className="size-4" aria-hidden /> Email verified
            </p>
          ) : (
            <div className="mt-3 rounded-[var(--radius-md)] border border-warning/30 bg-warning/[0.06] p-3 text-[13px] text-fg-muted">
              <p className="flex items-center gap-1.5 font-medium text-warning">
                <MailWarning className="size-4" aria-hidden /> Email not verified yet
              </p>
              <p className="mt-1">We sent you a verification link. It helps you recover your account.</p>
              <div className="mt-2.5 flex gap-3">
                <button type="button" onClick={resendVerification} disabled={verifySent} className="text-accent-200 hover:text-accent-100 disabled:text-fg-subtle">
                  {verifySent ? "Sent — check your inbox" : "Resend link"}
                </button>
                <button type="button" onClick={refreshVerification} className="flex items-center gap-1 text-fg-muted hover:text-fg">
                  <RefreshCw className="size-3.5" aria-hidden /> I’ve verified
                </button>
              </div>
            </div>
          )}
          <Button variant="secondary" className="mt-4 w-full" onClick={signOut}>
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </Card>

        <Card title="Delete account">
          {!confirmDelete ? (
            <>
              <p className="text-[13.5px] leading-relaxed text-fg-muted">
                Permanently deletes your account, profile, progress and threads. Replies you wrote in other people’s threads stay, under your
                username.
              </p>
              <Button variant="ghost" className="mt-3 text-[#ffb3b3] hover:text-[#ffc2c2]" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" aria-hidden />
                Delete my account
              </Button>
            </>
          ) : (
            <form onSubmit={remove} className="space-y-3">
              <p className="text-[13.5px] text-fg">Enter your password to confirm. This can’t be undone.</p>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} h-10`} aria-label="Password" />
              {deleteError && <p role="alert" className="text-[13px] text-[#ffb3b3]">{deleteError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={!password || deleting} className="bg-[#ff9b9b] text-[#2a0f0f] hover:bg-[#ffb3b3]">
                  {deleting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                  Delete forever
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
