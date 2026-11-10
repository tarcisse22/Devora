export type AlgorithmCategory = "sorting" | "searching" | "graph";

export type AlgorithmInfo = {
  slug: string;
  name: string;
  category: AlgorithmCategory;
  summary: string;
  /** How it works, in two or three sentences. */
  explanation: string;
  pseudocode: string[];
  complexity: { best: string; average: string; worst: string; space: string };
  /** Extra property shown next to complexity (stability, prerequisites). */
  notes: string[];
};

export const categoryLabel: Record<AlgorithmCategory, string> = {
  sorting: "Sorting",
  searching: "Searching",
  graph: "Graph",
};

export const algorithms: AlgorithmInfo[] = [
  {
    slug: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    summary: "Repeatedly swaps adjacent values that are out of order.",
    explanation:
      "Each pass walks the array and swaps neighbours that are out of order, so the largest remaining value “bubbles” to the end. If a pass makes no swaps, the array is sorted and it stops early.",
    pseudocode: [
      "for i ← 0 to n − 2",
      "  for j ← 0 to n − 2 − i",
      "    if A[j] > A[j + 1]",
      "      swap A[j], A[j + 1]",
      "  A[n − 1 − i] is now in place",
      "  if no swaps this pass: stop",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: ["Stable", "In place"],
  },
  {
    slug: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    summary: "Selects the smallest remaining value and moves it to the front.",
    explanation:
      "For each position, it scans the unsorted part to find the minimum and swaps it into place. It always does the same number of comparisons, regardless of the input order.",
    pseudocode: [
      "for i ← 0 to n − 2",
      "  min ← i",
      "  for j ← i + 1 to n − 1",
      "    if A[j] < A[min]",
      "      min ← j",
      "  swap A[i], A[min]",
    ],
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: ["Not stable", "In place", "At most n − 1 swaps"],
  },
  {
    slug: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    summary: "Grows a sorted prefix by inserting each value into place.",
    explanation:
      "It keeps the left part of the array sorted. Each new value is shifted left past larger values until it reaches its spot. It is very fast on nearly-sorted data.",
    pseudocode: [
      "for i ← 1 to n − 1",
      "  key ← A[i]; j ← i − 1",
      "  while j ≥ 0 and A[j] > key",
      "    A[j + 1] ← A[j]; j ← j − 1",
      "  A[j + 1] ← key",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: ["Stable", "In place", "Adaptive"],
  },
  {
    slug: "merge-sort",
    name: "Merge Sort",
    category: "sorting",
    summary: "Splits the array in half, sorts each half and merges them.",
    explanation:
      "A divide-and-conquer algorithm: split until sub-arrays have one value, then merge pairs of sorted halves by repeatedly taking the smaller front value. Its running time doesn’t depend on input order.",
    pseudocode: [
      "mergeSort(A, lo, hi):",
      "  if hi ≤ lo: return",
      "  mid ← ⌊(lo + hi) / 2⌋",
      "  mergeSort(A, lo, mid); mergeSort(A, mid + 1, hi)",
      "  merge A[lo…mid] and A[mid+1…hi]:",
      "    write the smaller front value back into A",
      "    copy whatever remains",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
    notes: ["Stable", "Needs extra memory"],
  },
  {
    slug: "quick-sort",
    name: "Quick Sort",
    category: "sorting",
    summary: "Partitions around a pivot, then sorts each side.",
    explanation:
      "It picks a pivot (here, the last value), moves smaller values to its left, puts the pivot in its final position and recurses on both sides. This version uses the Lomuto partition scheme.",
    pseudocode: [
      "quickSort(A, lo, hi):",
      "  if lo ≥ hi: return",
      "  pivot ← A[hi]; i ← lo",
      "  for j ← lo to hi − 1",
      "    if A[j] < pivot: swap A[i], A[j]; i ← i + 1",
      "  swap A[i], A[hi]   // pivot in final place",
      "  quickSort(A, lo, i − 1); quickSort(A, i + 1, hi)",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
    notes: ["Not stable", "In place", "Worst case on already-sorted input with this pivot"],
  },
  {
    slug: "linear-search",
    name: "Linear Search",
    category: "searching",
    summary: "Checks every value in order until it finds the target.",
    explanation:
      "The simplest search: compare the target with each value from left to right. It works on any array, sorted or not.",
    pseudocode: ["for i ← 0 to n − 1", "  if A[i] = target", "    return i", "return −1"],
    complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
    notes: ["Works on unsorted data"],
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    category: "searching",
    summary: "Halves a sorted search range at every step.",
    explanation:
      "On a sorted array, compare the target with the middle value. If they differ, the target can only be in one half, so the other half is discarded. Each step halves the range.",
    pseudocode: [
      "lo ← 0; hi ← n − 1",
      "while lo ≤ hi",
      "  mid ← ⌊(lo + hi) / 2⌋",
      "  if A[mid] = target: return mid",
      "  if A[mid] < target: lo ← mid + 1",
      "  else: hi ← mid − 1",
      "return −1",
    ],
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
    notes: ["Requires sorted data"],
  },
  {
    slug: "bfs",
    name: "Breadth-First Search",
    category: "graph",
    summary: "Explores a graph level by level using a queue.",
    explanation:
      "BFS visits all neighbours of a node before going further, so nodes are reached in order of how many edges away they are. Labels show that hop count; on unweighted graphs it gives shortest paths.",
    pseudocode: [
      "queue ← [s]; visited ← {s}",
      "while queue is not empty",
      "  u ← queue.dequeue()",
      "  for each neighbour v of u",
      "    if v is visited: skip",
      "    visited.add(v); queue.enqueue(v)",
    ],
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    notes: ["Shortest paths in unweighted graphs"],
  },
  {
    slug: "dfs",
    name: "Depth-First Search",
    category: "graph",
    summary: "Goes as deep as possible before backtracking.",
    explanation:
      "DFS follows one path as far as it can, then backtracks to the most recent node with unexplored neighbours. This version is recursive; the call stack is shown live. Labels show visit order.",
    pseudocode: [
      "dfs(u):",
      "  visited.add(u)",
      "  for each neighbour v of u",
      "    if v is visited: skip",
      "    dfs(v)",
      "  backtrack",
    ],
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    notes: ["Basis for cycle detection and topological sort"],
  },
  {
    slug: "dijkstra",
    name: "Dijkstra’s Shortest Path",
    category: "graph",
    summary: "Finds shortest paths from a source in a weighted graph.",
    explanation:
      "Dijkstra repeatedly finalises the closest unfinalised node and relaxes its edges — updating a neighbour if going through this node is shorter. It requires non-negative edge weights.",
    pseudocode: [
      "dist[*] ← ∞; dist[s] ← 0; pq ← {s}",
      "while pq is not empty",
      "  u ← pq.extractMin()",
      "  if u is finalised: skip",
      "  for each edge (u, v, w)",
      "    if dist[u] + w ≥ dist[v]: keep dist[v]",
      "    else dist[v] ← dist[u] + w; pq.add(v)",
    ],
    complexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)", space: "O(V)" },
    notes: ["Non-negative weights only", "Binary-heap priority queue"],
  },
];

export const algorithmBySlug = (slug: string) => algorithms.find((a) => a.slug === slug);
