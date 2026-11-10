import { fail, frame, type DSFrame, type Mark, type OpResult } from "./types";

/** Generic tree shape used for rendering and traversals. */
export type TreeNode = { key: string; value: number; left: TreeNode | null; right: TreeNode | null };

export type TraversalOrder = "inorder" | "preorder" | "postorder" | "levelorder";

export const traversalLabel: Record<TraversalOrder, string> = {
  inorder: "In-order (left, node, right)",
  preorder: "Pre-order (node, left, right)",
  postorder: "Post-order (left, right, node)",
  levelorder: "Level-order (breadth-first)",
};

export function traversalSequence(root: TreeNode | null, order: TraversalOrder): TreeNode[] {
  const out: TreeNode[] = [];
  if (order === "levelorder") {
    const q = root ? [root] : [];
    while (q.length) {
      const n = q.shift()!;
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }
  const go = (n: TreeNode | null) => {
    if (!n) return;
    if (order === "preorder") out.push(n);
    go(n.left);
    if (order === "inorder") out.push(n);
    go(n.right);
    if (order === "postorder") out.push(n);
  };
  go(root);
  return out;
}

function traverseFrames<S>(state: S, root: TreeNode | null, order: TraversalOrder, extra = ""): OpResult<S> {
  const seq = traversalSequence(root, order);
  if (seq.length === 0) return fail(state, "The tree is empty.");
  const seen: number[] = [];
  const frames = seq.map((n) => {
    seen.push(n.value);
    const marks: Record<string, Mark> = {};
    for (const done of seq.slice(0, seen.length - 1)) marks[done.key] = "path";
    marks[n.key] = "active";
    return frame(state, `Visit ${n.value}. ${traversalLabel[order].split(" (")[0]}: ${seen.join(", ")}`, marks);
  });
  frames.push(frame(state, `${traversalLabel[order]}: ${seen.join(", ")}.${extra}`));
  return { frames };
}

export const treeDepth = (n: TreeNode | null): number => (n ? 1 + Math.max(treeDepth(n.left), treeDepth(n.right)) : 0);

/* ============================================ Binary tree (complete, array) */

export type BinaryTreeState = { items: number[]; capacity: number };

export function completeTreeToNodes(items: number[], i = 0): TreeNode | null {
  if (i >= items.length) return null;
  return { key: String(i), value: items[i], left: completeTreeToNodes(items, 2 * i + 1), right: completeTreeToNodes(items, 2 * i + 2) };
}

export const binaryTreeOps = {
  insert(s: BinaryTreeState, value: number): OpResult<BinaryTreeState> {
    if (s.items.length >= s.capacity) return fail(s, `The tree is full for this view (${s.capacity} nodes, 4 levels).`);
    const i = s.items.length;
    const items = [...s.items, value];
    const where = i === 0 ? "It becomes the root." : `It becomes the ${i % 2 === 1 ? "left" : "right"} child of ${s.items[Math.floor((i - 1) / 2)]}.`;
    return { frames: [frame({ ...s, items }, `Insert ${value} at the first free spot in level order (position ${i}). ${where}`, { [i]: "new" })] };
  },

  remove(s: BinaryTreeState, value: number): OpResult<BinaryTreeState> {
    const frames: DSFrame<BinaryTreeState>[] = [];
    const idx = s.items.indexOf(value);
    for (let i = 0; i < s.items.length; i++) {
      if (i === idx) break;
      frames.push(frame(s, `Level-order search: ${s.items[i]} ≠ ${value}.`, { [i]: "active" }));
    }
    if (idx === -1) {
      frames.push(frame(s, `${value} is not in the tree.`));
      return { frames, error: true };
    }
    const last = s.items.length - 1;
    frames.push(frame(s, `Found ${value}. Replace it with the deepest, rightmost node (${s.items[last]}) so the tree stays complete.`, { [idx]: "removed", [last]: "active" }));
    const items = [...s.items];
    items[idx] = items[last];
    items.pop();
    frames.push(frame({ ...s, items }, idx === last ? `Removed ${value}.` : `Moved ${s.items[last]} into its place and removed the last position.`, idx < items.length ? { [idx]: "new" } : {}));
    return { frames };
  },

  traverse(s: BinaryTreeState, order: TraversalOrder) {
    return traverseFrames(s, completeTreeToNodes(s.items), order);
  },
};

/* ===================================================== Binary search tree */

export type BSTNode = { id: number; value: number; left: BSTNode | null; right: BSTNode | null };
export type BSTState = { root: BSTNode | null; nextId: number };

export const MAX_BST_DEPTH = 6;

export const bstToNodes = (n: BSTNode | null): TreeNode | null =>
  n ? { key: String(n.id), value: n.value, left: bstToNodes(n.left), right: bstToNodes(n.right) } : null;

/** Path of nodes from the root towards `value` (ends at the match or at a null child). */
function searchPath(root: BSTNode | null, value: number): BSTNode[] {
  const path: BSTNode[] = [];
  let n = root;
  while (n) {
    path.push(n);
    if (value === n.value) break;
    n = value < n.value ? n.left : n.right;
  }
  return path;
}

const pathMarks = (path: BSTNode[], last: Mark): Record<string, Mark> =>
  Object.fromEntries(path.map((n, i) => [String(n.id), i === path.length - 1 ? last : "path"]));

function insertNode(n: BSTNode | null, node: BSTNode): BSTNode {
  if (!n) return node;
  return node.value < n.value ? { ...n, left: insertNode(n.left, node) } : { ...n, right: insertNode(n.right, node) };
}

function removeNode(n: BSTNode | null, value: number): BSTNode | null {
  if (!n) return null;
  if (value < n.value) return { ...n, left: removeNode(n.left, value) };
  if (value > n.value) return { ...n, right: removeNode(n.right, value) };
  if (!n.left) return n.right;
  if (!n.right) return n.left;
  let succ = n.right;
  while (succ.left) succ = succ.left;
  return { ...n, value: succ.value, right: removeNode(n.right, succ.value) };
}

export function bstInorder(n: BSTNode | null, out: number[] = []): number[] {
  if (n) {
    bstInorder(n.left, out);
    out.push(n.value);
    bstInorder(n.right, out);
  }
  return out;
}

export const bstOps = {
  insert(s: BSTState, value: number): OpResult<BSTState> {
    const path = searchPath(s.root, value);
    const frames: DSFrame<BSTState>[] = path.map((n, i) =>
      frame(s, n.value === value ? `${value} is already in the tree — a BST holds each value once.` : `${value} ${value < n.value ? "<" : ">"} ${n.value}: go ${value < n.value ? "left" : "right"}.`, pathMarks(path.slice(0, i + 1), "active")),
    );
    if (path.at(-1)?.value === value) return { frames, error: true };
    if (path.length + 1 > MAX_BST_DEPTH) {
      frames.push(frame(s, `Inserting ${value} would make the tree deeper than ${MAX_BST_DEPTH} levels, which this view can’t show. (An unbalanced BST degrades towards a linked list.)`));
      return { frames, error: true };
    }
    const node: BSTNode = { id: s.nextId, value, left: null, right: null };
    const next = { root: insertNode(s.root, node), nextId: s.nextId + 1 };
    const parent = path.at(-1);
    frames.push(frame(next, parent ? `Reached an empty ${value < parent.value ? "left" : "right"} child of ${parent.value}: insert ${value} there. O(h).` : `The tree was empty: ${value} becomes the root.`, { [node.id]: "new" }));
    return { frames };
  },

  search(s: BSTState, value: number): OpResult<BSTState> {
    const path = searchPath(s.root, value);
    if (path.length === 0) return fail(s, "The tree is empty.");
    const found = path.at(-1)!.value === value;
    const frames = path.map((n, i) =>
      frame(s, n.value === value ? `Found ${value} after ${i + 1} comparison${i ? "s" : ""}.` : `${value} ${value < n.value ? "<" : ">"} ${n.value}: go ${value < n.value ? "left" : "right"}.`, pathMarks(path.slice(0, i + 1), n.value === value ? "found" : "active")),
    );
    if (!found) frames.push(frame(s, `Reached an empty child — ${value} is not in the tree.`, pathMarks(path, "path")));
    return { frames, error: !found };
  },

  remove(s: BSTState, value: number): OpResult<BSTState> {
    const path = searchPath(s.root, value);
    const target = path.at(-1);
    const frames: DSFrame<BSTState>[] = path.map((n, i) =>
      frame(s, n.value === value ? `Found ${value}.` : `${value} ${value < n.value ? "<" : ">"} ${n.value}: go ${value < n.value ? "left" : "right"}.`, pathMarks(path.slice(0, i + 1), n.value === value ? "removed" : "active")),
    );
    if (!target || target.value !== value) {
      frames.push(frame(s, `${value} is not in the tree.`));
      return { frames, error: true };
    }
    let message: string;
    if (!target.left && !target.right) message = `Case 1 — ${value} is a leaf: simply remove it.`;
    else if (!target.left || !target.right) message = `Case 2 — ${value} has one child: link that child to ${value}'s parent.`;
    else {
      const succPath: BSTNode[] = [];
      let succ: BSTNode | null = target.right;
      while (succ) {
        succPath.push(succ);
        succ = succ.left;
      }
      const successor = succPath.at(-1)!;
      for (let i = 0; i < succPath.length; i++) {
        frames.push(frame(s, i === succPath.length - 1 ? `In-order successor is ${successor.value} (smallest value in the right subtree).` : `Case 3 — two children. Find the in-order successor: go right once, then left as far as possible.`, { [target.id]: "removed", ...pathMarks(succPath.slice(0, i + 1), "active") }));
      }
      message = `Copy ${successor.value} into ${value}'s node, then delete ${successor.value} from the right subtree.`;
    }
    const next = { ...s, root: removeNode(s.root, value) };
    frames.push(frame(next, `${message} Order is preserved. O(h).`));
    return { frames };
  },

  extreme(s: BSTState, which: "min" | "max"): OpResult<BSTState> {
    if (!s.root) return fail(s, "The tree is empty.");
    const path: BSTNode[] = [];
    let n: BSTNode | null = s.root;
    while (n) {
      path.push(n);
      n = which === "min" ? n.left : n.right;
    }
    const frames = path.map((p, i) =>
      frame(s, i === path.length - 1 ? `${which === "min" ? "Minimum" : "Maximum"} is ${p.value}: no further ${which === "min" ? "left" : "right"} child.` : `Keep going ${which === "min" ? "left" : "right"} from ${p.value}.`, pathMarks(path.slice(0, i + 1), i === path.length - 1 ? "found" : "active")),
    );
    return { frames };
  },

  traverse(s: BSTState, order: TraversalOrder) {
    return traverseFrames(s, bstToNodes(s.root), order, order === "inorder" ? " In-order traversal of a BST is always sorted." : "");
  },
};

/* ================================================================ Min-heap */

export type HeapState = { items: number[]; capacity: number };

export const heapOps = {
  insert(s: HeapState, value: number): OpResult<HeapState> {
    if (s.items.length >= s.capacity) return fail(s, `The heap is full for this view (${s.capacity} nodes).`);
    let items = [...s.items, value];
    let i = items.length - 1;
    const frames: DSFrame<HeapState>[] = [frame({ ...s, items }, `Add ${value} at the next free position (index ${i}) to keep the tree complete.`, { [i]: "new" })];
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (items[p] <= items[i]) {
        frames.push(frame({ ...s, items }, `Parent ${items[p]} ≤ ${items[i]}: heap property holds. Stop.`, { [i]: "found", [p]: "path" }));
        break;
      }
      frames.push(frame({ ...s, items }, `Parent ${items[p]} > ${items[i]}: sift up.`, { [i]: "active", [p]: "active" }));
      items = [...items];
      [items[p], items[i]] = [items[i], items[p]];
      frames.push(frame({ ...s, items }, `Swapped ${items[p]} and ${items[i]}.`, { [p]: "new" }));
      i = p;
    }
    if (i === 0 && frames.length > 1) frames.push(frame({ ...s, items }, `${items[0]} reached the root — it is the new minimum. O(log n).`, { 0: "found" }));
    return { frames };
  },

  extractMin(s: HeapState): OpResult<HeapState> {
    if (s.items.length === 0) return fail(s, "The heap is empty.");
    const min = s.items[0];
    const frames: DSFrame<HeapState>[] = [frame(s, `The minimum is always at the root: ${min}. Remove it.`, { 0: "removed" })];
    if (s.items.length === 1) {
      frames.push(frame({ ...s, items: [] }, `Removed ${min}. The heap is now empty.`));
      return { frames };
    }
    let items = [s.items.at(-1)!, ...s.items.slice(1, -1)];
    frames.push(frame({ ...s, items }, `Move the last element (${items[0]}) to the root, then sift it down.`, { 0: "active" }));
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < items.length && items[l] < items[smallest]) smallest = l;
      if (r < items.length && items[r] < items[smallest]) smallest = r;
      if (smallest === i) {
        frames.push(frame({ ...s, items }, `${items[i]} is no larger than its children: heap property restored. Extracted ${min} in O(log n).`, { [i]: "found" }));
        break;
      }
      frames.push(frame({ ...s, items }, `Smaller child ${items[smallest]} < ${items[i]}: sift down.`, { [i]: "active", [smallest]: "active" }));
      items = [...items];
      [items[i], items[smallest]] = [items[smallest], items[i]];
      frames.push(frame({ ...s, items }, `Swapped ${items[i]} and ${items[smallest]}.`, { [i]: "new" }));
      i = smallest;
    }
    return { frames };
  },

  peek(s: HeapState): OpResult<HeapState> {
    if (s.items.length === 0) return fail(s, "The heap is empty.");
    return { frames: [frame(s, `Peek: the minimum is the root, ${s.items[0]}. O(1).`, { 0: "found" })] };
  },
};

export const isMinHeap = (items: number[]) => items.every((v, i) => i === 0 || items[Math.floor((i - 1) / 2)] <= v);
