import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Sparkles, Target } from "lucide-react";
import { projectBySlug, projects } from "@/lib/projects/projects";
import { PageShell } from "@/components/layout/page-shell";
import { FadeIn } from "@/components/ui/fade-in";
import { ProjectChecklist } from "@/components/projects/project-checklist";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: `${p.title} · Projects`, description: p.summary } : {};
}

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-[18px] font-semibold tracking-[-0.01em] text-fg">
    {children}
  </h2>
);

export default async function ProjectPage({ params }: Params) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const prev = projects[i - 1];
  const next = projects[i + 1];

  return (
    <PageShell>
      <FadeIn>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-fg-muted">
          <Link href="/projects" className="transition-colors hover:text-fg">
            Projects
          </Link>
          <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden />
          <span>{p.level}</span>
        </nav>
        <h1 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">{p.title}</h1>
        <p className="mt-4 max-w-[720px] text-[16.5px] leading-relaxed text-fg-muted">{p.overview}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology stack">
          {p.stack.map((s) => (
            <li key={s} className="rounded-full border border-line-strong bg-white/[0.02] px-3 py-1 text-[13px] text-fg/85">
              {s}
            </li>
          ))}
        </ul>
      </FadeIn>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="objectives">
            <H2 id="objectives">What you’ll learn</H2>
            <ul className="mt-4 space-y-2.5">
              {p.objectives.map((o) => (
                <li key={o} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
                  <Target className="mt-1 size-4 shrink-0 text-accent-300" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="instructions">
            <H2 id="instructions">Instructions</H2>
            <ol className="mt-5 space-y-4">
              {p.steps.map((s, n) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[13px] text-accent-200">{n + 1}</span>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-[15.5px] font-medium text-fg">{s.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-muted">{s.details}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="stretch">
            <H2 id="stretch">Stretch goals</H2>
            <ul className="mt-4 space-y-2.5">
              {p.stretch.map((s) => (
                <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
                  <Sparkles className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <ProjectChecklist slug={p.slug} items={p.checklist} />
          <section aria-labelledby="skills" className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-5 sm:p-6">
            <H2 id="skills">Skills you’ll need</H2>
            <ul className="mt-4 space-y-2">
              {p.skills.map((s) => (
                <li key={s.label} className="text-[14.5px]">
                  {s.href ? (
                    <Link href={s.href} className="inline-flex items-center gap-1.5 text-accent-200 transition-colors hover:text-accent-100">
                      {s.label}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  ) : (
                    <span className="text-fg/85">{s.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <nav aria-label="More projects" className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:justify-between">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className="group flex items-center gap-2 text-[14px] text-fg-muted transition-colors hover:text-fg">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} className="group flex items-center gap-2 text-[14px] text-fg-muted transition-colors hover:text-fg sm:justify-end">
            {next.title}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </nav>
    </PageShell>
  );
}
