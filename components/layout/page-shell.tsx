import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

/** Standard wrapper for inner pages: offset for the fixed nav plus a soft top glow. */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden pt-[72px] xl:pt-[84px]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-380px] -z-10 h-[680px] w-[1200px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(108_79_209/0.2),transparent_65%)]"
      />
      <Container className="pb-24 pt-12 sm:pt-16 lg:pb-32">{children}</Container>
    </div>
  );
}

type HeaderProps = {
  icon?: LucideIcon;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  /** Rendered next to the eyebrow, e.g. a status badge. */
  meta?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ icon: Icon, eyebrow, title, description, meta, children }: HeaderProps) {
  return (
    <FadeIn>
      <header className="max-w-[760px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-accent-300">
            {Icon && <Icon className="size-4" strokeWidth={1.75} aria-hidden />}
            {eyebrow}
          </span>
          {meta}
        </div>
        <h1 className="mt-4 text-[clamp(2.1rem,4.6vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
          {title}
        </h1>
        <p className="mt-5 max-w-[640px] text-[17px] leading-relaxed text-fg-muted">{description}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </header>
    </FadeIn>
  );
}

/** Section title used inside pages. */
export function SectionHeading({
  id,
  title,
  description,
  aside,
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-[640px]">
        <h2 id={id} className="text-xl font-semibold tracking-[-0.015em] text-fg sm:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {aside}
    </div>
  );
}
