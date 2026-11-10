import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featureList } from "@/lib/features";
import { PageHeader, PageShell, SectionHeading } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = { title: "Get Started" };

const paths = [
  { title: "New to programming", text: "Start with variables, control flow and functions, running every example as you go.", href: "/learn/programming-fundamentals/variables-and-types", cta: "First lesson" },
  { title: "Preparing for interviews", text: "Work through data structures and algorithms, then solve challenges against hidden tests.", href: "/practice", cta: "Open Practice" },
  { title: "Ready to build", text: "Pick a guided project and work through its checklist, from a portfolio to a full-stack app.", href: "/projects", cta: "Browse projects" },
];

export default function GetStartedPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Get started"
        title="Start learning — your way"
        description="Everything on Devora works without an account. Create a free one to sync your progress across devices and join the community."
      >
        <ButtonLink href="/sign-in?mode=create">Create a free account</ButtonLink>
        <ButtonLink href="/learn" variant="secondary">
          Browse lessons
        </ButtonLink>
      </PageHeader>

      <section aria-labelledby="paths" className="mt-16 sm:mt-20">
        <SectionHeading id="paths" title="Pick a starting point" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {paths.map((p) => (
            <li key={p.title} className="flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6">
              <h3 className="text-[16px] font-semibold text-fg">{p.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-fg-muted">{p.text}</p>
              <Link href={p.href} className="mt-5 inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-accent-200 transition-colors hover:text-accent-100">
                {p.cta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="everything" className="mt-16 sm:mt-20">
        <SectionHeading
          id="everything"
          title="Everything on Devora"
          description={
            <>
              Jump anywhere — or press <Kbd>Ctrl K</Kbd> to search lessons, challenges, tools and projects.
            </>
          }
        />
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] border border-line">
          {featureList.map(({ id, name, href, icon: Icon, summary, status }) => (
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
