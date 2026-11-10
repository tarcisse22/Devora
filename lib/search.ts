import { featureList, features, statusLabel, type FeatureId } from "./features";
import { algorithmCatalog, dataStructureCatalog, learnSubjects, projectCatalog } from "./curriculum";

export type SearchKind = "Page" | "Tool" | "Subject" | "Algorithm" | "Data structure" | "Project";

export type SearchEntry = {
  id: string;
  title: string;
  href: string;
  kind: SearchKind;
  /** Owning feature, used for the status label. */
  feature?: FeatureId;
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
    description: f.summary,
    keywords: f.scope,
  })),
  {
    id: "dijkstra-preview",
    title: "Dijkstra's Shortest Path — interactive preview",
    href: "/visualize#preview",
    kind: "Algorithm",
    feature: "visualize",
    description: "Step through a real Dijkstra trace on a sample graph.",
    keywords: ["graph", "shortest path", "weighted"],
  },
  ...learnSubjects.map<SearchEntry>((s) => ({
    id: `subject-${s.name}`,
    title: s.name,
    href: "/learn#subjects",
    kind: "Subject",
    feature: "learn",
    description: s.topics.join(" · "),
    keywords: [...s.topics],
  })),
  ...algorithmCatalog.flatMap((g) =>
    g.items
      .filter((name) => !name.startsWith("Dijkstra"))
      .map<SearchEntry>((name) => ({
        id: `algo-${name}`,
        title: name,
        href: "/visualize#algorithms",
        kind: "Algorithm",
        feature: "visualize",
        description: `${g.group} algorithm visualization`,
        keywords: [g.group],
      })),
  ),
  ...dataStructureCatalog.map<SearchEntry>((name) => ({
    id: `ds-${name}`,
    title: name,
    href: "/visualize#data-structures",
    kind: "Data structure",
    feature: "visualize",
    description: "Data structure visualization",
  })),
  ...projectCatalog.map<SearchEntry>((p) => ({
    id: `project-${p.name}`,
    title: p.name,
    href: "/projects#catalog",
    kind: "Project",
    feature: "projects",
    description: `${p.level} project`,
  })),
];

/**
 * Status shown next to a result. Catalogue items under a "preview" feature are
 * still planned individually — only the Dijkstra preview is interactive.
 */
export function entryStatus(entry: SearchEntry): string | null {
  if (!entry.feature) return null;
  if (entry.id === "dijkstra-preview") return statusLabel.preview;
  if (entry.id.startsWith("feature-")) return statusLabel[features[entry.feature].status];
  return statusLabel.planned;
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
