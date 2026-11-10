"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Database, KeyRound, LoaderCircle, Play, RotateCcw, Table2 } from "lucide-react";
import { SqlDatabase, type QueryOutcome, type TableSchema } from "@/lib/sql/client";
import { sqlExamples } from "@/lib/sql/examples";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ResultsTable } from "./results-table";

type Status = "starting" | "ready" | "running" | "error";

const topics = [...new Set(sqlExamples.map((e) => e.topic))];

export function SqlLab({ initialSql }: { initialSql?: string } = {}) {
  const db = useRef<SqlDatabase | null>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [sql, setSql] = useState(initialSql ?? sqlExamples[0].sql);
  const [outcome, setOutcome] = useState<QueryOutcome | null>(null);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [openTable, setOpenTable] = useState<string | null>("students");
  const [notice, setNotice] = useState<string | null>(null);

  const refreshSchema = useCallback(async () => {
    if (db.current) setSchema(await db.current.schema());
  }, []);

  useEffect(() => {
    const instance = new SqlDatabase();
    db.current = instance;
    instance
      .reset()
      .then(() => instance.schema())
      .then((s) => {
        setSchema(s);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setOutcome({ ok: false, error: err instanceof Error ? err.message : String(err) });
      });
    return () => instance.dispose();
  }, []);

  const run = useCallback(
    async (query = sql) => {
      if (!db.current || status === "running" || status === "starting") return;
      if (!query.trim()) return;
      setStatus("running");
      setNotice(null);
      const result = await db.current.query(query);
      setOutcome(result);
      setStatus("ready");
      await refreshSchema();
    },
    [sql, status, refreshSchema],
  );

  const resetDb = async () => {
    if (!db.current) return;
    setStatus("starting");
    await db.current.reset();
    await refreshSchema();
    setOutcome(null);
    setNotice("The database was reset to the original sample data.");
    setStatus("ready");
  };

  const loadExample = (id: string) => {
    const ex = sqlExamples.find((e) => e.id === id);
    if (!ex) return;
    setSql(ex.sql);
    setNotice(`Loaded “${ex.title}”. Press Run to execute it.`);
  };

  const preview = (table: string) => {
    const q = `SELECT * FROM ${table} LIMIT 50;`;
    setSql(q);
    void run(q);
  };

  const busy = status === "running" || status === "starting";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Editor + results */}
      <div className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)]">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2.5 sm:px-4">
          <span className="flex items-center gap-2 text-[13px] text-fg-muted" aria-live="polite">
            {status === "starting" ? (
              <>
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Starting SQLite…
              </>
            ) : status === "error" ? (
              <>
                <AlertCircle className="size-3.5 text-[#ff9b9b]" aria-hidden /> SQLite failed to start
              </>
            ) : (
              <>
                <Database className="size-3.5 text-accent-300" aria-hidden /> SQLite · in-memory sample database
              </>
            )}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetDb} disabled={busy} title="Discard your changes and restore the sample data">
              <RotateCcw className="size-3.5" aria-hidden />
              Reset database
            </Button>
            <Button size="sm" onClick={() => run()} disabled={busy} className="min-w-[92px]" title="Run (Ctrl/⌘ + Enter)">
              {status === "running" ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Play className="size-3.5 fill-current" aria-hidden />}
              Run
            </Button>
          </div>
        </div>

        <div className="h-[240px] border-b border-line sm:h-[280px]">
          <CodeEditor value={sql} onChange={setSql} language="sql" onRun={() => run()} ariaLabel="SQL editor" />
        </div>

        <section aria-label="Query results" className="min-h-[220px] p-4 sm:p-5" aria-live="polite">
          {notice && <p className="mb-4 text-[13px] text-fg-muted">{notice}</p>}
          {!outcome ? (
            <p className="text-[13.5px] text-fg-subtle">
              Results appear here. Press <Kbd>Ctrl</Kbd> <Kbd>Enter</Kbd> or Run.
            </p>
          ) : !outcome.ok ? (
            <div className="flex gap-2.5 rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-4 py-3 text-[13.5px] text-[#ffc2c2]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p className="font-mono text-[12.5px] leading-relaxed">{outcome.error}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="flex items-center gap-2 text-[12.5px] text-fg-muted">
                <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                {outcome.rowsModified > 0 && `${outcome.rowsModified} row${outcome.rowsModified === 1 ? "" : "s"} modified · `}
                {outcome.results.length === 0 && outcome.rowsModified === 0 ? "Statement executed — no rows returned · " : ""}
                {outcome.durationMs} ms
              </p>
              {outcome.results.map((r, i) => (
                <ResultsTable key={i} result={r} label={outcome.results.length > 1 ? `Result ${i + 1} of ${outcome.results.length}` : undefined} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="flex min-w-0 flex-col gap-4">
        <section aria-labelledby="schema-heading" className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-4">
          <h2 id="schema-heading" className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
            Schema
          </h2>
          <ul className="mt-3 space-y-1">
            {schema.map((t) => {
              const open = openTable === t.name;
              return (
                <li key={t.name}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOpenTable(open ? null : t.name)}
                      aria-expanded={open}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[13.5px] text-fg transition-colors hover:bg-white/[0.04]"
                    >
                      <ChevronRight className={cn("size-3.5 shrink-0 text-fg-subtle transition-transform", open && "rotate-90")} aria-hidden />
                      <Table2 className="size-3.5 shrink-0 text-accent-300" aria-hidden />
                      <span className="truncate font-mono">{t.name}</span>
                      <span className="ml-auto font-mono text-[11px] text-fg-subtle">{t.rows}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => preview(t.name)}
                      disabled={busy}
                      className="rounded-[6px] px-2 py-1 text-[11.5px] text-fg-muted transition-colors hover:bg-white/[0.05] hover:text-fg disabled:opacity-40"
                      title={`SELECT * FROM ${t.name}`}
                    >
                      Preview
                    </button>
                  </div>
                  {open && (
                    <ul className="mb-2 ml-[30px] mt-1 space-y-0.5 border-l border-line pl-3">
                      {t.columns.map((c) => (
                        <li key={c.name} className="flex items-center gap-2 font-mono text-[12px]">
                          <span className={cn("text-fg/85", c.pk && "text-accent-100")}>{c.name}</span>
                          {c.pk && <KeyRound className="size-3 text-warning" aria-label="primary key" />}
                          <span className="ml-auto text-[11px] text-fg-subtle">
                            {c.type.toLowerCase()}
                            {c.notNull && !c.pk ? " · not null" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="examples-heading" className="rounded-[var(--radius-xl)] border border-line bg-surface/50 p-4">
          <h2 id="examples-heading" className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
            Example queries
          </h2>
          <div className="mt-3 space-y-3">
            {topics.map((topic) => (
              <div key={topic}>
                <h3 className="px-2 font-mono text-[11px] text-accent-300">{topic}</h3>
                <ul className="mt-1">
                  {sqlExamples
                    .filter((e) => e.topic === topic)
                    .map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => loadExample(e.id)}
                          className={cn(
                            "w-full rounded-[8px] px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-white/[0.04]",
                            sql === e.sql ? "text-fg" : "text-fg-muted",
                          )}
                        >
                          {e.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
