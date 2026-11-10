"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { AlertCircle, CornerDownLeft, Footprints, LoaderCircle, Pencil, Terminal } from "lucide-react";
import { getSandbox, type OutputStream } from "@/lib/execution/sandbox";
import { instrument, type TracerStep } from "@/lib/execution/tracer";
import { tracerExamples } from "@/lib/execution/tracer-examples";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PlayerControls } from "@/components/visualizers/player-controls";
import { useStepPlayer } from "@/components/visualizers/use-step-player";

type Line = { stream: OutputStream; text: string };
type Trace = { steps: TracerStep[]; output: Line[]; error: string | null };

const EMPTY: TracerStep[] = [];

export function CodeTracer() {
  const [exampleId, setExampleId] = useState(tracerExamples[1].id);
  const [code, setCode] = useState(tracerExamples[1].code);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [tracing, setTracing] = useState(false);
  const [problem, setProblem] = useState<{ message: string; line?: number } | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  const steps = trace?.steps ?? EMPTY;
  const player = useStepPlayer(steps.length, steps);
  const step = steps[Math.min(player.index, steps.length - 1)];
  const prev = player.index > 0 ? steps[player.index - 1] : undefined;
  const atLast = player.index >= steps.length - 1;

  const frames = step?.frames ?? [];
  const frameIndex = selectedFrame !== null && selectedFrame < frames.length ? selectedFrame : frames.length - 1;
  const frame = frames[frameIndex];

  // Variables that changed since the previous step (same frame depth).
  const changed = useMemo(() => {
    const out = new Set<string>();
    const before = prev?.frames[frameIndex];
    if (!frame || !before || before.name !== frame.name) return out;
    for (const [k, v] of Object.entries(frame.vars)) if (before.vars[k] !== v) out.add(k);
    return out;
  }, [frame, prev, frameIndex]);

  const visibleOutput = trace ? (atLast ? trace.output : trace.output.slice(0, step?.outputLength ?? 0)) : [];

  const runTrace = async () => {
    setProblem(null);
    const result = instrument(code);
    if (!result.ok) {
      setProblem({ message: result.error, line: result.line });
      return;
    }
    setTracing(true);
    const output: Line[] = [];
    try {
      const { result: done } = await getSandbox().run({
        language: "javascript",
        code: result.code,
        mode: "trace",
        timeoutMs: 5000,
        onOutput: (stream, text) => output.push({ stream, text }),
      });
      const res = await done;
      const tracedSteps = res.steps ?? [];
      if (tracedSteps.length === 0) {
        setProblem({ message: res.error ?? output.find((l) => l.stream === "stderr")?.text ?? "Nothing to trace — the program has no statements." });
        setTrace(null);
      } else {
        setTrace({ steps: tracedSteps, output, error: res.ok ? null : (res.error ?? "The program stopped with an error (see output).") });
        setSelectedFrame(null);
      }
    } catch (err) {
      setProblem({ message: err instanceof Error ? err.message : String(err) });
    } finally {
      setTracing(false);
    }
  };

  const edit = () => {
    setTrace(null);
    setProblem(null);
  };

  const loadExample = (id: string) => {
    const ex = tracerExamples.find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    setCode(ex.code);
    edit();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!trace) return;
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || (e.target as HTMLElement).isContentEditable) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      player.next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      player.prev();
    } else if (e.key === " " && tag !== "BUTTON") {
      e.preventDefault();
      player.toggle();
    }
  };

  return (
    <div
      role="group"
      aria-label="Code tracer"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)] outline-none"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2.5 sm:px-4">
        <label className="sr-only" htmlFor="tracer-example">
          Example
        </label>
        <Select id="tracer-example" value={exampleId} onChange={(e) => loadExample(e.target.value)} className="min-w-0 flex-1 sm:w-[240px] sm:flex-none">
          {tracerExamples.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </Select>
        <span className="hidden text-[12.5px] text-fg-subtle md:inline">JavaScript</span>
        <div className="ml-auto flex items-center gap-2">
          {trace ? (
            <Button variant="secondary" size="sm" onClick={edit}>
              <Pencil className="size-3.5" aria-hidden />
              Edit code
            </Button>
          ) : (
            <Button size="sm" onClick={runTrace} disabled={tracing} className="min-w-[110px]" title="Trace (Ctrl/⌘ + Enter)">
              {tracing ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Footprints className="size-3.5" aria-hidden />}
              Trace code
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Editor */}
        <div className="flex min-h-[340px] min-w-0 flex-col border-b border-line lg:h-[560px] lg:border-b-0 lg:border-r">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            readOnly={Boolean(trace)}
            onRun={() => !trace && runTrace()}
            highlightLine={trace ? (step?.line ?? null) : (problem?.line ?? null)}
            ariaLabel="JavaScript code to trace"
            className="flex-1"
          />
          {trace && (
            <p className="border-t border-line px-4 py-2 text-[12px] text-fg-subtle">Read-only while tracing — choose “Edit code” to change it.</p>
          )}
        </div>

        {/* Inspector */}
        <div className="flex min-w-0 flex-col gap-5 p-4 sm:p-5 lg:h-[560px] lg:overflow-y-auto">
          {problem && (
            <div className="flex gap-2.5 rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-4 py-3 text-[#ffc2c2]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p className="font-mono text-[12.5px] leading-relaxed">
                {problem.message}
                {problem.line ? ` (line ${problem.line})` : ""}
              </p>
            </div>
          )}

          {!trace ? (
            !problem && (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <Footprints className="size-7 text-fg-subtle" strokeWidth={1.5} aria-hidden />
                <p className="mt-3 text-[14px] font-medium text-fg">Trace your code to step through it</p>
                <p className="mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-fg-muted">
                  See which line runs, the value of every variable, the call stack and the output — one step at a time.
                </p>
              </div>
            )
          ) : (
            <>
              <div aria-live="polite">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
                  Step {player.index + 1} of {steps.length} · line {step.line}
                </p>
                {step.returned !== undefined ? (
                  <p className="mt-2 flex items-center gap-2 text-[14px] text-fg">
                    <CornerDownLeft className="size-4 text-success" aria-hidden />
                    <span className="font-mono text-accent-100">{frames.at(-1)?.name}</span> returns{" "}
                    <span className="rounded-md bg-success/10 px-1.5 font-mono text-success">{step.returned}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-[14px] text-fg-muted">About to run line {step.line}.</p>
                )}
              </div>

              {/* Call stack */}
              <div>
                <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Call stack</h3>
                <ol className="mt-2.5 space-y-1">
                  {[...frames]
                    .map((f, i) => ({ f, i }))
                    .reverse()
                    .map(({ f, i }) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setSelectedFrame(i)}
                          aria-pressed={i === frameIndex}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[8px] border px-3 py-1.5 text-left font-mono text-[12.5px] transition-colors",
                            i === frameIndex ? "border-accent-300/50 bg-accent-300/10 text-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                          )}
                        >
                          <span>
                            {f.name}
                            {f.name !== "global" && "()"}
                          </span>
                          {i === frames.length - 1 && <span className="text-[10.5px] text-accent-300">running</span>}
                        </button>
                      </li>
                    ))}
                </ol>
              </div>

              {/* Variables */}
              <div>
                <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
                  Variables <span className="normal-case tracking-normal">· {frame?.name}</span>
                </h3>
                {frame && Object.keys(frame.vars).length > 0 ? (
                  <dl className="mt-2.5 overflow-hidden rounded-[var(--radius-md)] border border-line font-mono text-[12.5px]">
                    {Object.entries(frame.vars).map(([name, value]) => (
                      <div
                        key={name}
                        className={cn("flex gap-3 border-b border-line/60 px-3 py-1.5 last:border-b-0 transition-colors", changed.has(name) && "bg-accent-300/10")}
                      >
                        <dt className="w-24 shrink-0 truncate text-accent-200">{name}</dt>
                        <dd className={cn("min-w-0 break-words", value === "<uninitialized>" ? "italic text-fg-subtle" : "text-fg/90")}>
                          {value}
                          {changed.has(name) && <span className="ml-2 font-sans text-[10.5px] text-accent-300">changed</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-2.5 text-[13px] text-fg-subtle">No variables in this scope yet.</p>
                )}
              </div>

              {/* Output */}
              <div>
                <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
                  <Terminal className="size-3.5" aria-hidden /> Output
                </h3>
                <div className="mt-2.5 min-h-[56px] rounded-[var(--radius-md)] border border-line bg-black/30 px-3 py-2 font-mono text-[12.5px] leading-relaxed">
                  {visibleOutput.length === 0 ? (
                    <span className="text-fg-subtle">Nothing printed yet.</span>
                  ) : (
                    visibleOutput.map((l, i) => (
                      <pre key={i} className={cn("whitespace-pre-wrap break-words", l.stream === "stderr" ? "text-[#ff9b9b]" : "text-fg/90")}>
                        {l.text}
                      </pre>
                    ))
                  )}
                  {atLast && trace.error && <p className="mt-1 text-[#ff9b9b]">{trace.error}</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {trace && (
        <div className="border-t border-line px-4 py-3.5">
          <PlayerControls player={player} />
        </div>
      )}
    </div>
  );
}
