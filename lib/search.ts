import { featureList, statusLabel, type FeatureId, type FeatureStatus } from "./features";
import { learnSubjects, projectCatalog } from "./curriculum";
import { dataStructures } from "./data-structures/catalog";
import { algorithms, categoryLabel } from "./algorithms/catalog";

export type SearchKind = "Page" | "Tool" | "Subject" | "Algorithm" | "Data structure" | "Project";

export type SearchEntry = {
  id: string;
  title: string;
  href: string;
  kind: SearchKind;
  /** Owning feature, used for the result icon. */
  feature?: FeatureId;
  /** Real availability of this specific entry. */
  status?: FeatureStatus;
  description?: string;
  keywords?: string[];
};

const toolIds: FeatureId[] = ["playground", "visualize", "code-tracer", "sql-lab"];

/** Everything searchable on the site. Built from the same registries the pages use. */
export const searchIndex: SearchEntry[] = [
  { id: "home", title: "Home", href: "/", kind: "Page", description: "Devora homepage" },
  ...featureList.map<SearchEntry>((f) => ({
    id: `feature-${f.id}`,
    title: f.name,
    href: f.href,
    kind: toolIds.includes(f.id) ? "Tool" : "Page",
    feature: f.id,
    status: f.status,
    description: f.summary,
    keywords: f.scope,
  })),
  ...learnSubjects.map<SearchEntry>((s) => ({
    id: `subject-${s.name}`,
    title: s.name,
    href: "/learn#subjects",
    kind: "Subject",
    feature: "learn",
    status: "planned",
    description: s.topics.join(" · "),
    keywords: [...s.topics],
  })),
  ...algorithms.map<SearchEntry>((a) => ({
    id: `algo-${a.slug}`,
    title: a.name,
    href: `/visualize/algorithms/${a.slug}`,
    kind: "Algorithm",
    feature: "visualize",
    status: "available",
    description: `${categoryLabel[a.category]} · ${a.summary}`,
    keywords: [a.category, a.complexity.average],
  })),
  ...dataStructures.map<SearchEntry>((d) => ({
    id: `ds-${d.slug}`,
    title: d.name,
    href: `/visualize/data-structures/${d.slug}`,
    kind: "Data structure",
    feature: "visualize",
    status: "available",
    description: d.summary,
    keywords: d.operations.map((o) => o.name),
  })),
  ...projectCatalog.map<SearchEntry>((p) => ({
    id: `project-${p.name}`,
    title: p.name,
    href: "/projects#catalog",
    kind: "Project",
    feature: "projects",
    status: "planned",
    description: `${p.level} project`,
  })),
];

/** Status label shown next to a result. */
export function entryStatus(entry: SearchEntry): string | null {
  return entry.status ? statusLabel[entry.status] : null;
}

const normalize = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, " ");

/** Rank entries for a query: every term must match; title matches rank higher. */
export function searchEntries(query: string, entries: SearchEntry[] = searchIndex): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const title = normalize(entry.title);
    const rest = normalize([entry.kind, entry.description ?? "", ...(entry.keywords ?? [])].join(" "));
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (title.startsWith(term)) score += 6;
      else if (title.split(/\s+/).some((w) => w.startsWith(term))) score += 4;
      else if (title.includes(term)) score += 2;
      else if (rest.includes(term)) score += 1;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) scored.push({ entry, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).map((s) => s.entry);
}
