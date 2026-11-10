import { createRng } from "./random";
import { edgeKey, formatDistance, type GraphEdge, type GraphNode, type NodeId, type WeightedGraph } from "./dijkstra";

export type NodeState = "unvisited" | "frontier" | "current" | "visited";
export type EdgeState = "tree" | "active" | "rejected";

export type GraphFrame = {
  nodes: Record<NodeId, NodeState>;
  edges: Record<string, EdgeState>;
  /** Small label under each node (visit order, hop count or distance). */
  labels: Record<NodeId, string>;
  /** The algorithm's working structure: queue, stack or priority queue. */
  structure: { name: string; items: string[] };
  order: NodeId[];
  line: number;
  message: string;
};

/* ------------------------------------------------------------ generation */

const COLS = 4;
const ROWS = 3;
const slotPos = (slot: number) => ({ x: 50 + (slot % COLS) * 100, y: 40 + Math.floor(slot / COLS) * 90 });
const neighbours4 = (slot: number) => {
  const c = slot % COLS;
  const r = Math.floor(slot / COLS);
  const out: number[] = [];
  if (c > 0) out.push(slot - 1);
  if (c < COLS - 1) out.push(slot + 1);
  if (r > 0) out.push(slot - COLS);
  if (r < ROWS - 1) out.push(slot + COLS);
  return out;
};

/**
 * Random connected, planar graph on a 4×3 grid of slots: grown from one slot
 * so it is always connected, with grid-adjacent edges and at most one
 * diagonal per cell so edges never cross.
 */
export function randomGraph(nodeCount: number, seed: number, weighted: boolean): WeightedGraph {
  const rng = createRng(seed);
  const n = Math.max(3, Math.min(COLS * ROWS, nodeCount));
  const chosen = new Set<number>([rng.int(0, COLS * ROWS - 1)]);
  const treeEdges: [number, number][] = [];
  while (chosen.size < n) {
    const candidates: [number, number][] = [];
    for (const s of chosen) for (const t of neighbours4(s)) if (!chosen.has(t)) candidates.push([s, t]);
    const [from, to] = rng.pick(candidates);
    chosen.add(to);
    treeEdges.push([from, to]);
  }

  const pairs = new Map<string, [number, number]>();
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  for (const [a, b] of treeEdges) pairs.set(key(a, b), [a, b]);
  for (const s of chosen) {
    for (const t of neighbours4(s)) if (chosen.has(t) && !pairs.has(key(s, t)) && rng.next() < 0.45) pairs.set(key(s, t), [s, t]);
  }
  // One optional diagonal per grid cell (never both, so no crossings).
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      if (rng.next() > 0.3) continue;
      const tl = r * COLS + c;
      const [a, b] = rng.next() < 0.5 ? [tl, tl + COLS + 1] : [tl + 1, tl + COLS];
      if (chosen.has(a) && chosen.has(b)) pairs.set(key(a, b), [a, b]);
    }
  }

  // Label nodes A, B, C… in reading order.
  const slots = [...chosen].sort((a, b) => a - b);
  const idOf = new Map(slots.map((s, i) => [s, String.fromCharCode(65 + i)]));
  const nodes: GraphNode[] = slots.map((s) => {
    const p = slotPos(s);
    return { id: idOf.get(s)!, x: p.x + rng.int(-14, 14), y: p.y + rng.int(-10, 10) };
  });
  const edges: GraphEdge[] = [...pairs.values()].map(([a, b]) => ({
    from: idOf.get(a)!,
    to: idOf.get(b)!,
    weight: weighted ? rng.int(1, 9) : 1,
  }));
  return { nodes, edges };
}

function adjacency(graph: WeightedGraph) {
  const adj = new Map<NodeId, { to: NodeId; weight: number }[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
    adj.get(e.to)!.push({ to: e.from, weight: e.weight });
  }
  // Visit neighbours alphabetically so runs are predictable.
  for (const list of adj.values()) list.sort((a, b) => a.to.localeCompare(b.to));
  return adj;
}

class GraphRecorder {
  frames: GraphFrame[] = [];
  nodes: Record<NodeId, NodeState> = {};
  edges: Record<string, EdgeState> = {};
  labels: Record<NodeId, string> = {};
  order: NodeId[] = [];
  constructor(graph: WeightedGraph) {
    for (const n of graph.nodes) this.nodes[n.id] = "unvisited";
  }
  push(structure: GraphFrame["structure"], line: number, message: string, active?: [NodeId, NodeId], rejected = false) {
    const edges = { ...this.edges };
    if (active) edges[edgeKey(...active)] = rejected ? "rejected" : "active";
    this.frames.push({
      nodes: { ...this.nodes },
      edges,
      labels: { ...this.labels },
      structure: { name: structure.name, items: [...structure.items] },
      order: [...this.order],
      line,
      message,
    });
  }
}

/* ------------------------------------------------------------ algorithms */

export function bfs(graph: WeightedGraph, start: NodeId): GraphFrame[] {
  const adj = adjacency(graph);
  const r = new GraphRecorder(graph);
  const queue: NodeId[] = [start];
  const visited = new Set([start]);
  const hops: Record<NodeId, number> = { [start]: 0 };
  r.nodes[start] = "frontier";
  r.labels[start] = "0";
  const q = () => ({ name: "Queue", items: queue });

  r.push(q(), 1, `Start at ${start}: mark it visited and add it to the queue.`);
  while (queue.length) {
    const u = queue.shift()!;
    r.nodes[u] = "current";
    r.order.push(u);
    r.push(q(), 3, `Dequeue ${u} (${hops[u]} ${hops[u] === 1 ? "hop" : "hops"} from ${start}) and look at its neighbours.`);
    for (const { to: v } of adj.get(u)!) {
      if (visited.has(v)) {
        r.push(q(), 5, `${v} was already discovered — skip it.`, [u, v], true);
        continue;
      }
      visited.add(v);
      hops[v] = hops[u] + 1;
      r.labels[v] = String(hops[v]);
      r.nodes[v] = "frontier";
      r.edges[edgeKey(u, v)] = "tree";
      queue.push(v);
      r.push(q(), 6, `Discover ${v} via ${u}: mark it visited and enqueue it.`, [u, v]);
    }
    r.nodes[u] = "visited";
  }
  r.push(q(), 2, `Queue is empty. Visit order: ${r.order.join(" → ")}. Labels show the fewest hops from ${start}.`);
  return r.frames;
}

export function dfs(graph: WeightedGraph, start: NodeId): GraphFrame[] {
  const adj = adjacency(graph);
  const r = new GraphRecorder(graph);
  const visited = new Set<NodeId>();
  const callStack: NodeId[] = [];
  const s = () => ({ name: "Call stack", items: [...callStack].reverse() });

  const visit = (u: NodeId, from?: NodeId) => {
    visited.add(u);
    callStack.push(u);
    r.order.push(u);
    r.labels[u] = `#${r.order.length}`;
    if (from) r.edges[edgeKey(from, u)] = "tree";
    for (const id of callStack) if (id !== u) r.nodes[id] = "frontier";
    r.nodes[u] = "current";
    r.push(s(), 2, from ? `Go deeper: visit ${u} from ${from}.` : `Start the depth-first search at ${u}.`);
    for (const { to: v } of adj.get(u)!) {
      if (visited.has(v)) {
        r.push(s(), 4, `${v} is already visited — skip it.`, [u, v], true);
        continue;
      }
      r.push(s(), 5, `${v} is unvisited — recurse into it.`, [u, v]);
      visit(v, u);
      r.nodes[u] = "current";
      r.push(s(), 3, `Back at ${u}. Check its remaining neighbours.`);
    }
    callStack.pop();
    r.nodes[u] = "visited";
    r.push(s(), 6, `${u} has no unvisited neighbours left — backtrack.`);
  };

  visit(start);
  r.push(s(), 6, `Done. Visit order: ${r.order.join(" → ")}.`);
  return r.frames;
}

export function dijkstra(graph: WeightedGraph, start: NodeId): GraphFrame[] {
  const adj = adjacency(graph);
  const r = new GraphRecorder(graph);
  const dist: Record<NodeId, number> = {};
  const prev: Record<NodeId, NodeId | null> = {};
  for (const n of graph.nodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    r.labels[n.id] = "∞";
  }
  dist[start] = 0;
  r.labels[start] = "0";
  r.nodes[start] = "frontier";
  const done = new Set<NodeId>();
  let pq: { id: NodeId; d: number }[] = [{ id: start, d: 0 }];
  const view = () => ({ name: "Priority queue", items: [...pq].sort((a, b) => a.d - b.d || a.id.localeCompare(b.id)).map((e) => `${e.id}:${e.d}`) });

  r.push(view(), 1, `Set every distance to ∞, then ${start} to 0 and add it to the priority queue.`);
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
    const { id: u, d } = pq.shift()!;
    if (done.has(u) || d > dist[u]) {
      r.push(view(), 4, `Skip stale entry ${u}:${d} — ${u} is already finalised at ${dist[u]}.`);
      continue;
    }
    done.add(u);
    r.nodes[u] = "current";
    r.order.push(u);
    r.push(view(), 3, `Extract ${u}, the closest unfinalised node (distance ${dist[u]}).`);
    for (const { to: v, weight } of adj.get(u)!) {
      if (done.has(v)) continue;
      const candidate = dist[u] + weight;
      if (candidate < dist[v]) {
        const before = formatDistance(dist[v]);
        dist[v] = candidate;
        if (prev[v]) delete r.edges[edgeKey(prev[v]!, v)];
        prev[v] = u;
        r.edges[edgeKey(u, v)] = "tree";
        r.labels[v] = String(candidate);
        r.nodes[v] = "frontier";
        pq.push({ id: v, d: candidate });
        r.push(view(), 7, `Relax ${u}→${v}: ${dist[u]} + ${weight} = ${candidate} < ${before}. Update ${v}.`, [u, v]);
      } else {
        r.push(view(), 6, `${u}→${v}: ${dist[u]} + ${weight} = ${candidate} is not shorter than ${dist[v]}. Keep it.`, [u, v], true);
      }
    }
    r.nodes[u] = "visited";
    pq = pq.filter((e) => !(e.id === u));
  }
  r.push(view(), 2, `Priority queue is empty. Labels are the shortest distances from ${start}; highlighted edges form the shortest-path tree.`);
  return r.frames;
}
