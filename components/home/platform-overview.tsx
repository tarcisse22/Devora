import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featureList } from "@/lib/features";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * Every product area in one divided grid. Status labels come from the feature
 * registry, so the homepage never overstates what is built.
 */
export function PlatformOverview() {
  return (
    <section id="explore" aria-labelledby="explore-heading" className="relative pb-24 pt-4 sm:pb-32">
      <Container>
        <FadeIn inView className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[620px]">
            <p className="text-[13px] font-medium text-accent-300">Explore Devora</p>
            <h2
              id="explore-heading"
              className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg"
            >
              One place to learn, experiment and build
            </h2>
          </div>
          <p className="max-w-[420px] text-[15px] leading-relaxed text-fg-muted">
            Devora is being built in the open. Each area is labelled with its real status, so you always know what
            you can use today.
          </p>
        </FadeIn>

        <FadeIn inView delay={0.08} className="mt-12">
          <ul className="grid overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line [gap:1px] sm:grid-cols-2 lg:grid-cols-4">
            {featureList.map(({ id, name, href, icon: Icon, summary, status }) => (
              <li key={id} className="bg-canvas">
                <Link
                  href={href}
                  className="group relative flex h-full flex-col p-6 transition-colors duration-300 hover:bg-white/[0.025] focus-visible:-outline-offset-2 sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.04] text-fg/90 transition-[border-color,background-color,color] duration-300 group-hover:border-accent-300/50 group-hover:bg-accent-300/10 group-hover:text-accent-100">
                      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <h3 className="mt-6 flex items-center gap-1.5 text-[17px] font-semibold tracking-[-0.01em] text-fg">
                    {name}
                    <ArrowUpRight
                      className="size-4 text-fg-subtle opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      aria-hidden
                    />
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Container>
    </section>
  );
}
