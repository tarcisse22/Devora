import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileSetup } from "@/components/auth/profile-setup";

export const metadata: Metadata = { title: "Set up your profile" };

export default function ProfileSetupPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[420px] py-4 sm:py-10">
        <h1 className="text-center text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold tracking-[-0.03em] text-fg">Choose your username</h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-fg-muted">This is how you’ll appear in the community.</p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <ProfileSetup />
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
