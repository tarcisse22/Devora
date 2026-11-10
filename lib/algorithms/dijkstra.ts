/**
 * A small, real Dijkstra implementation that records a trace of each step.
 * The hero visualizer replays this trace, so every state it shows is computed
 * from the graph rather than hard-coded.
 */

export type NodeId = string;

export type GraphNode = {
  id: NodeId;
  /** Position inside the visualizer's SVG viewBox. */
  x: number;
  y: number;
};

export type GraphEdge = {
  from: NodeId;
  to: NodeId;
  weight: number;
};

export type WeightedGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type Relaxation = {
  from: NodeId;
  to: NodeId;
  candidate: number;
  improved: boolean;
};

export type DijkstraStep = {
  title: string;
  description: string;
  /** Node extracted from the priority queue in this step, if any. */
  current: NodeId | null;
  visited: NodeId[];
  distances: Record<NodeId, number>;
  previous: Record<NodeId, NodeId | null>;
  relaxations: Relaxation[];
  /** Short code-like trace lines describing the step. */
  code: string[];
};

export const edgeKey = (a: NodeId, b: NodeId) => [a, b].sort().join("-");

export const formatDistance = (d: number) => (Number.isFinite(d) ? String(d) : "∞");

export function traceDijkstra(graph: WeightedGraph, source: NodeId): DijkstraStep[] {
  const adjacency = new Map<NodeId, { to: NodeId; weight: number }[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const { from, to, weight } of graph.edges) {
    adjacency.get(from)!.push({ to, weight });
    adjacency.get(to)!.push({ to: from, weight });
  }

  const distances: Record<NodeId, number> = {};
  const previous: Record<NodeId, NodeId | null> = {};
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[source] = 0;

  const visited = new Set<NodeId>();
  const queue: { id: NodeId; d: number }[] = [{ id: source, d: 0 }];

  const steps: DijkstraStep[] = [
    {
      title: "Initialize",
      description: `Set every distance to ∞, then set ${source} to 0 and push it onto the priority queue.`,
      current: null,
      visited: [],
      distances: { ...distances },
      previous: { ...previous },
      relaxations: [],
      code: [`pq.add(${source}, 0);`, `dist[${source}] = 0;`, `visited = {};`],
    },
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
    const { id: u, d } = queue.shift()!;
    if (visited.has(u) || d > distances[u]) continue;
    visited.add(u);

    const relaxations: Relaxation[] = [];
    for (const { to, weight } of adjacency.get(u)!) {
      if (visited.has(to)) continue;
      const candidate = distances[u] + weight;
      const improved = candidate < distances[to];
      if (improved) {
        distances[to] = candidate;
        previous[to] = u;
        queue.push({ id: to, d: candidate });
      }
      relaxations.push({ from: u, to, candidate, improved });
    }

    const improvedTargets = relaxations.filter((r) => r.improved).map((r) => r.to);
    const description =
      relaxations.length === 0
        ? `${u} has the smallest tentative distance (${distances[u]}). All its neighbours are already finalized.`
        : improvedTargets.length > 0
          ? `Visit ${u} (distance ${distances[u]}) and relax its edges. Shorter paths found to ${improvedTargets.join(", ")}.`
          : `Visit ${u} (distance ${distances[u]}). No neighbour gets a shorter path through ${u}.`;

    steps.push({
      title: `Visit ${u}`,
      description,
      current: u,
      visited: [...visited],
      distances: { ...distances },
      previous: { ...previous },
      relaxations,
      code: [
        `u = pq.poll(); // ${u}`,
        ...relaxations.map((r) =>
          r.improved
            ? `dist[${r.to}] = ${r.candidate}; // via ${r.from}`
            : `// ${r.from}→${r.to}: ${r.candidate} ≥ ${formatDistance(distances[r.to])}`,
        ),
        `visited.add(${u});`,
      ],
    });
  }

  return steps;
}

/** Sample graph used on the homepage. Coordinates fit a 420 × 260 viewBox. */
export const sampleGraph: WeightedGraph = {
  nodes: [
    { id: "A", x: 56, y: 132 },
    { id: "B", x: 176, y: 48 },
    { id: "C", x: 170, y: 206 },
    { id: "D", x: 330, y: 96 },
    { id: "E", x: 318, y: 222 },
  ],
  edges: [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "B", to: "D", weight: 7 },
    { from: "C", to: "D", weight: 3 },
    { from: "C", to: "E", weight: 6 },
    { from: "D", to: "E", weight: 1 },
  ],
};
