import type { Metadata } from "next";
import { projectCatalog } from "@/lib/curriculum";
import { features } from "@/lib/features";
import { PageShell, SectionHeading } from "@/components/layout/page-shell";
import { FeatureHeader } from "@/components/layout/feature-header";
import { PlannedScope } from "@/components/layout/planned-scope";

export const metadata: Metadata = { title: "Projects", description: features.projects.summary };

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

export default function ProjectsPage() {
  return (
    <PageShell>
      <FeatureHeader id="projects" title="From concepts to real applications" />

      <section aria-labelledby="catalog" className="mt-16 sm:mt-20">
        <SectionHeading
          id="catalog"
          title="Planned projects"
          description="The first guided builds, grouped by difficulty. Instructions and checklists are being written."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {levels.map((level) => (
            <div key={level} className="rounded-[var(--radius-lg)] border border-line bg-surface/50 p-6">
              <h3 className="text-[13px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{level}</h3>
              <ul className="mt-4 space-y-3">
                {projectCatalog
                  .filter((p) => p.level === level)
                  .map((p) => (
                    <li key={p.name} className="text-[15px] text-fg/90">
                      {p.name}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 sm:mt-20">
        <PlannedScope feature={features.projects} />
      </div>
    </PageShell>
  );
}
