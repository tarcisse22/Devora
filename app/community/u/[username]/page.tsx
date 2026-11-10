import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileView } from "@/components/community/profile-view";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `@${(await params).username} · Community` };
}

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;
  return (
    <PageShell>
      <ProfileView username={decodeURIComponent(username).toLowerCase()} />
    </PageShell>
  );
}
