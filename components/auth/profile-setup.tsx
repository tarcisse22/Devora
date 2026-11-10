"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { friendlyError, errorCode } from "@/lib/firebase/errors";
import { USERNAME_PATTERN } from "@/lib/firebase/profiles";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

const inputClass =
  "h-11 w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 text-[15px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300";

export function ProfileSetup() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/community";
  const { user, profile, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) router.replace(next);
  }, [loading, profile, next, router]);

  if (loading) return <p className="text-center text-[14px] text-fg-muted">Loading…</p>;
  if (!user) {
    return (
      <div className="text-center">
        <p className="text-[15px] text-fg-muted">Sign in to set up your profile.</p>
        <ButtonLink href="/sign-in?next=/account/setup" className="mt-5">
          Sign in
        </ButtonLink>
      </div>
    );
  }

  const valid = USERNAME_PATTERN.test(username) && displayName.trim().length >= 1;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const { createProfile, isUsernameTaken } = await import("@/lib/firebase/profiles");
      if (await isUsernameTaken(username)) {
        setError(`@${username} is already taken. Try another.`);
        return;
      }
      await createProfile(user.uid, username, displayName.trim());
    } catch (err) {
      setError(errorCode(err) === "permission-denied" ? `@${username} was just taken, or isn’t allowed. Try another.` : friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[420px] space-y-4" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-fg-muted">Username</span>
        <div className="flex items-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] focus-within:outline-2 focus-within:outline-accent-300">
          <span className="pl-3.5 text-[15px] text-fg-subtle">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
            autoComplete="username"
            className="h-11 w-full bg-transparent pl-1 pr-3.5 text-[15px] text-fg focus:outline-none"
            placeholder="ada_lovelace"
            aria-describedby="username-help"
          />
        </div>
        <span id="username-help" className="mt-1.5 block text-[12.5px] text-fg-subtle">
          3–20 characters: lowercase letters, numbers and underscores. Usernames are permanent.
        </span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-fg-muted">Display name</span>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 40))} className={inputClass} placeholder="Ada Lovelace" autoComplete="name" />
      </label>
      {error && (
        <p role="alert" className="rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#ffc2c2]">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!valid || busy}>
        {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Continue
      </Button>
    </form>
  );
}
