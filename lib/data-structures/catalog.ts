export type DataStructureInfo = {
  slug: string;
  name: string;
  summary: string;
  explanation: string;
  operations: { name: string; cost: string; note?: string }[];
};

export const dataStructures: DataStructureInfo[] = [
  {
    slug: "array",
    name: "Arrays",
    summary: "Contiguous memory with instant access by index.",
    explanation:
      "An array stores elements next to each other in memory, so element i can be found with simple arithmetic. That makes access O(1) — but inserting or deleting in the middle means shifting everything after it.",
    operations: [
      { name: "Access by index", cost: "O(1)" },
      { name: "Update by index", cost: "O(1)" },
      { name: "Search", cost: "O(n)", note: "O(log n) if sorted, with binary search" },
      { name: "Insert / delete", cost: "O(n)", note: "elements must shift" },
    ],
  },
  {
    slug: "linked-list",
    name: "Linked Lists",
    summary: "Nodes connected by pointers; cheap inserts, no random access.",
    explanation:
      "Each node holds a value and a pointer to the next node. Adding at the head (or the tail, with a tail pointer) is O(1), but reaching position i means following i pointers from the head.",
    operations: [
      { name: "Insert at head / tail", cost: "O(1)", note: "tail needs a tail pointer" },
      { name: "Insert at position", cost: "O(n)", note: "walk to the position first" },
      { name: "Search / delete by value", cost: "O(n)" },
      { name: "Reverse", cost: "O(n)", note: "O(1) extra space" },
    ],
  },
  {
    slug: "stack",
    name: "Stacks",
    summary: "Last in, first out — push and pop at the top.",
    explanation:
      "A stack only allows access to its top element. It powers function calls (the call stack), undo history, expression parsing and depth-first search.",
    operations: [
      { name: "Push", cost: "O(1)" },
      { name: "Pop", cost: "O(1)" },
      { name: "Peek", cost: "O(1)" },
    ],
  },
  {
    slug: "queue",
    name: "Queues",
    summary: "First in, first out — enqueue at the rear, dequeue at the front.",
    explanation:
      "A queue serves elements in arrival order. It is used for scheduling, buffering and breadth-first search. A circular buffer or linked list makes both ends O(1).",
    operations: [
      { name: "Enqueue", cost: "O(1)" },
      { name: "Dequeue", cost: "O(1)", note: "with a circular buffer or linked list" },
      { name: "Peek", cost: "O(1)" },
    ],
  },
  {
    slug: "binary-tree",
    name: "Binary Trees",
    summary: "Each node has up to two children; explore the four traversals.",
    explanation:
      "This binary tree stays complete — every level is full except possibly the last — so it fits neatly in an array: the children of index i are 2i + 1 and 2i + 2. Try each traversal order.",
    operations: [
      { name: "Insert (next free position)", cost: "O(1)", note: "array-backed complete tree" },
      { name: "Delete by value", cost: "O(n)", note: "find it, replace with the last node" },
      { name: "Traversals", cost: "O(n)" },
    ],
  },
  {
    slug: "bst",
    name: "Binary Search Trees",
    summary: "Left subtree smaller, right subtree larger — search by halving.",
    explanation:
      "In a BST every value in a node’s left subtree is smaller and every value in its right subtree is larger, so each comparison discards a subtree. Operations cost O(h): O(log n) when balanced, O(n) when it degenerates into a chain.",
    operations: [
      { name: "Search", cost: "O(h)" },
      { name: "Insert", cost: "O(h)" },
      { name: "Delete", cost: "O(h)", note: "leaf, one child, or two children (successor)" },
      { name: "In-order traversal", cost: "O(n)", note: "always visits values in sorted order" },
    ],
  },
  {
    slug: "heap",
    name: "Heaps",
    summary: "A complete tree where every parent is smaller than its children.",
    explanation:
      "A min-heap keeps the smallest value at the root. New values sift up from the bottom; removing the root moves the last value to the top and sifts it down. It is the classic priority-queue implementation.",
    operations: [
      { name: "Peek min", cost: "O(1)" },
      { name: "Insert", cost: "O(log n)", note: "sift up" },
      { name: "Extract min", cost: "O(log n)", note: "sift down" },
    ],
  },
  {
    slug: "hash-table",
    name: "Hash Tables",
    summary: "Keys hashed into buckets for average O(1) lookups.",
    explanation:
      "A hash function turns each key into a bucket index. Different keys can land in the same bucket (a collision); this table resolves collisions by chaining entries in a list. With a good hash and a low load factor, chains stay short.",
    operations: [
      { name: "Put", cost: "O(1) average", note: "O(n) worst case" },
      { name: "Get", cost: "O(1) average", note: "O(n) worst case" },
      { name: "Remove", cost: "O(1) average", note: "O(n) worst case" },
    ],
  },
  {
    slug: "graph",
    name: "Graphs",
    summary: "Vertices and edges, stored as adjacency lists.",
    explanation:
      "A graph models relationships: vertices connected by edges. This one is undirected and stored as adjacency lists — each vertex keeps a list of its neighbours. Build your own graph, then run BFS or DFS over it.",
    operations: [
      { name: "Add vertex", cost: "O(1)" },
      { name: "Add / remove edge", cost: "O(1) / O(degree)" },
      { name: "Remove vertex", cost: "O(V + E)" },
      { name: "BFS / DFS", cost: "O(V + E)" },
    ],
  },
];

export const dataStructureBySlug = (slug: string) => dataStructures.find((d) => d.slug === slug);
