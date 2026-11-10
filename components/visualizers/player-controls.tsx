"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPEEDS, type StepPlayer } from "./use-step-player";

function IconButton({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-35",
        primary
          ? "size-11 bg-accent-200 text-[#14101f] shadow-[0_8px_24px_-8px_rgb(157_134_247/0.7)] hover:bg-accent-100"
          : "size-9 border border-line-strong text-fg-muted hover:border-white/25 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

/** Transport controls shared by every visualizer. */
export function PlayerControls({ player }: { player: StepPlayer }) {
  const { index, total, playing, toggle, next, prev, reset, speed, setSpeed, setIndex, atEnd } = player;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex items-center gap-2">
        <IconButton label="Reset" onClick={reset} disabled={index === 0 && !playing}>
          <RotateCcw className="size-4" aria-hidden />
        </IconButton>
        <IconButton label="Step back (←)" onClick={prev} disabled={index === 0}>
          <SkipBack className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={playing ? "Pause (Space)" : atEnd ? "Replay (Space)" : "Play (Space)"} onClick={toggle} primary>
          {playing ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="ml-0.5 size-5 fill-current" aria-hidden />}
        </IconButton>
        <IconButton label="Step forward (→)" onClick={next} disabled={atEnd}>
          <SkipForward className="size-4" aria-hidden />
        </IconButton>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <label className="sr-only" htmlFor="step-scrubber">
          Step
        </label>
        <input
          id="step-scrubber"
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-accent-300"
        />
        <span className="shrink-0 font-mono text-[12px] tabular-nums text-fg-muted" aria-live="polite">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className={cn(
              "h-8 rounded-[8px] px-2.5 font-mono text-[12px] transition-colors",
              speed === s ? "bg-white/[0.08] text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
