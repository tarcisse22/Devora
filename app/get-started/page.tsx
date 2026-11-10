import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Command, Network, SquareTerminal } from "lucide-react";
import { featureList } from "@/lib/features";
import { PageHeader, PageShell, SectionHeading } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Kbd } from "@/components/ui/kbd";

export const metadata: Metadata = { title: "Get Started" };

const availableNow = [
  {
    icon: SquareTerminal,
    title: "Run code in the Playground",
    text: "Write JavaScript, TypeScript or Python and run it in an isolated sandbox in your browser.",
    href: "/playground",
    cta: "Open the Playground",
  },
  {
    icon: Network,
    title: "Visualize 10 algorithms",
    text: "Sorting, searching and graph algorithms — each replaying a real run on input you control.",
    href: "/visualize",
    cta: "Open the visualizers",
  },
  {
    icon: Command,
    title: "Search everything",
    text: "Find lessons, algorithms, tools and projects from anywhere.",
    shortcut: true,
  },
];

export default function GetStartedPage() {
  const upcoming = featureList.filter((f) => f.status !== "available");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Get started"
        title="Start exploring — no account needed"
        description="Devora is early. Here’s what you can use right now, and what’s being built next."
      />

      <section aria-labelledby="now" className="mt-16 sm:mt-20">
        <SectionHeading id="now" title="Available now" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {availableNow.map((item) => (
            <li key={item.title} className="flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6">
              <item.icon className="size-5 text-accent-300" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-4 text-[16px] font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-fg-muted">{item.text}</p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-accent-200 transition-colors hover:text-accent-100"
                >
                  {item.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <p className="mt-5 flex items-center gap-1.5 text-[13px] text-fg-muted">
                  Press <Kbd>Ctrl K</Kbd> or <Kbd>/</Kbd>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="next" className="mt-16 sm:mt-20">
        <SectionHeading id="next" title="In development" description="Open any area to see what works today and exactly what it will include." />
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
          {upcoming.map(({ id, name, href, icon: Icon, summary, status }) => (
            <li key={id}>
              <Link href={href} className="group flex items-center gap-4 p-5 transition-colors hover:bg-white/[0.025] sm:px-6">
                <Icon className="size-5 shrink-0 text-fg-muted transition-colors group-hover:text-accent-200" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-fg">{name}</span>
                  <span className="block text-[13.5px] text-fg-muted">{summary}</span>
                </span>
                <StatusBadge status={status} className="hidden sm:inline-flex" />
                <ArrowRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
