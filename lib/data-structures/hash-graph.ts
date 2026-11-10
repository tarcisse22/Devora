import { fail, frame, type DSFrame, type Mark, type OpResult } from "./types";

/* ========================================================= Hash table */

export type Entry = { key: string; value: number };
export type HashTableState = { buckets: Entry[][] };

export const BUCKETS = 7;

/** Polynomial string hash, the textbook way: h = h·31 + charCode, mod m. */
export function hashKey(key: string, m = BUCKETS): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % m;
  return h;
}

export const emptyTable = (): HashTableState => ({ buckets: Array.from({ length: BUCKETS }, () => []) });
export const tableSize = (s: HashTableState) => s.buckets.reduce((n, b) => n + b.length, 0);

const entryKey = (bucket: number, i: number) => `${bucket}:${i}`;

function probe(s: HashTableState, key: string, verb: string) {
  const b = hashKey(key);
  const frames: DSFrame<HashTableState>[] = [frame(s, `${verb}: hash("${key}") = ${b}, so look in bucket ${b}.`, { [`b${b}`]: "active" })];
  const chain = s.buckets[b];
  let index = -1;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].key === key) {
      index = i;
      break;
    }
    frames.push(frame(s, `Bucket ${b}, entry "${chain[i].key}" ≠ "${key}" (a collision) — keep walking the chain.`, { [`b${b}`]: "active", [entryKey(b, i)]: "active" }));
  }
  return { b, index, frames };
}

export const hashTableOps = {
  put(s: HashTableState, key: string, value: number): OpResult<HashTableState> {
    const { b, index, frames } = probe(s, key, `Put "${key}"`);
    const buckets = s.buckets.map((chain) => [...chain]);
    if (index >= 0) {
      buckets[b][index] = { key, value };
      frames.push(frame({ buckets }, `"${key}" already exists — update its value to ${value}. Average O(1).`, { [entryKey(b, index)]: "new" }));
    } else {
      buckets[b].push({ key, value });
      const load = tableSize({ buckets }) / BUCKETS;
      const loadNote = load > 0.75 ? ` Load factor is ${load.toFixed(2)} — a real table would now resize and rehash.` : ` Load factor ${load.toFixed(2)}.`;
      frames.push(frame({ buckets }, `Append "${key}" → ${value} to bucket ${b}'s chain.${loadNote}`, { [entryKey(b, buckets[b].length - 1)]: "new" }));
    }
    return { frames };
  },

  get(s: HashTableState, key: string): OpResult<HashTableState> {
    const { b, index, frames } = probe(s, key, `Get "${key}"`);
    if (index < 0) {
      frames.push(frame(s, `End of bucket ${b}'s chain — "${key}" is not in the table.`, { [`b${b}`]: "path" }));
      return { frames, error: true };
    }
    frames.push(frame(s, `Found "${key}" → ${s.buckets[b][index].value}. Average O(1): only one bucket was searched.`, { [entryKey(b, index)]: "found" }));
    return { frames };
  },

  remove(s: HashTableState, key: string): OpResult<HashTableState> {
    const { b, index, frames } = probe(s, key, `Remove "${key}"`);
    if (index < 0) {
      frames.push(frame(s, `"${key}" is not in the table.`, { [`b${b}`]: "path" }));
      return { frames, error: true };
    }
    frames.push(frame(s, `Found "${key}" — unlink it from bucket ${b}'s chain.`, { [entryKey(b, index)]: "removed" }));
    const buckets = s.buckets.map((chain, i) => (i === b ? chain.filter((_, j) => j !== index) : [...chain]));
    frames.push(frame({ buckets }, `Removed "${key}". Average O(1).`));
    return { frames };
  },
};

/* ============================================================== Graph */

export type GraphState = { vertices: string[]; edges: [string, string][] };

export const MAX_VERTICES = 9;
const sameEdge = (e: [string, string], a: string, b: string) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a);
export const edgeId = (a: string, b: string) => [a, b].sort().join("-");

export function neighbours(s: GraphState, v: string): string[] {
  return s.edges
    .filter((e) => e[0] === v || e[1] === v)
    .map((e) => (e[0] === v ? e[1] : e[0]))
    .sort();
}

export const graphOps = {
  addVertex(s: GraphState): OpResult<GraphState> {
    if (s.vertices.length >= MAX_VERTICES) return fail(s, `This view supports up to ${MAX_VERTICES} vertices.`);
    const label = "ABCDEFGHIJ".split("").find((l) => !s.vertices.includes(l))!;
    const next = { ...s, vertices: [...s.vertices, label].sort() };
    return { frames: [frame(next, `Add vertex ${label} with an empty adjacency list. O(1).`, { [label]: "new" })] };
  },

  removeVertex(s: GraphState, v: string): OpResult<GraphState> {
    if (!s.vertices.includes(v)) return fail(s, `There is no vertex ${v}.`);
    const incident = s.edges.filter((e) => e[0] === v || e[1] === v);
    const marks: Record<string, Mark> = { [v]: "removed" };
    for (const e of incident) marks[edgeId(...e)] = "removed";
    return {
      frames: [
        frame(s, `Remove ${v} and its ${incident.length} incident edge${incident.length === 1 ? "" : "s"}.`, marks),
        frame({ vertices: s.vertices.filter((x) => x !== v), edges: s.edges.filter((e) => e[0] !== v && e[1] !== v) }, `Removed ${v}. Every neighbour's adjacency list was updated: O(V + E) with adjacency lists.`),
      ],
    };
  },

  addEdge(s: GraphState, a: string, b: string): OpResult<GraphState> {
    if (a === b) return fail(s, "Self-loops aren’t allowed in this simple graph.");
    if (!s.vertices.includes(a) || !s.vertices.includes(b)) return fail(s, "Both vertices must exist.");
    if (s.edges.some((e) => sameEdge(e, a, b))) return fail(s, `Edge ${a}–${b} already exists.`);
    const next = { ...s, edges: [...s.edges, [a, b] as [string, string]] };
    return { frames: [frame(next, `Add edge ${a}–${b}: append ${b} to ${a}'s list and ${a} to ${b}'s list. O(1).`, { [edgeId(a, b)]: "new", [a]: "active", [b]: "active" })] };
  },

  removeEdge(s: GraphState, a: string, b: string): OpResult<GraphState> {
    if (!s.edges.some((e) => sameEdge(e, a, b))) return fail(s, `There is no edge ${a}–${b}.`);
    return {
      frames: [
        frame(s, `Remove edge ${a}–${b}.`, { [edgeId(a, b)]: "removed" }),
        frame({ ...s, edges: s.edges.filter((e) => !sameEdge(e, a, b)) }, `Removed ${a}–${b} from both adjacency lists. O(degree).`),
      ],
    };
  },

  traverse(s: GraphState, start: string, kind: "bfs" | "dfs"): OpResult<GraphState> {
    if (!s.vertices.includes(start)) return fail(s, `There is no vertex ${start}.`);
    const order: string[] = [];
    const frames: DSFrame<GraphState>[] = [];
    const marksNow = (current: string, via?: string) => {
      const m: Record<string, Mark> = Object.fromEntries(order.map((v) => [v, "path" as Mark]));
      m[current] = "active";
      if (via) m[edgeId(via, current)] = "active";
      return m;
    };
    if (kind === "bfs") {
      const seen = new Set([start]);
      const queue: [string, string | undefined][] = [[start, undefined]];
      while (queue.length) {
        const [v, via] = queue.shift()!;
        order.push(v);
        const fresh = neighbours(s, v).filter((n) => !seen.has(n));
        fresh.forEach((n) => seen.add(n));
        queue.push(...fresh.map((n) => [n, v] as [string, string]));
        frames.push(frame(s, `Visit ${v}. Enqueue unvisited neighbours: ${fresh.join(", ") || "none"}. Queue: [${queue.map((q) => q[0]).join(", ")}]`, marksNow(v, via)));
      }
    } else {
      const seen = new Set<string>();
      const visit = (v: string, via?: string) => {
        seen.add(v);
        order.push(v);
        frames.push(frame(s, `Visit ${v}${via ? ` (from ${via})` : ""}. Go deeper into its first unvisited neighbour.`, marksNow(v, via)));
        for (const n of neighbours(s, v)) if (!seen.has(n)) visit(n, v);
      };
      visit(start);
    }
    const unreached = s.vertices.filter((v) => !order.includes(v));
    frames.push(
      frame(s, `${kind.toUpperCase()} order: ${order.join(" → ")}.${unreached.length ? ` Not reachable from ${start}: ${unreached.join(", ")}.` : ""} O(V + E).`, Object.fromEntries(order.map((v) => [v, "found" as Mark]))),
    );
    return { frames };
  },
};
