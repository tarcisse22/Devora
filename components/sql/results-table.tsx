import type { ResultSet } from "@/lib/sql/client";
import { cn } from "@/lib/utils";

const MAX_ROWS = 500;

function Cell({ value }: { value: ResultSet["values"][number][number] }) {
  if (value === null) return <span className="italic text-fg-subtle">NULL</span>;
  if (value instanceof Uint8Array) return <span className="text-fg-subtle">BLOB ({value.length} bytes)</span>;
  return <>{String(value)}</>;
}

export function ResultsTable({ result, label }: { result: ResultSet; label?: string }) {
  const rows = result.values.slice(0, MAX_ROWS);
  const numeric = result.columns.map((_, c) => result.values.length > 0 && result.values.every((r) => r[c] === null || typeof r[c] === "number"));

  return (
    <figure className="min-w-0">
      {label && <figcaption className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{label}</figcaption>}
      <div className="max-h-[380px] overflow-auto rounded-[var(--radius-md)] border border-line">
        <table className="w-full border-collapse font-mono text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            <tr>
              {result.columns.map((col, c) => (
                <th
                  key={`${col}-${c}`}
                  scope="col"
                  className={cn("whitespace-nowrap border-b border-line px-3 py-2 font-medium text-accent-200", numeric[c] ? "text-right" : "text-left")}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-line/60 last:border-b-0 odd:bg-white/[0.015] hover:bg-white/[0.04]">
                {row.map((v, c) => (
                  <td key={c} className={cn("whitespace-nowrap px-3 py-1.5 text-fg/90", numeric[c] && "text-right tabular-nums")}>
                    <Cell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[12px] text-fg-subtle">
        {result.values.length} row{result.values.length === 1 ? "" : "s"}
        {result.values.length > MAX_ROWS && ` (showing the first ${MAX_ROWS})`}
      </p>
    </figure>
  );
}
