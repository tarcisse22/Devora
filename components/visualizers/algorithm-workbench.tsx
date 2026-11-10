"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { algorithmBySlug } from "@/lib/algorithms/catalog";
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort, type SortFrame } from "@/lib/algorithms/sorting";
import { binarySearch, linearSearch, type SearchFrame } from "@/lib/algorithms/searching";
import { bfs, dfs, dijkstra, randomGraph, type GraphFrame } from "@/lib/algorithms/graphs";
import { createRng, randomArray, randomSeed } from "@/lib/algorithms/random";
import type { WeightedGraph } from "@/lib/algorithms/dijkstra";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PlayerControls } from "./player-controls";
import { PseudocodePanel } from "./pseudocode-panel";
import { SortBars, sortLegend } from "./sort-bars";
import { SearchCells, searchLegend } from "./search-cells";
import { GraphView, graphLegend } from "./graph-view";
import { useStepPlayer } from "./use-step-player";

const sorters = {
  "bubble-sort": bubbleSort,
  "selection-sort": selectionSort,
  "insertion-sort": insertionSort,
  "merge-sort": mergeSort,
  "quick-sort": quickSort,
} as const;

const graphAlgos = { bfs, dfs, dijkstra } as const;

const sizeRange = { sorting: [5, 40, 16], searching: [5, 24, 12], graph: [5, 12, 8] } as const;

/** Distinct sorted values for binary search. */
function sortedUnique(n: number, seed: number) {
  const rng = createRng(seed);
  const values = new Set<number>();
  while (values.size < n) values.add(rng.int(1, 99));
  return [...values].sort((a, b) => a - b);
}

/** Pick a target: usually present in the array, sometimes absent. */
function pickTarget(array: number[], seed: number) {
  const rng = createRng(seed ^ 0x5bd1e995);
  if (rng.next() < 0.75) return rng.pick(array);
  let t = rng.int(1, 99);
  while (array.includes(t)) t = rng.int(1, 99);
  return t;
}

type Visual =
  | { kind: "sorting"; frames: SortFrame[] }
  | { kind: "searching"; frames: SearchFrame[] }
  | { kind: "graph"; frames: GraphFrame[]; graph: WeightedGraph };

export function AlgorithmWorkbench({ slug }: { slug: string }) {
  const info = algorithmBySlug(slug)!;
  const [min, max, defaultSize] = sizeRange[info.category];
  // A fixed initial seed keeps server and client renders identical.
  const [seed, setSeed] = useState(20260);
  const [size, setSize] = useState<number>(defaultSize);
  const [targetOverride, setTargetOverride] = useState<number | null>(null);
  const [startOverride, setStartOverride] = useState<string | null>(null);

  const searchArray = useMemo(
    () => (info.category !== "searching" ? [] : slug === "binary-search" ? sortedUnique(size, seed) : randomArray(size, seed)),
    [info.category, slug, size, seed],
  );
  const target = targetOverride ?? pickTarget(searchArray.length ? searchArray : [0], seed);
  const graph = useMemo(
    () => (info.category === "graph" ? randomGraph(size, seed, slug === "dijkstra") : null),
    [info.category, size, seed, slug],
  );
  const start = graph && startOverride && graph.nodes.some((n) => n.id === startOverride) ? startOverride : graph?.nodes[0].id ?? "A";

  const visual: Visual = useMemo(() => {
    if (info.category === "sorting") {
      return { kind: "sorting", frames: sorters[slug as keyof typeof sorters](randomArray(size, seed)) };
    }
    if (info.category === "searching") {
      const fn = slug === "binary-search" ? binarySearch : linearSearch;
      return { kind: "searching", frames: fn(searchArray, target) };
    }
    return { kind: "graph", graph: graph!, frames: graphAlgos[slug as keyof typeof graphAlgos](graph!, start) };
  }, [info.category, slug, size, seed, searchArray, target, graph, start]);

  const player = useStepPlayer(visual.frames.length, visual.frames);
  const frame = visual.frames[Math.min(player.index, visual.frames.length - 1)];

  const randomize = () => {
    setSeed(randomSeed());
    setTargetOverride(null);
    setStartOverride(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
    if (e.key === " " && tag !== "BUTTON") {
      e.preventDefault();
      player.toggle();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      player.next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      player.prev();
    }
  };

  const legend = visual.kind === "sorting" ? sortLegend : visual.kind === "searching" ? searchLegend : graphLegend;

  return (
    // Focusable so clicking anywhere in the panel enables the keyboard shortcuts.
    <div
      role="group"
      aria-label={`${info.name} visualizer`}
      aria-keyshortcuts="Space ArrowLeft ArrowRight"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)] outline-none"
    >
      {/* Input controls */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-4 py-3">
        <label className="flex items-center gap-3 text-[13px] text-fg-muted">
          {info.category === "graph" ? "Nodes" : "Size"}
          <input
            type="range"
            min={min}
            max={max}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setTargetOverride(null);
            }}
            className="w-28 cursor-pointer accent-accent-300 sm:w-36"
          />
          <span className="w-6 font-mono tabular-nums text-fg">{size}</span>
        </label>

        {visual.kind === "searching" && (
          <label className="flex items-center gap-2 text-[13px] text-fg-muted">
            Target
            <input
              type="number"
              min={0}
              max={999}
              value={target}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setTargetOverride(Math.max(0, Math.min(999, Math.round(v))));
              }}
              className="h-9 w-20 rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-2.5 font-mono text-[13px] text-fg focus-visible:outline-2 focus-visible:outline-accent-300"
            />
          </label>
        )}

        {visual.kind === "graph" && (
          <label className="flex items-center gap-2 text-[13px] text-fg-muted">
            Start
            <Select value={start} onChange={(e) => setStartOverride(e.target.value)} className="w-[72px]">
              {visual.graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id}
                </option>
              ))}
            </Select>
          </label>
        )}

        <Button variant="secondary" size="sm" onClick={randomize} className="ml-auto">
          <Shuffle className="size-3.5" aria-hidden />
          Randomize
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Canvas */}
        <div className="flex min-w-0 flex-col border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="h-[280px] sm:h-[360px]">
            {visual.kind === "sorting" && <SortBars frame={frame as SortFrame} />}
            {visual.kind === "searching" && <SearchCells frame={frame as SearchFrame} />}
            {visual.kind === "graph" && <GraphView graph={visual.graph} frame={frame as GraphFrame} weighted={slug === "dijkstra"} start={start} />}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-fg-subtle">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("inline-block size-2.5 rounded-[3px]", l.className)} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Side panel */}
        <div className="flex min-w-0 flex-col gap-5 p-4 sm:p-5">
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">Step {player.index + 1}</h3>
            <p className="mt-2 min-h-[66px] text-[14px] leading-relaxed text-fg/90" aria-live="polite">
              {frame.message}
            </p>
          </div>

          <Counters>
            {visual.kind === "sorting" && (
              <>
                <Counter label="Comparisons" value={(frame as SortFrame).comparisons} />
                <Counter label="Writes" value={(frame as SortFrame).writes} />
              </>
            )}
            {visual.kind === "searching" && (
              <>
                <Counter label="Comparisons" value={(frame as SearchFrame).comparisons} />
                <Counter label="Array size" value={(frame as SearchFrame).array.length} />
              </>
            )}
            {visual.kind === "graph" && (
              <>
                <Counter label="Visited" value={`${(frame as GraphFrame).order.length} / ${visual.graph.nodes.length}`} />
                <Counter label="Edges" value={visual.graph.edges.length} />
              </>
            )}
          </Counters>

          {visual.kind === "graph" && <StructureView frame={frame as GraphFrame} />}

          <PseudocodePanel lines={info.pseudocode} active={frame.line} />
        </div>
      </div>

      <div className="border-t border-line px-4 py-3.5">
        <PlayerControls player={player} />
      </div>
    </div>
  );
}

function Counters({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-3">{children}</dl>;
}

function Counter({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-white/[0.02] px-3 py-2.5">
      <dt className="text-[11.5px] text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 font-mono text-[16px] tabular-nums text-fg">{value}</dd>
    </div>
  );
}

function StructureView({ frame }: { frame: GraphFrame }) {
  const { name, items } = frame.structure;
  return (
    <div>
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
        {name}
        {name === "Call stack" && <span className="ml-1 normal-case tracking-normal">(top first)</span>}
      </h3>
      <ol className="mt-2.5 flex min-h-9 flex-wrap gap-1.5">
        {items.length === 0 ? (
          <li className="text-[13px] text-fg-subtle">empty</li>
        ) : (
          items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className={cn(
                "rounded-[6px] border px-2 py-1 font-mono text-[12px]",
                i === 0 ? "border-accent-300/50 bg-accent-300/10 text-accent-100" : "border-line-strong text-fg/80",
              )}
            >
              {item}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
