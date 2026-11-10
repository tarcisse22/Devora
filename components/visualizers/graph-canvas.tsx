import { useId } from "react";
import {
  edgeKey,
  formatDistance,
  type DijkstraStep,
  type NodeId,
  type WeightedGraph,
} from "@/lib/algorithms/dijkstra";
import { cn } from "@/lib/utils";

const NODE_R = 21;

type Props = {
  graph: WeightedGraph;
  step: DijkstraStep;
  source: NodeId;
  className?: string;
};

/**
 * Renders a weighted graph and colours it according to a Dijkstra step:
 * finalized nodes, the node being visited, shortest-path tree edges and the
 * edges relaxed in this step.
 */
export function GraphCanvas({ graph, step, source, className }: Props) {
  const id = useId();
  const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const visited = new Set(step.visited);

  const treeEdges = new Set(
    Object.entries(step.previous)
      .filter(([, prev]) => prev !== null)
      .map(([node, prev]) => edgeKey(node, prev!)),
  );
  const relaxed = new Map(step.relaxations.map((r) => [edgeKey(r.from, r.to), r]));

  return (
    <svg
      viewBox="0 0 400 260"
      className={cn("h-auto w-full overflow-visible", className)}
      role="img"
      aria-label={`Weighted graph. ${step.title}: ${step.description}`}
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#9d86f7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9d86f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-node`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1d2b" />
          <stop offset="100%" stopColor="#13121b" />
        </linearGradient>
      </defs>

      {/* Edges */}
      {graph.edges.map((edge) => {
        const a = pos[edge.from];
        const b = pos[edge.to];
        const key = edgeKey(edge.from, edge.to);
        const inTree = treeEdges.has(key);
        const relaxation = relaxed.get(key);

        // Weight label sits slightly off the edge, on its normal.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const nx = -(b.y - a.y) / len;
        const ny = (b.x - a.x) / len;
        const lx = mx + nx * 13;
        const ly = my + ny * 13;

        return (
          <g key={key}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeLinecap="round"
              className={cn(
                "transition-[stroke,stroke-width] duration-500",
                inTree ? "stroke-accent-300/80" : "stroke-white/[0.14]",
              )}
              strokeWidth={inTree ? 2 : 1.25}
            />
            {relaxation && (
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeLinecap="round"
                strokeDasharray="4 6"
                className={cn(
                  "animate-[dash_1.2s_linear_infinite]",
                  relaxation.improved ? "stroke-accent-100" : "stroke-white/30",
                )}
                strokeWidth={2}
              />
            )}
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "font-mono text-[12px] transition-[fill] duration-500",
                relaxation?.improved ? "fill-accent-100" : inTree ? "fill-accent-200" : "fill-fg-subtle",
              )}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {graph.nodes.map((node) => {
        const isCurrent = step.current === node.id;
        const isVisited = visited.has(node.id);
        const isSource = node.id === source;
        const distance = step.distances[node.id];
        const emphasized = isCurrent || (isSource && step.current === null);
        // Place the distance badge on the side away from the graph centre.
        const below = node.y > 130;

        return (
          <g key={node.id}>
            {emphasized && (
              <>
                <circle cx={node.x} cy={node.y} r={NODE_R * 2.3} fill={`url(#${id}-glow)`} />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                  className="origin-center animate-pulse-ring fill-none stroke-accent-300"
                  style={{ transformBox: "fill-box" }}
                  strokeWidth={1.5}
                />
              </>
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill={emphasized ? "#2a2150" : isVisited ? "#1e1934" : `url(#${id}-node)`}
              className={cn(
                "transition-[stroke,fill] duration-500",
                emphasized ? "stroke-accent-300" : isVisited ? "stroke-accent-300/70" : "stroke-white/25",
              )}
              strokeWidth={emphasized ? 2 : 1.25}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "text-[16px] font-semibold transition-[fill] duration-500",
                emphasized || isVisited ? "fill-fg" : "fill-fg/80",
              )}
            >
              {node.id}
            </text>
            <text
              x={node.x}
              y={below ? node.y + NODE_R + 14 : node.y - NODE_R - 10}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "font-mono text-[12px] transition-[fill] duration-500",
                isVisited ? "fill-accent-200" : Number.isFinite(distance) ? "fill-fg-muted" : "fill-fg-subtle/70",
              )}
            >
              {formatDistance(distance)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
