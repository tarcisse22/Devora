"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, Plus, Waypoints, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sampleGraph, traceDijkstra } from "@/lib/algorithms/dijkstra";
import { cn } from "@/lib/utils";
import { GraphCanvas } from "./graph-canvas";
import { StepControls } from "./step-controls";
import { CodeTrace } from "./code-trace";

const SOURCE = "A";

/**
 * Hero preview of the algorithm visualizer. The steps come from a real
 * Dijkstra trace over `sampleGraph`, so the controls genuinely step through
 * the algorithm.
 */
export function DijkstraPreview({ className }: { className?: string }) {
  const steps = useMemo(() => traceDijkstra(sampleGraph, SOURCE), []);
  const [index, setIndex] = useState(0);
  const step = steps[index];

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(steps.length - 1, i + 1)), [steps.length]);

  return (
    <div
      className={cn(
        "relative rounded-[22px] border border-white/[0.12] bg-surface/60 p-2 shadow-[0_40px_120px_-40px_rgb(108_79_209/0.55),0_0_0_1px_rgb(255_255_255/0.03)_inset] backdrop-blur-xl",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      {/* Top edge highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-accent-200/60 to-transparent"
      />

      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 pt-1.5 pb-2.5">
        <Waypoints className="size-4 text-fg-subtle" strokeWidth={1.75} aria-hidden />
        <div className="ml-1.5 flex items-center gap-3 rounded-t-[10px] border border-b-0 border-line bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-fg">
          Algorithm Visualizer
          <X className="size-3.5 text-fg-subtle" aria-hidden />
        </div>
        <Plus className="ml-1 size-4 text-fg-subtle" aria-hidden />
      </div>

      <div className="grid overflow-hidden rounded-[16px] border border-line bg-canvas/80 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Graph area */}
        <div className="relative flex flex-col p-4 sm:p-5">
          <div
            className="flex h-10 w-full max-w-[240px] items-center justify-between rounded-[var(--radius-md)] border border-line bg-white/[0.03] px-3.5 text-[13px] text-fg/90"
            aria-label="Selected algorithm"
          >
            Dijkstra&apos;s Algorithm
            <ChevronDown className="size-4 text-fg-subtle" aria-hidden />
          </div>

          <div className="relative mt-2 flex flex-1 flex-col justify-center">
            {/* Faint dot grid behind the graph */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
            />
            <GraphCanvas graph={sampleGraph} step={step} source={SOURCE} className="relative block py-4" />
          </div>

          <Legend />
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-5 border-t border-line bg-white/[0.02] p-5 md:border-t-0 md:border-l">
          <div>
            <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-fg">Dijkstra&apos;s Algorithm</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              Finds the shortest path from a source node to all other nodes in a weighted graph.
            </p>
          </div>

          <StepControls index={index} total={steps.length} onPrev={prev} onNext={next} />

          <div className="min-h-[60px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">{step.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{step.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto">
            <CodeTrace lines={step.code} stepKey={index} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Current", swatch: "bg-accent-300 shadow-[0_0_8px_rgb(183_166_255/0.8)]" },
    { label: "Finalized", swatch: "border border-accent-400/70 bg-transparent" },
    { label: "Shortest path", swatch: "h-0.5 w-3 rounded-full bg-accent-300/80" },
  ];
  return (
    <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-fg-subtle">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("inline-block size-2 rounded-full", item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
