import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[420px] py-4 sm:py-10">
        <h1 className="text-center text-[clamp(1.9rem,4vw,2.4rem)] font-semibold tracking-[-0.03em] text-fg">Welcome to Devora</h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-fg-muted">
          Sign in to sync your progress across devices and join the community. Everything else works without an account.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
