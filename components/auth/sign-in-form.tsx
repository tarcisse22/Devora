"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, MailCheck } from "lucide-react";
import { friendlyError } from "@/lib/firebase/errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

type Mode = "sign-in" | "create" | "reset";

const inputClass =
  "h-11 w-full rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 text-[15px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-accent-300";

/** Only allow same-site redirects after signing in. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  const next = safeNext(nextParam);
  const { user, needsProfile, loading } = useAuth();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "create" ? "create" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Already signed in (or just signed in): continue.
  useEffect(() => {
    if (loading || !user) return;
    // New accounts go on to choose a username, then to where they were
    // headed (or the community, if they came straight to sign up).
    router.replace(needsProfile ? `/account/setup${nextParam ? `?next=${encodeURIComponent(next)}` : ""}` : next);
  }, [loading, user, needsProfile, next, nextParam, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { auth } = await import("@/lib/firebase/client");
      const a = await import("firebase/auth");
      if (mode === "reset") {
        await a.sendPasswordResetEmail(auth(), email.trim());
        setResetSent(true);
      } else if (mode === "create") {
        if (password.length < 8) throw { code: "auth/weak-password" };
        const cred = await a.createUserWithEmailAndPassword(auth(), email.trim(), password);
        // Best effort: verification email (doesn't block using the account).
        a.sendEmailVerification(cred.user).catch(() => {});
      } else {
        await a.signInWithEmailAndPassword(auth(), email.trim(), password);
      }
    } catch (err) {
      // Don't reveal whether an email has an account when resetting.
      if (mode === "reset") setResetSent(true);
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setResetSent(false);
  };

  return (
    <div className="mx-auto w-full max-w-[420px]">
      {mode !== "reset" && (
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-[var(--radius-md)] border border-line-strong p-1">
          {(["sign-in", "create"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={cn("h-9 rounded-[8px] text-[14px] font-medium transition-colors", mode === m ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}
            >
              {m === "sign-in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}

      {mode === "reset" && resetSent ? (
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface/60 p-6 text-center">
          <MailCheck className="mx-auto size-7 text-success" aria-hidden />
          <p className="mt-3 text-[15px] font-medium text-fg">Check your email</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">If an account exists for {email}, we’ve sent a link to reset its password.</p>
          <button type="button" onClick={() => switchMode("sign-in")} className="mt-5 text-[14px] text-accent-200 hover:text-accent-100">
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === "reset" && (
            <div>
              <h2 className="text-[18px] font-semibold text-fg">Reset your password</h2>
              <p className="mt-1 text-[14px] text-fg-muted">We’ll email you a link to choose a new one.</p>
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-fg-muted">Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
          </label>
          {mode !== "reset" && (
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-fg-muted">
                Password
                {mode === "sign-in" && (
                  <button type="button" onClick={() => switchMode("reset")} className="font-normal text-accent-200 hover:text-accent-100">
                    Forgot password?
                  </button>
                )}
              </span>
              <input
                type="password"
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                required
                minLength={mode === "create" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={mode === "create" ? "At least 8 characters" : ""}
              />
            </label>
          )}
          {error && (
            <p role="alert" className="rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#ffc2c2]">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {mode === "sign-in" ? "Sign in" : mode === "create" ? "Create account" : "Send reset link"}
          </Button>
          {mode === "reset" && (
            <button type="button" onClick={() => switchMode("sign-in")} className="block w-full text-center text-[14px] text-fg-muted hover:text-fg">
              Back to sign in
            </button>
          )}
          {mode === "create" && (
            <p className="text-center text-[12.5px] leading-relaxed text-fg-subtle">
              Your account stores your progress and lets you take part in the{" "}
              <Link href="/community" className="text-fg-muted underline-offset-2 hover:underline">
                community
              </Link>
              . We don’t share your email.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
