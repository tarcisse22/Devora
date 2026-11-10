import { Compass } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[480px] py-10 text-center sm:py-20">
        <Compass className="mx-auto size-8 text-accent-300" strokeWidth={1.5} aria-hidden />
        <p className="mt-6 font-mono text-[13px] text-fg-subtle">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">This page doesn’t exist</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
          The link may be outdated, or the page may not have been built yet.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/get-started" variant="secondary">
            What’s available
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
