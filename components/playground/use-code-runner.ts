"use client";

import { useCallback, useRef, useState } from "react";
import { getSandbox, type OutputStream, type RunLanguage, type RunResult } from "@/lib/execution/sandbox";

export type OutputLine = { id: number; stream: OutputStream; text: string };
export type RunStatus = "idle" | "loading" | "running" | "success" | "error";

let lineId = 0;

/** Runs code in the shared sandbox and collects its output for display. */
export function useCodeRunner() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [statusText, setStatusText] = useState<string | null>(null);
  const current = useRef<string | null>(null);

  const append = useCallback((stream: OutputStream, text: string) => {
    setOutput((prev) => [...prev, { id: ++lineId, stream, text }]);
  }, []);

  const run = useCallback(
    async (opts: { language: RunLanguage; code: string; timeoutMs: number; mode?: "run" | "trace" }): Promise<RunResult> => {
      setOutput([]);
      setStatus("running");
      setStatusText(null);
      try {
        const { id, result } = await getSandbox().run({
          ...opts,
          onOutput: append,
          onStatus: (text) => {
            setStatus("loading");
            setStatusText(text);
          },
        });
        current.current = id;
        const res = await result;
        current.current = null;
        if (res.error) append("system", res.error);
        setStatus(res.ok ? "success" : "error");
        setStatusText(res.durationMs !== undefined ? `${res.ok ? "Finished" : "Exited with an error"} in ${res.durationMs} ms` : null);
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        append("system", message);
        setStatus("error");
        setStatusText(null);
        return { ok: false, error: message };
      }
    },
    [append],
  );

  const stop = useCallback(() => {
    if (current.current) getSandbox().stop(current.current);
  }, []);

  const clear = useCallback(() => {
    setOutput([]);
    setStatusText(null);
    setStatus((s) => (s === "running" || s === "loading" ? s : "idle"));
  }, []);

  /** Show an error without running anything (e.g. a TypeScript syntax error). */
  const fail = useCallback((message: string) => {
    setOutput([{ id: ++lineId, stream: "stderr", text: message }]);
    setStatus("error");
    setStatusText(null);
  }, []);

  return { status, statusText, output, run, stop, clear, fail, busy: status === "running" || status === "loading" };
}
