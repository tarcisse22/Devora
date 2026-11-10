"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import { quickSort, type SortFrame } from "@/lib/algorithms/sorting";
import { binarySearch, type SearchFrame } from "@/lib/algorithms/searching";
import { dijkstra, randomGraph, type GraphFrame } from "@/lib/algorithms/graphs";
import { pickTarget, sortedUnique } from "@/lib/algorithms/inputs";
import { randomArray } from "@/lib/algorithms/random";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { SortBars } from "@/components/visualizers/sort-bars";
import { SearchCells } from "@/components/visualizers/search-cells";
import { GraphView } from "@/components/visualizers/graph-view";

const demos = [
  { id: "sorting", label: "Sorting", name: "Quick Sort", slug: "quick-sort", stepMs: 260 },
  { id: "searching", label: "Searching", name: "Binary Search", slug: "binary-search", stepMs: 1000 },
  { id: "graph", label: "Graphs", name: "Dijkstra’s Shortest Path", slug: "dijkstra", stepMs: 750 },
] as const;
type DemoId = (typeof demos)[number]["id"];

/** Pause on the final frame before looping with a fresh input. */
const END_PAUSE_MS = 2400;

/**
 * Homepage showcase: real algorithm runs on random inputs, playing on a loop
 * while visible. Respects reduced-motion (no autoplay) and can be paused.
 */
export function LiveDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<DemoId>("sorting");
  const [seed, setSeed] = useState(31);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const demo = demos.find((d) => d.id === tab)!;

  const data = useMemo(() => {
    if (tab === "sorting") return { kind: "sorting" as const, frames: quickSort(randomArray(14, seed)) };
    if (tab === "searching") {
      const arr = sortedUnique(12, seed);
      return { kind: "searching" as const, frames: binarySearch(arr, pickTarget(arr, seed)) };
    }
    const graph = randomGraph(8, seed, true);
    return { kind: "graph" as const, graph, frames: dijkstra(graph, graph.nodes[0].id) };
  }, [tab, seed]);

  const last = data.frames.length - 1;
  const frame = data.frames[Math.min(index, last)];
  const running = inView && !paused && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const atEnd = index >= last;
    const timer = window.setTimeout(
      () => {
        if (atEnd) {
          setSeed((s) => s + 1);
          setIndex(0);
        } else {
          setIndex((i) => i + 1);
        }
      },
      atEnd ? END_PAUSE_MS : demo.stepMs,
    );
    return () => window.clearTimeout(timer);
  }, [running, index, last, demo.stepMs]);

  const selectTab = (id: DemoId) => {
    setTab(id);
    setIndex(0);
  };

  return (
    <section id="live-demo" aria-labelledby="live-demo-heading" className="relative pb-20 pt-6 sm:pb-28 sm:pt-10">
      <Container>
        <FadeIn inView className="mx-auto max-w-[680px] text-center">
          <p className="text-[13px] font-medium text-accent-300">See it in action</p>
          <h2
            id="live-demo-heading"
            className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg"
          >
            Algorithms, running live
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fg-muted sm:text-[17px]">
            Not a recording — each animation below is a real run of the algorithm on a fresh random input, step by step.
          </p>
        </FadeIn>

        <FadeIn inView delay={0.1} className="mx-auto mt-12 max-w-[1040px]">
          <div
            ref={ref}
            className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-50px_rgb(108_79_209/0.6)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2.5 sm:px-4">
              <div role="tablist" aria-label="Demo" className="flex gap-1">
                {demos.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === d.id}
                    aria-controls="live-demo-panel"
                    onClick={() => selectTab(d.id)}
                    className={cn(
                      "h-9 rounded-[var(--radius-md)] px-3.5 text-[13.5px] font-medium transition-colors",
                      tab === d.id ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:bg-white/[0.04] hover:text-fg",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-[12px] tabular-nums text-fg-subtle sm:inline">
                  {Math.min(index, last) + 1} / {last + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused || reduceMotion ? "Play demo" : "Pause demo"}
                  className="flex size-9 items-center justify-center rounded-full border border-line-strong text-fg-muted transition-colors hover:border-white/25 hover:text-fg"
                >
                  {running ? <Pause className="size-4" aria-hidden /> : <Play className="ml-0.5 size-4" aria-hidden />}
                </button>
              </div>
            </div>

            <div id="live-demo-panel" role="tabpanel" aria-label={demo.name} className="p-4 sm:p-6">
              <div className="h-[260px] sm:h-[340px]">
                {data.kind === "sorting" && <SortBars frame={frame as SortFrame} />}
                {data.kind === "searching" && <SearchCells frame={frame as SearchFrame} />}
                {data.kind === "graph" && (
                  <GraphView graph={data.graph} frame={frame as GraphFrame} weighted start={data.graph.nodes[0].id} />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="min-h-[42px] text-[13.5px] leading-relaxed text-fg-muted sm:min-h-0" aria-live="off">
                <span className="font-medium text-fg">{demo.name}</span> — {frame.message}
              </p>
              <Link
                href={`/visualize/algorithms/${demo.slug}`}
                className="group inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-accent-200 transition-colors hover:text-accent-100"
              >
                Open in the visualizer
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
