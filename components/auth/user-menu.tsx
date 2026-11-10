"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-300 to-accent-600 text-[14px] font-semibold uppercase text-[#14101f]",
        className,
      )}
    >
      {name.slice(0, 1) || "?"}
    </span>
  );
}

async function signOut() {
  const [{ auth }, { signOut: fbSignOut }] = await Promise.all([import("@/lib/firebase/client"), import("firebase/auth")]);
  await fbSignOut(auth());
}

/** Navbar account area: Sign In / Get Started, or the signed-in user's menu. */
export function UserMenu() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (loading) return <span className="hidden h-10 w-[188px] sm:block" aria-hidden />;

  if (!user) {
    return (
      <>
        <ButtonLink href="/sign-in" variant="secondary" size="md" className="hidden sm:inline-flex">
          Sign In
        </ButtonLink>
        <ButtonLink href="/sign-in?mode=create" variant="primary" size="md" className="hidden sm:inline-flex">
          Get Started
        </ButtonLink>
      </>
    );
  }

  const name = profile?.displayName || user.email || "Account";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className="flex items-center gap-2 rounded-full p-0.5 transition-shadow hover:shadow-[0_0_0_3px_rgb(183_166_255/0.25)]"
      >
        <Avatar name={name} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 w-60 overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-surface-raised shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)]">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[14px] font-medium text-fg">{name}</p>
            {profile && <p className="truncate font-mono text-[12.5px] text-fg-muted">@{profile.username}</p>}
          </div>
          <div className="p-1.5">
            {profile ? (
              <Link role="menuitem" href={`/community/u/${profile.username}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[14px] text-fg/90 hover:bg-white/[0.05]">
                <UserRound className="size-4 text-fg-subtle" aria-hidden /> Your profile
              </Link>
            ) : (
              <Link role="menuitem" href="/account/setup" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[14px] text-fg/90 hover:bg-white/[0.05]">
                <UserRound className="size-4 text-fg-subtle" aria-hidden /> Finish setting up
              </Link>
            )}
            <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[14px] text-fg/90 hover:bg-white/[0.05]">
              <Settings className="size-4 text-fg-subtle" aria-hidden /> Account
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[14px] text-fg/90 hover:bg-white/[0.05]"
            >
              <LogOut className="size-4 text-fg-subtle" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Account links for the mobile menu. */
export function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) return null;
  if (!user) {
    return (
      <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
        <ButtonLink href="/sign-in" onClick={onNavigate} variant="secondary" size="lg">
          Sign In
        </ButtonLink>
        <ButtonLink href="/sign-in?mode=create" onClick={onNavigate} variant="primary" size="lg">
          Get Started
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
      <ButtonLink href="/account" onClick={onNavigate} variant="secondary" size="lg">
        Account
      </ButtonLink>
      <button
        type="button"
        onClick={async () => {
          onNavigate();
          await signOut();
          router.push("/");
        }}
        className="h-12 rounded-[var(--radius-md)] border border-line-strong text-[15px] font-medium text-fg hover:bg-white/[0.05]"
      >
        Sign out
      </button>
    </div>
  );
}
