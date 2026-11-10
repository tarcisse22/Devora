import { test } from "node:test";
import assert from "node:assert/strict";
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort } from "../lib/algorithms/sorting";
import { binarySearch, linearSearch } from "../lib/algorithms/searching";
import { bfs, dfs, dijkstra, randomGraph } from "../lib/algorithms/graphs";
import { randomArray } from "../lib/algorithms/random";
import { traceDijkstra } from "../lib/algorithms/dijkstra";

const sorts = { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort };

for (const [name, sort] of Object.entries(sorts)) {
  test(`${name} sorts random arrays and marks everything sorted`, () => {
    for (let seed = 1; seed <= 150; seed++) {
      const input = randomArray(1 + (seed % 30), seed);
      const frames = sort(input);
      const last = frames.at(-1)!;
      assert.deepEqual(last.array, [...input].sort((a, b) => a - b), `seed ${seed}`);
      assert.equal(last.sorted.length, input.length);
      // The input passed in must not be mutated.
      assert.deepEqual(input, randomArray(1 + (seed % 30), seed));
    }
  });
}

test("bubble sort stops early on sorted input (O(n) best case)", () => {
  const frames = bubbleSort([1, 2, 3, 4, 5, 6]);
  assert.equal(frames.at(-1)!.comparisons, 5);
});

test("linear and binary search agree with indexOf", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const arr = randomArray(12, seed);
    const sorted = [...new Set(arr)].sort((a, b) => a - b);
    for (const target of [arr[seed % arr.length], 1000, 0]) {
      const lin = linearSearch(arr, target).at(-1)!;
      assert.equal(lin.found ?? -1, arr.indexOf(target));
      const bin = binarySearch(sorted, target).at(-1)!;
      assert.equal(bin.found ?? -1, sorted.indexOf(target));
      assert.ok(bin.comparisons <= Math.ceil(Math.log2(sorted.length + 1)));
    }
  }
});

/** Floyd–Warshall reference for shortest distances. */
function allPairs(graph: ReturnType<typeof randomGraph>) {
  const ids = graph.nodes.map((n) => n.id);
  const d: Record<string, Record<string, number>> = {};
  for (const a of ids) {
    d[a] = {};
    for (const b of ids) d[a][b] = a === b ? 0 : Infinity;
  }
  for (const e of graph.edges) {
    d[e.from][e.to] = Math.min(d[e.from][e.to], e.weight);
    d[e.to][e.from] = Math.min(d[e.to][e.from], e.weight);
  }
  for (const k of ids) for (const i of ids) for (const j of ids) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
  return d;
}

test("random graphs are connected and Dijkstra matches Floyd–Warshall", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const g = randomGraph(5 + (seed % 5), seed, true);
    const ref = allPairs(g);
    const start = g.nodes[0].id;
    for (const n of g.nodes) assert.ok(Number.isFinite(ref[start][n.id]), `graph ${seed} disconnected`);
    const last = dijkstra(g, start).at(-1)!;
    for (const n of g.nodes) assert.equal(Number(last.labels[n.id]), ref[start][n.id], `seed ${seed} node ${n.id}`);
    // The original hero trace agrees too.
    const hero = traceDijkstra(g, start).at(-1)!;
    for (const n of g.nodes) assert.equal(hero.distances[n.id], ref[start][n.id]);
  }
});

test("BFS hop counts are unweighted shortest paths; DFS visits every node once", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const g = randomGraph(5 + (seed % 5), seed, false);
    const ref = allPairs(g);
    const start = g.nodes[seed % g.nodes.length].id;
    const b = bfs(g, start).at(-1)!;
    for (const n of g.nodes) assert.equal(Number(b.labels[n.id]), ref[start][n.id]);
    const d = dfs(g, start).at(-1)!;
    assert.equal(new Set(d.order).size, g.nodes.length);
    assert.equal(d.order.length, g.nodes.length);
  }
});
