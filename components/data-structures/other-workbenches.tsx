"use client";

import { useState } from "react";
import {
  binaryTreeOps,
  bstOps,
  bstToNodes,
  completeTreeToNodes,
  heapOps,
  traversalLabel,
  type BSTState,
  type BinaryTreeState,
  type HeapState,
  type TraversalOrder,
} from "@/lib/data-structures/trees";
import { emptyTable, graphOps, hashKey, hashTableOps, BUCKETS, type GraphState, type HashTableState } from "@/lib/data-structures/hash-graph";
import type { Mark, OpResult } from "@/lib/data-structures/types";
import { Select } from "@/components/ui/select";
import { DSShell, Field, NumberInput, OpButton, TextInput, shellProps } from "./ds-shell";
import { useOpRunner } from "./use-op-runner";
import { AdjacencyList, ArrayView, GraphDSView, HashTableView, TreeView } from "./views";

const randomValue = () => 1 + Math.floor(Math.random() * 99);
const Divider = () => <span aria-hidden className="mx-1 hidden h-6 w-px bg-line sm:block" />;

const orders: TraversalOrder[] = ["inorder", "preorder", "postorder", "levelorder"];
const orderShort: Record<TraversalOrder, string> = { inorder: "In-order", preorder: "Pre-order", postorder: "Post-order", levelorder: "Level-order" };

function TraversalButtons({ busy, onRun }: { busy: boolean; onRun: (o: TraversalOrder) => void }) {
  return (
    <>
      {orders.map((o) => (
        <OpButton key={o} disabled={busy} onClick={() => onRun(o)} title={traversalLabel[o]}>
          {orderShort[o]}
        </OpButton>
      ))}
    </>
  );
}

/** Shows a complete tree both as a tree and as the array that stores it. */
function TreeAndArray({ items, marks, capacity }: { items: number[]; marks: Record<string, Mark>; capacity: number }) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <TreeView root={completeTreeToNodes(items)} marks={marks} />
      <div className="w-full">
        <p className="mb-2 text-center text-[11.5px] uppercase tracking-[0.08em] text-fg-subtle">Stored as an array — children of i are 2i + 1 and 2i + 2</p>
        <ArrayView items={items} capacity={capacity} marks={marks} showCapacity={false} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- binary tree */

const btInitial: BinaryTreeState = { items: [10, 4, 17, 2, 8, 13], capacity: 15 };

export function BinaryTreeWorkbench() {
  const r = useOpRunner(btInitial, "A complete binary tree with 6 nodes. Insert, delete or run a traversal.");
  const [value, setValue] = useState(21);
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={value} onChange={setValue} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (r.run(`Insert ${value}`, binaryTreeOps.insert(r.state, value)), setValue(randomValue()))}>
            Insert
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run(`Delete ${value}`, binaryTreeOps.remove(r.state, value))}>
            Delete
          </OpButton>
          <Divider />
          <TraversalButtons busy={r.busy} onRun={(o) => r.run(orderShort[o], binaryTreeOps.traverse(r.state, o))} />
          <OpButton disabled={r.busy} onClick={() => r.load(btInitial, "Reset to the starting tree.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<TreeAndArray items={r.view.state.items} marks={r.view.marks} capacity={r.view.state.capacity} />}
    />
  );
}

/* ------------------------------------------------------------------- BST */

function buildBST(values: number[]): BSTState {
  let s: BSTState = { root: null, nextId: 1 };
  for (const v of values) {
    const res = bstOps.insert(s, v);
    if (!res.error) s = res.frames.at(-1)!.state;
  }
  return s;
}
const bstInitial = buildBST([50, 30, 70, 20, 40, 60, 80, 35]);

export function BSTWorkbench() {
  const r = useOpRunner(bstInitial, "A binary search tree. Smaller values go left, larger values go right.");
  const [value, setValue] = useState(45);
  const run = (label: string, res: OpResult<BSTState>) => r.run(label, res);
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={value} onChange={setValue} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (run(`Insert ${value}`, bstOps.insert(r.state, value)), setValue(randomValue()))}>
            Insert
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => run(`Delete ${value}`, bstOps.remove(r.state, value))}>
            Delete
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => run(`Search ${value}`, bstOps.search(r.state, value))}>
            Search
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => run("Min", bstOps.extreme(r.state, "min"))}>
            Min
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => run("Max", bstOps.extreme(r.state, "max"))}>
            Max
          </OpButton>
          <Divider />
          <TraversalButtons busy={r.busy} onRun={(o) => run(orderShort[o], bstOps.traverse(r.state, o))} />
          <OpButton
            disabled={r.busy}
            onClick={() => r.load(buildBST(Array.from({ length: 9 }, randomValue)), "Built a new BST from random values (duplicates skipped).")}
          >
            Random
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(bstInitial, "Reset to the starting tree.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<TreeView root={bstToNodes(r.view.state.root)} marks={r.view.marks} emptyLabel="The tree is empty. Insert a value to create the root." />}
    />
  );
}

/* ------------------------------------------------------------------ Heap */

function buildHeap(values: number[]): HeapState {
  let s: HeapState = { items: [], capacity: 15 };
  for (const v of values) s = heapOps.insert(s, v).frames.at(-1)!.state;
  return s;
}
const heapInitial = buildHeap([12, 3, 9, 15, 5, 10]);

export function HeapWorkbench() {
  const r = useOpRunner(heapInitial, "A min-heap: every parent is smaller than its children, so the minimum sits at the root.");
  const [value, setValue] = useState(4);
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Value">
            <NumberInput label="Value" value={value} onChange={setValue} />
          </Field>
          <Divider />
          <OpButton primary disabled={r.busy} onClick={() => (r.run(`Insert ${value}`, heapOps.insert(r.state, value)), setValue(randomValue()))}>
            Insert
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Extract min", heapOps.extractMin(r.state))}>
            Extract min
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Peek", heapOps.peek(r.state))}>
            Peek
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(heapInitial, "Reset to the starting heap.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<TreeAndArray items={r.view.state.items} marks={r.view.marks} capacity={r.view.state.capacity} />}
    />
  );
}

/* ------------------------------------------------------------ Hash table */

function buildTable(entries: [string, number][]): HashTableState {
  let s = emptyTable();
  for (const [k, v] of entries) s = hashTableOps.put(s, k, v).frames.at(-1)!.state;
  return s;
}
const tableInitial = buildTable([
  ["apple", 3],
  ["banana", 7],
  ["cherry", 1],
  ["date", 9],
  ["fig", 4],
]);

export function HashTableWorkbench() {
  const r = useOpRunner(tableInitial, `A hash table with ${BUCKETS} buckets. Collisions are chained in lists.`);
  const [key, setKey] = useState("grape");
  const [value, setValue] = useState(5);
  const valid = key.length > 0;
  return (
    <DSShell
      {...shellProps(r)}
      controls={
        <>
          <Field label="Key">
            <TextInput label="Key" value={key} onChange={setKey} />
          </Field>
          <Field label="Value">
            <NumberInput label="Value" value={value} onChange={setValue} />
          </Field>
          <span className="font-mono text-[12px] text-fg-subtle" aria-live="polite">
            {valid ? `hash("${key}") = ${hashKey(key)}` : "enter a key"}
          </span>
          <Divider />
          <OpButton primary disabled={r.busy || !valid} onClick={() => r.run(`Put "${key}"`, hashTableOps.put(r.state, key, value))}>
            Put
          </OpButton>
          <OpButton disabled={r.busy || !valid} onClick={() => r.run(`Get "${key}"`, hashTableOps.get(r.state, key))}>
            Get
          </OpButton>
          <OpButton disabled={r.busy || !valid} onClick={() => r.run(`Remove "${key}"`, hashTableOps.remove(r.state, key))}>
            Remove
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(tableInitial, "Reset to the starting table.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<HashTableView table={r.view.state} marks={r.view.marks} />}
    />
  );
}

/* ----------------------------------------------------------------- Graph */

function VertexSelect({ value, onChange, label, vertices }: { value: string; onChange: (v: string) => void; label: string; vertices: string[] }) {
  return (
    <Field label={label}>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="w-[70px]" disabled={vertices.length === 0}>
        {vertices.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </Select>
    </Field>
  );
}

const graphInitial: GraphState = {
  vertices: ["A", "B", "C", "D", "E", "F"],
  edges: [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "D"],
    ["D", "E"],
    ["E", "F"],
  ],
};

export function GraphWorkbench() {
  const r = useOpRunner(graphInitial, "An undirected graph stored as adjacency lists. Build it up, then traverse it.");
  const [a, setA] = useState("A");
  const [b, setB] = useState("F");
  const vs = r.state.vertices;
  const va = vs.includes(a) ? a : vs[0] ?? "";
  const vb = vs.includes(b) ? b : vs[1] ?? vs[0] ?? "";
  const none = vs.length === 0;

  return (
    <DSShell
      {...shellProps(r)}
      aside={<AdjacencyList graph={r.view.state} />}
      controls={
        <>
          <VertexSelect label="u" value={va} onChange={setA} vertices={vs} />
          <VertexSelect label="v" value={vb} onChange={setB} vertices={vs} />
          <Divider />
          <OpButton primary disabled={r.busy || none} onClick={() => r.run(`Add edge ${va}–${vb}`, graphOps.addEdge(r.state, va, vb))}>
            Add edge u–v
          </OpButton>
          <OpButton disabled={r.busy || none} onClick={() => r.run(`Remove edge ${va}–${vb}`, graphOps.removeEdge(r.state, va, vb))}>
            Remove edge
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.run("Add vertex", graphOps.addVertex(r.state))}>
            Add vertex
          </OpButton>
          <OpButton disabled={r.busy || none} onClick={() => r.run(`Remove vertex ${va}`, graphOps.removeVertex(r.state, va))}>
            Remove u
          </OpButton>
          <Divider />
          <OpButton disabled={r.busy || none} onClick={() => r.run(`BFS from ${va}`, graphOps.traverse(r.state, va, "bfs"))}>
            BFS from u
          </OpButton>
          <OpButton disabled={r.busy || none} onClick={() => r.run(`DFS from ${va}`, graphOps.traverse(r.state, va, "dfs"))}>
            DFS from u
          </OpButton>
          <OpButton disabled={r.busy} onClick={() => r.load(graphInitial, "Reset to the starting graph.")}>
            Reset
          </OpButton>
        </>
      }
      canvas={<GraphDSView graph={r.view.state} marks={r.view.marks} />}
    />
  );
}
