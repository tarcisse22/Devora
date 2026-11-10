"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DSFrame, OpResult } from "@/lib/data-structures/types";

export type LogEntry = { id: number; op: string; text: string; error: boolean };

export const OP_SPEEDS = { Slow: 900, Normal: 520, Fast: 220 } as const;
export type OpSpeed = keyof typeof OP_SPEEDS;

let logId = 0;

/**
 * Applies data-structure operations: animates each operation's recorded
 * frames, then commits its final state and logs what happened.
 */
export function useOpRunner<S>(initial: S, initialMessage: string) {
  const [state, setState] = useState(initial);
  const [view, setView] = useState<DSFrame<S>>({ state: initial, marks: {}, message: initialMessage });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [speed, setSpeed] = useState<OpSpeed>("Normal");
  const timers = useRef<number[]>([]);

  const cancel = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => cancel, []);

  const run = useCallback(
    (op: string, result: OpResult<S>) => {
      if (busy) return;
      const frames = result.frames;
      const finish = () => {
        const last = frames.at(-1)!;
        setState(last.state);
        setBusy(false);
        setLog((prev) => [{ id: ++logId, op, text: last.message, error: Boolean(result.error) }, ...prev].slice(0, 40));
      };
      setView(frames[0]);
      if (frames.length === 1) return finish();
      setBusy(true);
      const ms = OP_SPEEDS[speed];
      frames.slice(1).forEach((f, i) => {
        timers.current.push(window.setTimeout(() => setView(f), ms * (i + 1)));
      });
      timers.current.push(window.setTimeout(finish, ms * (frames.length - 1)));
    },
    [busy, speed],
  );

  /** Replace the structure (reset / random fill) without animation. */
  const load = useCallback((next: S, message: string) => {
    cancel();
    setBusy(false);
    setState(next);
    setView({ state: next, marks: {}, message });
    setLog((prev) => [{ id: ++logId, op: "Reset", text: message, error: false }, ...prev].slice(0, 40));
  }, []);

  return { state, view, log, busy, run, load, speed, setSpeed };
}

export type OpRunner<S> = ReturnType<typeof useOpRunner<S>>;
