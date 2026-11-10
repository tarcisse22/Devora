import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../lib/algorithms/random";
import { arrayOps, linkedListOps, queueOps, stackOps, type ArrayState, type LinkedListState } from "../lib/data-structures/linear";
import {
  binaryTreeOps,
  bstInorder,
  bstOps,
  bstToNodes,
  heapOps,
  isMinHeap,
  traversalSequence,
  treeDepth,
  type BSTState,
  type HeapState,
} from "../lib/data-structures/trees";
import { emptyTable, graphOps, hashKey, hashTableOps, neighbours, type GraphState } from "../lib/data-structures/hash-graph";
import type { OpResult } from "../lib/data-structures/types";

const final = <S,>(r: OpResult<S>) => r.frames.at(-1)!.state;

test("array operations match a reference array", () => {
  const rng = createRng(1);
  let s: ArrayState = { items: [], capacity: 10 };
  const ref: number[] = [];
  for (let k = 0; k < 2000; k++) {
    const op = rng.int(0, 3);
    const v = rng.int(0, 99);
    if (op === 0) {
      const i = rng.int(0, ref.length);
      const r = arrayOps.insertAt(s, i, v);
      if (ref.length < 10) {
        ref.splice(i, 0, v);
        assert.ok(!r.error);
      } else assert.ok(r.error);
      s = final(r);
    } else if (op === 1 && ref.length) {
      const i = rng.int(0, ref.length - 1);
      s = final(arrayOps.removeAt(s, i));
      ref.splice(i, 1);
    } else if (op === 2) {
      const r = arrayOps.search(s, v);
      assert.equal(!r.error, ref.includes(v));
    } else if (ref.length) {
      const i = rng.int(0, ref.length - 1);
      s = final(arrayOps.update(s, i, v));
      ref[i] = v;
    }
    assert.deepEqual(s.items, ref);
  }
});

test("linked list operations match a reference array", () => {
  const rng = createRng(2);
  let s: LinkedListState = { nodes: [], nextId: 1 };
  let ref: number[] = [];
  for (let k = 0; k < 2000; k++) {
    const op = rng.int(0, 5);
    const v = rng.int(0, 30);
    if (op === 0) {
      s = final(linkedListOps.pushFront(s, v));
      ref.unshift(v);
    }
    else if (op === 1) {
      s = final(linkedListOps.pushBack(s, v));
      ref.push(v);
    }
    else if (op === 2) {
      const i = rng.int(0, ref.length);
      s = final(linkedListOps.insertAt(s, i, v));
      ref.splice(i, 0, v);
    } else if (op === 3) {
      const r = linkedListOps.remove(s, v);
      const i = ref.indexOf(v);
      assert.equal(!r.error, i !== -1);
      if (i !== -1) ref.splice(i, 1);
      s = final(r);
    } else if (op === 4 && ref.length >= 2) {
      s = final(linkedListOps.reverse(s));
      ref = [...ref].reverse();
    } else {
      assert.equal(!linkedListOps.search(s, v).error, ref.includes(v));
    }
    if (ref.length > 20) {
      s = { nodes: s.nodes.slice(0, 10), nextId: s.nextId };
      ref = ref.slice(0, 10);
    }
    assert.deepEqual(s.nodes.map((n) => n.value), ref);
    assert.equal(new Set(s.nodes.map((n) => n.id)).size, s.nodes.length, "node ids are unique");
  }
});

test("stack is LIFO and queue is FIFO, with overflow/underflow errors", () => {
  let st = { items: [] as number[], capacity: 3 };
  assert.ok(stackOps.pop(st).error);
  for (const v of [1, 2, 3]) st = final(stackOps.push(st, v));
  assert.ok(stackOps.push(st, 4).error);
  st = final(stackOps.pop(st));
  assert.deepEqual(st.items, [1, 2]);
  let q = { items: [] as number[], capacity: 3 };
  assert.ok(queueOps.dequeue(q).error);
  for (const v of [1, 2, 3]) q = final(queueOps.enqueue(q, v));
  q = final(queueOps.dequeue(q));
  assert.deepEqual(q.items, [2, 3]);
});

test("BST stays ordered and matches a reference set across inserts and all delete cases", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const rng = createRng(seed);
    let s: BSTState = { root: null, nextId: 1 };
    const ref = new Set<number>();
    for (let k = 0; k < 120; k++) {
      const v = rng.int(0, 40);
      if (rng.next() < 0.6) {
        const r = bstOps.insert(s, v);
        if (!r.error) ref.add(v);
        else assert.ok(ref.has(v) || treeDepth(bstToNodes(s.root)) >= 5);
        s = final(r);
      } else {
        const r = bstOps.remove(s, v);
        assert.equal(!r.error, ref.has(v));
        ref.delete(v);
        s = final(r);
      }
      assert.deepEqual(bstInorder(s.root), [...ref].sort((a, b) => a - b));
      assert.ok(treeDepth(bstToNodes(s.root)) <= 6);
      assert.equal(!bstOps.search(s, v).error, ref.has(v));
    }
  }
});

test("min-heap keeps the heap property; extractMin returns values in sorted order", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const rng = createRng(seed);
    let s: HeapState = { items: [], capacity: 15 };
    const inserted: number[] = [];
    for (let k = 0; k < 15; k++) {
      const v = rng.int(0, 99);
      s = final(heapOps.insert(s, v));
      inserted.push(v);
      assert.ok(isMinHeap(s.items));
    }
    assert.ok(heapOps.insert(s, 1).error, "capacity enforced");
    const out: number[] = [];
    while (s.items.length) {
      out.push(s.items[0]);
      s = final(heapOps.extractMin(s));
      assert.ok(isMinHeap(s.items));
    }
    assert.deepEqual(out, [...inserted].sort((a, b) => a - b));
  }
});

test("binary tree traversals are correct on a known tree", () => {
  let s = { items: [] as number[], capacity: 15 };
  for (const v of [1, 2, 3, 4, 5, 6, 7]) s = final(binaryTreeOps.insert(s, v));
  const vals = (order: Parameters<typeof binaryTreeOps.traverse>[1]) => {
    const f = binaryTreeOps.traverse(s, order).frames;
    return f.at(-1)!.message;
  };
  assert.match(vals("inorder"), /4, 2, 5, 1, 6, 3, 7/);
  assert.match(vals("preorder"), /1, 2, 4, 5, 3, 6, 7/);
  assert.match(vals("postorder"), /4, 5, 2, 6, 7, 3, 1/);
  assert.match(vals("levelorder"), /1, 2, 3, 4, 5, 6, 7/);
  s = final(binaryTreeOps.remove(s, 2));
  assert.deepEqual(s.items, [1, 7, 3, 4, 5, 6]);
  assert.equal(traversalSequence(null, "inorder").length, 0);
});

test("hash table matches a reference Map and uses the documented hash", () => {
  assert.equal(hashKey("a"), 97 % 7);
  const rng = createRng(9);
  let s = emptyTable();
  const ref = new Map<string, number>();
  const keys = ["apple", "pear", "kiwi", "fig", "plum", "lime", "date", "nut", "yam", "oat", "rye", "tea"];
  for (let k = 0; k < 1500; k++) {
    const key = rng.pick(keys);
    const v = rng.int(0, 99);
    const op = rng.int(0, 2);
    if (op === 0) {
      s = final(hashTableOps.put(s, key, v));
      ref.set(key, v);
    }
    else if (op === 1) {
      const r = hashTableOps.remove(s, key);
      assert.equal(!r.error, ref.has(key));
      ref.delete(key);
      s = final(r);
    } else {
      const r = hashTableOps.get(s, key);
      assert.equal(!r.error, ref.has(key));
      if (ref.has(key)) assert.match(r.frames.at(-1)!.message, new RegExp(`→ ${ref.get(key)}\\.`));
    }
    const all = new Map(s.buckets.flatMap((b, i) => b.map((e) => { assert.equal(hashKey(e.key), i); return [e.key, e.value] as const; })));
    assert.deepEqual(all, ref);
  }
});

test("graph traversals visit exactly the reachable vertices", () => {
  let s: GraphState = { vertices: [], edges: [] };
  for (let i = 0; i < 6; i++) s = final(graphOps.addVertex(s));
  for (const [a, b] of [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["E", "F"]] as const) s = final(graphOps.addEdge(s, a, b));
  assert.ok(graphOps.addEdge(s, "A", "B").error, "duplicate edge rejected");
  assert.deepEqual(neighbours(s, "A"), ["B", "C"]);
  assert.match(graphOps.traverse(s, "A", "bfs").frames.at(-1)!.message, /A → B → C → D\. Not reachable from A: E, F/);
  assert.match(graphOps.traverse(s, "A", "dfs").frames.at(-1)!.message, /A → B → D → C\./);
  s = final(graphOps.removeVertex(s, "D"));
  assert.ok(!s.edges.some((e) => e.includes("D")));
  s = final(graphOps.removeEdge(s, "A", "B"));
  assert.deepEqual(neighbours(s, "A"), ["C"]);
});
