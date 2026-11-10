import type { Metadata } from "next";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { AccountPanel } from "@/components/auth/account-panel";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Account" title="Your account" description="Manage your profile, sign-in and data." />
      <div className="mt-10">
        <AccountPanel />
      </div>
    </PageShell>
  );
}
