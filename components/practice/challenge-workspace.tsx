"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, CircleDashed, FlaskConical, Lightbulb, LoaderCircle, Lock, RotateCcw, Send, XCircle } from "lucide-react";
import { challengeBySlug, starterCode, type ChallengeLanguage, type TestCase } from "@/lib/practice/challenges";
import { buildHarness, createMarker, parseHarnessOutput, type TestResult } from "@/lib/practice/harness";
import { clearDraft, loadDraft, markSolved, saveDraft, useSolved } from "@/lib/practice/progress";
import { getSandbox } from "@/lib/execution/sandbox";
import { languages } from "@/lib/execution/languages";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RichText, difficultyStyle } from "./rich-text";

type Outcome = {
  mode: "run" | "submit";
  tests: TestCase[];
  results: TestResult[];
  userOutput: { stream: string; text: string }[];
  error?: string;
};

const initialCode = (slug: string, lang: ChallengeLanguage) => {
  const c = challengeBySlug(slug)!;
  return (typeof window !== "undefined" && loadDraft(slug, lang)) || starterCode(c, lang);
};

export function ChallengeWorkspace({ slug }: { slug: string }) {
  const challenge = challengeBySlug(slug)!;
  const solved = useSolved().includes(slug);
  const [lang, setLang] = useState<ChallengeLanguage>("javascript");
  const [code, setCode] = useState(() => initialCode(slug, "javascript"));
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [showHint, setShowHint] = useState(false);

  const visible = challenge.tests.filter((t) => !t.hidden);

  const changeCode = (next: string) => {
    setCode(next);
    saveDraft(slug, lang, next);
  };

  const changeLang = (next: ChallengeLanguage) => {
    setLang(next);
    setCode(initialCode(slug, next));
    setOutcome(null);
  };

  const reset = () => {
    clearDraft(slug, lang);
    setCode(starterCode(challenge, lang));
    setOutcome(null);
  };

  const execute = async (mode: "run" | "submit") => {
    if (running) return;
    const tests = mode === "run" ? visible : challenge.tests;
    const marker = createMarker();
    const lines: { stream: string; text: string }[] = [];
    setRunning(mode);
    setStatus(null);
    setOutcome(null);
    try {
      const { result } = await getSandbox().run({
        language: lang,
        code: buildHarness(challenge, lang, code, tests, marker),
        timeoutMs: languages[lang].timeoutMs,
        onOutput: (stream, text) => lines.push({ stream, text }),
        onStatus: setStatus,
        onStarted: () => setStatus(null),
      });
      const res = await result;
      const parsed = parseHarnessOutput(lines, marker);
      const failedToRun = !res.ok && parsed.results.length === 0;
      const next: Outcome = {
        mode,
        tests,
        results: parsed.results,
        userOutput: parsed.userOutput,
        error: res.error ?? (failedToRun ? parsed.userOutput.find((l) => l.stream === "stderr")?.text ?? "Your code didn’t run." : undefined),
      };
      setOutcome(next);
      if (mode === "submit" && parsed.results.length === tests.length && parsed.results.every((r) => r?.pass)) markSolved(slug);
    } catch (err) {
      setOutcome({ mode, tests, results: [], userOutput: [], error: err instanceof Error ? err.message : String(err) });
    } finally {
      setRunning(null);
      setStatus(null);
    }
  };

  const passed = outcome ? outcome.results.filter((r) => r?.pass).length : 0;
  const allPassed = outcome && !outcome.error && passed === outcome.tests.length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Problem */}
      <article className="min-w-0 rounded-[var(--radius-xl)] border border-line bg-surface/50 p-5 sm:p-6 lg:max-h-[860px] lg:overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium", difficultyStyle[challenge.difficulty])}>{challenge.difficulty}</span>
          {challenge.topics.map((t) => (
            <span key={t} className="rounded-full border border-line-strong px-2.5 py-0.5 text-[11.5px] text-fg-muted">
              {t}
            </span>
          ))}
          {solved && (
            <span className="ml-auto flex items-center gap-1.5 text-[12.5px] text-success">
              <CheckCircle2 className="size-4" aria-hidden /> Solved
            </span>
          )}
        </div>

        <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-fg/90">
          {challenge.description.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>

        <h2 className="mt-7 text-[13px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Examples</h2>
        <div className="mt-3 space-y-3">
          {visible.map((t, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-line bg-black/25 p-4 font-mono text-[12.5px] leading-relaxed">
              <p>
                <span className="text-fg-subtle">Input: </span>
                <span className="text-fg/90">{challenge.params.map((p, k) => `${p} = ${JSON.stringify(t.args[k])}`).join(", ")}</span>
              </p>
              <p>
                <span className="text-fg-subtle">Output: </span>
                <span className="text-accent-100">{JSON.stringify(t.expected)}</span>
              </p>
              {t.explanation && <p className="mt-1 font-sans text-[13px] text-fg-muted">{t.explanation}</p>}
            </div>
          ))}
        </div>

        <h2 className="mt-7 text-[13px] font-medium uppercase tracking-[0.08em] text-fg-subtle">Constraints</h2>
        <ul className="mt-3 space-y-1.5 font-mono text-[12.5px] text-fg-muted">
          {challenge.constraints.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>

        <div className="mt-7">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
            className="flex items-center gap-2 text-[13.5px] font-medium text-accent-200 transition-colors hover:text-accent-100"
          >
            <Lightbulb className="size-4" aria-hidden />
            {showHint ? "Hide hint" : "Show a hint"}
          </button>
          {showHint && <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{challenge.hint}</p>}
        </div>
      </article>

      {/* Editor + results */}
      <div className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)]">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2.5 sm:px-4">
          <label className="sr-only" htmlFor="challenge-lang">
            Language
          </label>
          <Select id="challenge-lang" value={lang} onChange={(e) => changeLang(e.target.value as ChallengeLanguage)} className="w-[140px]">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </Select>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={Boolean(running)} title="Restore the starter code">
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={() => execute("run")} disabled={Boolean(running)} title="Run the example tests (Ctrl/⌘ + Enter)">
              {running === "run" ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <FlaskConical className="size-3.5" aria-hidden />}
              Run tests
            </Button>
            <Button size="sm" onClick={() => execute("submit")} disabled={Boolean(running)} title="Run every test, including hidden ones">
              {running === "submit" ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Send className="size-3.5" aria-hidden />}
              Submit
            </Button>
          </div>
        </div>

        <div className="h-[340px] border-b border-line sm:h-[400px]">
          <CodeEditor value={code} onChange={changeCode} language={lang} onRun={() => execute("run")} ariaLabel={`${languages[lang].label} solution editor`} />
        </div>

        <section aria-label="Test results" aria-live="polite" className="min-h-[200px] p-4 sm:p-5">
          {running ? (
            <p className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              {status ?? (running === "run" ? "Running example tests…" : "Running all tests…")}
            </p>
          ) : !outcome ? (
            <p className="text-[13.5px] leading-relaxed text-fg-subtle">
              <span className="text-fg-muted">Run tests</span> checks the examples. <span className="text-fg-muted">Submit</span> also runs {challenge.tests.length - visible.length} hidden tests — pass them all to mark the challenge solved in this browser.
            </p>
          ) : (
            <div className="space-y-4">
              {outcome.error && (
                <div className="flex gap-2.5 rounded-[var(--radius-md)] border border-[#ff9b9b]/30 bg-[#ff9b9b]/[0.06] px-4 py-3 text-[#ffc2c2]">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <pre className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed">{outcome.error}</pre>
                </div>
              )}
              <p className={cn("flex items-center gap-2 text-[14px] font-medium", allPassed ? "text-success" : "text-fg")}>
                {allPassed ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4 text-[#ff9b9b]" aria-hidden />}
                {passed} / {outcome.tests.length} tests passed
                {allPassed && outcome.mode === "submit" && <span className="font-normal text-fg-muted">— solved! Saved in this browser.</span>}
                {allPassed && outcome.mode === "run" && <span className="font-normal text-fg-muted">— now Submit to run the hidden tests.</span>}
              </p>
              <ol className="space-y-2">
                {outcome.tests.map((t, i) => {
                  const r = outcome.results[i];
                  return (
                    <li key={i} className="rounded-[var(--radius-md)] border border-line px-3.5 py-2.5">
                      <p className="flex items-center gap-2 text-[13px] font-medium">
                        {!r ? (
                          <CircleDashed className="size-4 text-fg-subtle" aria-hidden />
                        ) : r.pass ? (
                          <CheckCircle2 className="size-4 text-success" aria-hidden />
                        ) : (
                          <XCircle className="size-4 text-[#ff9b9b]" aria-hidden />
                        )}
                        <span className="text-fg">Test {i + 1}</span>
                        {t.hidden && (
                          <span className="flex items-center gap-1 text-[11.5px] font-normal text-fg-subtle">
                            <Lock className="size-3" aria-hidden /> hidden
                          </span>
                        )}
                        <span className="ml-auto text-[12px] font-normal text-fg-subtle">{!r ? "not run" : r.pass ? "passed" : "failed"}</span>
                      </p>
                      {r && !r.pass && (
                        <div className="mt-2 space-y-0.5 font-mono text-[12px] leading-relaxed">
                          {!t.hidden && (
                            <p>
                              <span className="text-fg-subtle">Input: </span>
                              {challenge.params.map((p, k) => `${p} = ${JSON.stringify(t.args[k])}`).join(", ")}
                            </p>
                          )}
                          {!t.hidden && (
                            <p>
                              <span className="text-fg-subtle">Expected: </span>
                              <span className="text-success">{JSON.stringify(t.expected)}</span>
                            </p>
                          )}
                          {r.error ? (
                            <p className="text-[#ff9b9b]">{r.error}</p>
                          ) : (
                            <p>
                              <span className="text-fg-subtle">Got: </span>
                              <span className="text-[#ffb3b3]">{r.got}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              {outcome.userOutput.length > 0 && (
                <details className="rounded-[var(--radius-md)] border border-line px-3.5 py-2.5">
                  <summary className="cursor-pointer text-[13px] text-fg-muted">Your printed output ({outcome.userOutput.length} lines)</summary>
                  <pre className="mt-2 max-h-[160px] overflow-auto whitespace-pre-wrap font-mono text-[12px] text-fg/85">
                    {outcome.userOutput.map((l) => l.text).join("\n")}
                  </pre>
                </details>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
