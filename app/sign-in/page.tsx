import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[520px] py-8 text-center sm:py-16">
        <span className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-lg)] border border-line-strong bg-white/[0.04] text-accent-200">
          <LogIn className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-6 text-[clamp(1.9rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-fg">
          Accounts aren’t available yet
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
          Devora doesn’t have sign-in yet, so nothing is saved to an account. Everything that’s built works without
          one. Accounts — and saved progress — will arrive with backend support.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/get-started">Continue without an account</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
