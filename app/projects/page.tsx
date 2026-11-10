import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { features } from "@/lib/features";
import { projectLevels, projects } from "@/lib/projects/projects";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { ChecklistProgress } from "@/components/projects/project-checklist";

export const metadata: Metadata = { title: "Projects", description: features.projects.summary };

export default function ProjectsPage() {
  return (
    <PageShell>
      <FeatureHeader id="projects" title="From concepts to real applications" />

      <div id="catalog" className="mt-14 space-y-14 sm:mt-16">
        {projectLevels.map((level) => (
          <section key={level} aria-labelledby={`level-${level}`}>
            <SectionHeading id={`level-${level}`} title={level} />
            <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects
                .filter((p) => p.level === level)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/projects/${p.slug}`}
                      className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6 transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-[17px] font-semibold tracking-[-0.01em] text-fg">{p.title}</span>
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-200" aria-hidden />
                      </span>
                      <span className="mt-2 flex-1 text-[14px] leading-relaxed text-fg-muted">{p.summary}</span>
                      <span className="mt-5 flex flex-wrap items-center gap-1.5">
                        {p.stack.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full border border-line-strong px-2 py-0.5 text-[11.5px] text-fg-muted">
                            {s}
                          </span>
                        ))}
                        <span className="ml-auto">
                          <ChecklistProgress slug={p.slug} total={p.checklist.length} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
