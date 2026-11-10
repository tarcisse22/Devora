import { SEED_SQL } from "./seed";

/**
 * SQLite (sql.js, WebAssembly) running in a Web Worker. Queries can't touch
 * anything outside the in-memory database; a runaway query is stopped by
 * terminating the worker and rebuilding the sample database.
 */

export type ResultSet = { columns: string[]; values: (string | number | null | Uint8Array)[][] };
export type QueryOutcome =
  | { ok: true; results: ResultSet[]; rowsModified: number; durationMs: number }
  | { ok: false; error: string; reset?: boolean };

export type TableSchema = { name: string; rows: number; columns: { name: string; type: string; pk: boolean; notNull: boolean }[] };

const WORKER_URL = "/vendor/sql/worker.sql-wasm.js";
const TIMEOUT_MS = 5000;

type Reply = { id: number; results?: ResultSet[]; rowsModified?: number; ready?: boolean; error?: string };

export class SqlDatabase {
  private worker: Worker | null = null;
  private counter = 0;
  private pending = new Map<number, (r: Reply) => void>();

  private call(message: Record<string, unknown>): Promise<Reply> {
    if (!this.worker) throw new Error("Database not started");
    const id = ++this.counter;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.worker!.postMessage({ ...message, id });
    });
  }

  /** Start (or restart) the worker with a fresh copy of the sample data. */
  async reset(): Promise<void> {
    this.worker?.terminate();
    this.pending.clear();
    this.worker = new Worker(WORKER_URL);
    this.worker.onmessage = (e: MessageEvent<Reply>) => {
      const resolve = this.pending.get(e.data.id);
      if (resolve) {
        this.pending.delete(e.data.id);
        resolve(e.data);
      }
    };
    await this.call({ action: "open" });
    const seeded = await this.call({ action: "exec", sql: SEED_SQL });
    if (seeded.error) throw new Error(`Could not create the sample database: ${seeded.error}`);
  }

  async query(sql: string): Promise<QueryOutcome> {
    if (!this.worker) await this.reset();
    // total_changes() before and after gives the rows changed by *this* run,
    // across every statement in it (changes() alone would go stale after a SELECT).
    const before = await this.totalChanges();
    const started = performance.now();
    let timer = 0;
    const timeout = new Promise<"timeout">((resolve) => {
      timer = window.setTimeout(() => resolve("timeout"), TIMEOUT_MS);
    });
    const reply = await Promise.race([this.call({ action: "exec", sql }), timeout]);
    window.clearTimeout(timer);
    if (reply === "timeout") {
      await this.reset();
      return {
        ok: false,
        reset: true,
        error: `The query ran for more than ${TIMEOUT_MS / 1000}s and was stopped (for example, a recursive query that never ends). The database was reset to the sample data.`,
      };
    }
    if (reply.error) return { ok: false, error: reply.error };
    const durationMs = Math.round(performance.now() - started);
    const after = await this.totalChanges();
    return { ok: true, results: reply.results ?? [], rowsModified: after - before, durationMs };
  }

  private async totalChanges(): Promise<number> {
    const r = await this.call({ action: "exec", sql: "SELECT total_changes()" });
    return Number(r.results?.[0]?.values?.[0]?.[0] ?? 0);
  }

  async schema(): Promise<TableSchema[]> {
    const tables = await this.call({
      action: "exec",
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    });
    const names = (tables.results?.[0]?.values ?? []).map((r) => String(r[0]));
    const out: TableSchema[] = [];
    for (const name of names) {
      const quoted = `"${name.replaceAll('"', '""')}"`;
      const info = await this.call({ action: "exec", sql: `PRAGMA table_info(${quoted}); SELECT COUNT(*) FROM ${quoted};` });
      const [cols, count] = info.results ?? [];
      out.push({
        name,
        rows: Number(count?.values?.[0]?.[0] ?? 0),
        columns: (cols?.values ?? []).map((c) => ({ name: String(c[1]), type: String(c[2] || "ANY"), notNull: c[3] === 1, pk: Number(c[5]) > 0 })),
      });
    }
    return out;
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
  }
}
