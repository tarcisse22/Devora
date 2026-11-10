import { useId } from "react";
import { edgeKey, type WeightedGraph } from "@/lib/algorithms/dijkstra";
import type { GraphFrame } from "@/lib/algorithms/graphs";
import { cn } from "@/lib/utils";

const R = 19;

export const graphLegend = [
  { label: "Current", className: "bg-accent-300 shadow-[0_0_8px_rgb(183_166_255/0.8)]" },
  { label: "Discovered", className: "border border-warning bg-warning/20" },
  { label: "Finished", className: "border border-accent-300/70 bg-accent-700/40" },
  { label: "Tree edge", className: "h-0.5 w-3 rounded-full bg-accent-300" },
];

/** Generic graph renderer driven by a recorded GraphFrame. */
export function GraphView({ graph, frame, weighted, start }: { graph: WeightedGraph; frame: GraphFrame; weighted: boolean; start: string }) {
  const id = useId();
  const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 400 270" className="h-full max-h-[420px] w-full" role="img" aria-label={`Graph. ${frame.message}`}>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#9d86f7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9d86f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {graph.edges.map((e) => {
        const a = pos[e.from];
        const b = pos[e.to];
        const state = frame.edges[edgeKey(e.from, e.to)];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const lx = mx + (-(b.y - a.y) / len) * 11;
        const ly = my + ((b.x - a.x) / len) * 11;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeLinecap="round"
              strokeDasharray={state === "active" || state === "rejected" ? "4 5" : undefined}
              className={cn(
                "transition-[stroke] duration-300",
                state === "tree" && "stroke-accent-300",
                state === "active" && "animate-[dash_1.2s_linear_infinite] stroke-accent-100",
                state === "rejected" && "stroke-[#ff9b9b]/70",
                !state && "stroke-white/[0.16]",
              )}
              strokeWidth={state ? 2.25 : 1.25}
            />
            {weighted && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" stroke="#0e0d14" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round" className={cn("font-mono text-[11px]", state === "tree" || state === "active" ? "fill-accent-100" : "fill-fg-subtle")}>
                {e.weight}
              </text>
            )}
          </g>
        );
      })}

      {graph.nodes.map((n) => {
        const state = frame.nodes[n.id];
        return (
          <g key={n.id}>
            {state === "current" && <circle cx={n.x} cy={n.y} r={R * 2.2} fill={`url(#${id}-glow)`} />}
            <circle
              cx={n.x}
              cy={n.y}
              r={R}
              className={cn(
                "transition-[fill,stroke] duration-300",
                state === "current" && "fill-[#2a2150] stroke-accent-200",
                state === "frontier" && "fill-warning/15 stroke-warning",
                state === "visited" && "fill-[#1e1934] stroke-accent-300/70",
                state === "unvisited" && "fill-[#16151f] stroke-white/25",
              )}
              strokeWidth={state === "current" ? 2.25 : 1.5}
            />
            {n.id === start && <circle cx={n.x} cy={n.y} r={R + 4} className="fill-none stroke-accent-300/40" strokeDasharray="2 3" />}
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" className="fill-fg text-[14px] font-semibold">
              {n.id}
            </text>
            {frame.labels[n.id] !== undefined && (
              <text
                x={n.x}
                y={n.y + R + 11}
                textAnchor="middle"
                dominantBaseline="central"
                stroke="#0e0d14"
                strokeWidth={4}
                paintOrder="stroke"
                strokeLinejoin="round"
                className={cn("font-mono text-[10.5px]", state === "unvisited" ? "fill-fg-subtle" : "fill-accent-200")}
              >
                {frame.labels[n.id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
