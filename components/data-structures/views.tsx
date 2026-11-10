import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import type { Mark } from "@/lib/data-structures/types";
import type { ListNode } from "@/lib/data-structures/linear";
import type { TreeNode } from "@/lib/data-structures/trees";
import { edgeId, neighbours, type GraphState, type HashTableState } from "@/lib/data-structures/hash-graph";
import { cn } from "@/lib/utils";
import { markClasses, markSvg } from "./ds-shell";

type Marks = Record<string, Mark>;

const Cell = ({ value, mark, className }: { value: string | number; mark?: Mark; className?: string }) => (
  <span
    className={cn(
      "flex size-11 items-center justify-center rounded-[8px] border font-mono text-[14px] transition-all duration-300 sm:size-12",
      markClasses(mark),
      className,
    )}
  >
    {value}
  </span>
);

const EmptySlot = () => <span className="flex size-11 rounded-[8px] border border-dashed border-line sm:size-12" aria-hidden />;

/* ---------------------------------------------------------------- array */

export function ArrayView({ items, capacity, marks, showCapacity = true }: { items: number[]; capacity: number; marks: Marks; showCapacity?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <ol className="flex flex-wrap justify-center gap-1.5 sm:gap-2" aria-label={`Array: ${items.join(", ") || "empty"}`}>
        {items.map((v, i) => (
          <li key={i} className="flex flex-col items-center">
            <span className="mb-1 font-mono text-[10px] text-fg-subtle">{i}</span>
            <Cell value={v} mark={marks[i]} />
          </li>
        ))}
        {showCapacity &&
          Array.from({ length: Math.max(0, capacity - items.length) }, (_, k) => (
            <li key={`e${k}`} className="flex flex-col items-center">
              <span className="mb-1 font-mono text-[10px] text-fg-subtle/50">{items.length + k}</span>
              <EmptySlot />
            </li>
          ))}
      </ol>
      {showCapacity && (
        <p className="mt-4 text-[12px] text-fg-subtle">
          length {items.length} · capacity {capacity}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- linked list */

export function LinkedListView({ nodes, marks }: { nodes: ListNode[]; marks: Marks }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-y-6" aria-label={`Linked list: ${nodes.map((n) => n.value).join(" → ") || "empty"}`}>
      <li className="mr-2 font-mono text-[11px] text-accent-300">head →</li>
      {nodes.map((n, i) => (
        <Fragment key={n.id}>
          <li className="relative flex">
            <span className={cn("flex h-11 items-stretch overflow-hidden rounded-[8px] border font-mono text-[14px] transition-all duration-300", markClasses(marks[n.id]))}>
              <span className="flex w-11 items-center justify-center">{n.value}</span>
              <span className="flex w-6 items-center justify-center border-l border-current/20 opacity-60" aria-hidden>
                •
              </span>
            </span>
            {i === nodes.length - 1 && <span className="absolute -bottom-5 left-0 right-0 text-center font-mono text-[10px] text-accent-300">tail</span>}
          </li>
          <li aria-hidden className="px-1.5 text-fg-subtle">
            <ArrowRight className="size-4" />
          </li>
        </Fragment>
      ))}
      <li className="font-mono text-[12px] text-fg-subtle">null</li>
    </ol>
  );
}

/* ---------------------------------------------------------------- stack */

export function StackView({ items, capacity, marks }: { items: number[]; capacity: number; marks: Marks }) {
  return (
    <div className="flex items-end gap-4">
      <ol className="flex flex-col-reverse items-center gap-1.5 rounded-b-[12px] border-x-2 border-b-2 border-line-strong px-3 pb-3 pt-1" aria-label={`Stack, bottom to top: ${items.join(", ") || "empty"}`}>
        {items.map((v, i) => (
          <li key={i} className="relative">
            <Cell value={v} mark={marks[i]} className="w-24 sm:w-28" />
            {i === items.length - 1 && <span className="absolute -right-12 top-1/2 -translate-y-1/2 font-mono text-[11px] text-accent-300">← top</span>}
          </li>
        ))}
        {Array.from({ length: Math.max(0, capacity - items.length) }, (_, k) => (
          <li key={`e${k}`} aria-hidden>
            <span className="flex h-11 w-24 rounded-[8px] border border-dashed border-line/60 sm:h-12 sm:w-28" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- queue */

export function QueueView({ items, capacity, marks }: { items: number[]; capacity: number; marks: Marks }) {
  return (
    <div className="flex flex-col items-center">
      <ol className="flex flex-wrap justify-center gap-1.5 border-y-2 border-line-strong px-2 py-3 sm:gap-2" aria-label={`Queue, front to rear: ${items.join(", ") || "empty"}`}>
        {items.map((v, i) => (
          <li key={i} className="relative">
            <Cell value={v} mark={marks[i]} />
            {i === 0 && <span className="absolute -bottom-7 left-0 right-0 text-center font-mono text-[10px] text-accent-300">front</span>}
            {i === items.length - 1 && <span className="absolute -top-7 left-0 right-0 text-center font-mono text-[10px] text-accent-300">rear</span>}
          </li>
        ))}
        {Array.from({ length: Math.max(0, capacity - items.length) }, (_, k) => (
          <li key={`e${k}`}>
            <EmptySlot />
          </li>
        ))}
      </ol>
      <p className="mt-10 text-[12px] text-fg-subtle">← dequeue from the front · enqueue at the rear ←</p>
    </div>
  );
}

/* ----------------------------------------------------------------- tree */

type Placed = { node: TreeNode; x: number; y: number; parent?: { x: number; y: number } };

function layoutTree(root: TreeNode | null) {
  const placed: Placed[] = [];
  let index = 0;
  let depth = 0;
  const go = (n: TreeNode | null, d: number, parent?: Placed) => {
    if (!n) return;
    const p: Placed = { node: n, x: 0, y: d, parent: parent ? { x: parent.x, y: parent.y } : undefined };
    go(n.left, d + 1, p);
    p.x = index++;
    depth = Math.max(depth, d);
    placed.push(p);
    go(n.right, d + 1, p);
  };
  // Two passes so children know their parent's final x.
  go(root, 0);
  const byKey = new Map(placed.map((p) => [p.node.key, p]));
  const fix = (n: TreeNode | null, parent?: Placed) => {
    if (!n) return;
    const p = byKey.get(n.key)!;
    p.parent = parent ? { x: parent.x, y: parent.y } : undefined;
    fix(n.left, p);
    fix(n.right, p);
  };
  fix(root);
  return { placed, count: index, levels: depth + 1 };
}

export function TreeView({ root, marks, emptyLabel = "The tree is empty." }: { root: TreeNode | null; marks: Marks; emptyLabel?: string }) {
  if (!root) return <p className="text-[14px] text-fg-subtle">{emptyLabel}</p>;
  const { placed, count, levels } = layoutTree(root);
  const W = Math.max(320, count * 52);
  const H = levels * 72 + 20;
  const px = (x: number) => ((x + 0.5) / count) * W;
  const py = (y: number) => 34 + y * 72;
  const R = 18;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" style={{ maxWidth: Math.min(W, 760), maxHeight: 440 }} role="img" aria-label="Tree">
      {placed.map(
        (p) =>
          p.parent && (
            <line
              key={`e-${p.node.key}`}
              x1={px(p.parent.x)}
              y1={py(p.parent.y)}
              x2={px(p.x)}
              y2={py(p.y)}
              className={cn("transition-[stroke] duration-300", marks[p.node.key] === "path" || marks[p.node.key] === "active" ? "stroke-accent-300/70" : "stroke-white/[0.18]")}
              strokeWidth={1.5}
            />
          ),
      )}
      {placed.map((p) => (
        <g key={p.node.key}>
          <circle cx={px(p.x)} cy={py(p.y)} r={R} className={cn("transition-[fill,stroke] duration-300", markSvg(marks[p.node.key]))} strokeWidth={1.75} />
          <text x={px(p.x)} y={py(p.y)} textAnchor="middle" dominantBaseline="central" className="fill-fg font-mono text-[13px]">
            {p.node.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------- hash table */

export function HashTableView({ table, marks }: { table: HashTableState; marks: Marks }) {
  return (
    <ol className="w-full max-w-[560px] space-y-1.5" aria-label="Hash table buckets">
      {table.buckets.map((chain, b) => (
        <li key={b} className="flex items-center gap-2">
          <span className={cn("flex h-10 w-12 shrink-0 items-center justify-center rounded-[8px] border font-mono text-[12px] transition-all duration-300", markClasses(marks[`b${b}`]))}>
            [{b}]
          </span>
          <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
            {chain.length === 0 ? (
              <li className="font-mono text-[11.5px] text-fg-subtle">empty</li>
            ) : (
              chain.map((e, i) => (
                <Fragment key={e.key}>
                  {i > 0 && (
                    <li aria-hidden className="text-fg-subtle">
                      <ArrowRight className="size-3.5" />
                    </li>
                  )}
                  <li className={cn("rounded-[8px] border px-2.5 py-1.5 font-mono text-[12.5px] transition-all duration-300", markClasses(marks[`${b}:${i}`]))}>
                    {e.key}
                    <span className="text-fg-subtle">: </span>
                    {e.value}
                  </li>
                </Fragment>
              ))
            )}
          </ol>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------------- graph */

export function GraphDSView({ graph, marks }: { graph: GraphState; marks: Marks }) {
  const n = graph.vertices.length;
  if (n === 0) return <p className="text-[14px] text-fg-subtle">The graph has no vertices. Add one to start.</p>;
  const pos = Object.fromEntries(
    graph.vertices.map((v, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [v, { x: 200 + (n === 1 ? 0 : 115 * Math.cos(a)), y: 145 + (n === 1 ? 0 : 115 * Math.sin(a)) }];
    }),
  );
  return (
    <svg viewBox="0 0 400 290" className="h-full max-h-[400px] w-full" role="img" aria-label={`Graph with ${n} vertices and ${graph.edges.length} edges`}>
      {graph.edges.map(([a, b]) => {
        const m = marks[edgeId(a, b)];
        return (
          <line
            key={edgeId(a, b)}
            x1={pos[a].x}
            y1={pos[a].y}
            x2={pos[b].x}
            y2={pos[b].y}
            strokeLinecap="round"
            strokeDasharray={m === "removed" ? "4 5" : undefined}
            className={cn(
              "transition-[stroke] duration-300",
              m === "active" || m === "new" ? "stroke-accent-200" : m === "removed" ? "stroke-[#ff9b9b]" : "stroke-white/[0.2]",
            )}
            strokeWidth={m ? 2.5 : 1.5}
          />
        );
      })}
      {graph.vertices.map((v) => (
        <g key={v}>
          <circle cx={pos[v].x} cy={pos[v].y} r={20} className={cn("transition-[fill,stroke] duration-300", markSvg(marks[v]))} strokeWidth={1.75} />
          <text x={pos[v].x} y={pos[v].y} textAnchor="middle" dominantBaseline="central" className="fill-fg text-[14px] font-semibold">
            {v}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AdjacencyList({ graph }: { graph: GraphState }) {
  return (
    <div>
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Adjacency list</h3>
      <dl className="mt-2.5 space-y-1 font-mono text-[12.5px]">
        {graph.vertices.map((v) => (
          <div key={v} className="flex gap-2">
            <dt className="w-4 text-accent-200">{v}</dt>
            <dd className="text-fg-muted">→ [{neighbours(graph, v).join(", ")}]</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
