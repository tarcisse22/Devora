"use client";

import Link from "next/link";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";

/** Tells people where their progress is stored — accurately, signed in or not. */
export function SyncNote({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <span className={cn("text-[12.5px] text-fg-subtle", className)}>&nbsp;</span>;
  if (user) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] text-fg-subtle", className)}>
        <Cloud className="size-3.5" aria-hidden /> Progress is synced to your account.
      </span>
    );
  }
  return (
    <span className={cn("text-[12.5px] text-fg-subtle", className)}>
      Progress is saved in this browser.{" "}
      <Link href="/sign-in" className="text-fg-muted underline-offset-2 hover:text-fg hover:underline">
        Sign in
      </Link>{" "}
      to sync it across devices.
    </span>
  );
}
