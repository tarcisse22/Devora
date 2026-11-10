"use client";

import { useCallback, useEffect, useState } from "react";

export const SPEEDS = [0.5, 1, 2, 4] as const;
const BASE_MS = 650;

/**
 * Playback state for a list of recorded frames: play / pause, step forward
 * and back, reset and speed. Playback stops automatically on the last frame.
 */
export function useStepPlayer(total: number, resetKey: unknown) {
  const [index, setIndexState] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const last = Math.max(0, total - 1);

  // New frames (new input) restart from the beginning — even when the frame
  // count happens to be the same. Adjusting state during render is React's
  // recommended way to reset on a prop change.
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setIndexState(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setIndexState((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, BASE_MS / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, last]);

  const setIndex = useCallback((i: number) => setIndexState(Math.max(0, Math.min(last, i))), [last]);
  const next = useCallback(() => {
    setPlaying(false);
    setIndexState((i) => Math.min(last, i + 1));
  }, [last]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndexState((i) => Math.max(0, i - 1));
  }, []);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndexState(0);
  }, []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && index >= last) setIndexState(0); // replay from the start
      return !p;
    });
  }, [index, last]);

  return { index, setIndex, playing, toggle, next, prev, reset, speed, setSpeed, total, atEnd: index >= last };
}

export type StepPlayer = ReturnType<typeof useStepPlayer>;
