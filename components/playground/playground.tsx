"use client";

import { useCallback, useState } from "react";
import { Info, Play, RotateCcw, Square } from "lucide-react";
import { examples } from "@/lib/execution/examples";
import { languageOrder, languages, type PlaygroundLanguage } from "@/lib/execution/languages";
import { stripTypes } from "@/lib/execution/typescript";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Select } from "@/components/ui/select";
import { OutputPanel } from "./output-panel";
import { useCodeRunner } from "./use-code-runner";

type Props = {
  /** Open with this code instead of the first example (e.g. from a lesson). */
  initialLanguage?: PlaygroundLanguage;
  initialCode?: string;
};

export function Playground({ initialLanguage = "javascript", initialCode }: Props = {}) {
  const [language, setLanguage] = useState<PlaygroundLanguage>(initialLanguage);
  const [exampleId, setExampleId] = useState(examples[initialLanguage][0].id);
  const [code, setCode] = useState(initialCode ?? examples[initialLanguage][0].code);
  const runner = useCodeRunner();

  const info = languages[language];
  const example = examples[language].find((e) => e.id === exampleId) ?? examples[language][0];

  const run = useCallback(async () => {
    if (runner.busy) return;
    let source = code;
    if (language === "typescript") {
      const result = stripTypes(code);
      if (!result.ok) return runner.fail(result.error);
      source = result.code;
    }
    await runner.run({ language: info.runtime, code: source, timeoutMs: info.timeoutMs });
  }, [code, info, language, runner]);

  const changeLanguage = (next: PlaygroundLanguage) => {
    setLanguage(next);
    setExampleId(examples[next][0].id);
    setCode(examples[next][0].code);
    runner.clear();
  };

  const changeExample = (id: string) => {
    const ex = examples[language].find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    setCode(ex.code);
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-surface/70 shadow-[0_40px_120px_-60px_rgb(108_79_209/0.6)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2.5 sm:px-4">
        <label className="sr-only" htmlFor="pg-language">
          Language
        </label>
        <Select
          id="pg-language"
          value={language}
          onChange={(e) => changeLanguage(e.target.value as PlaygroundLanguage)}
          className="w-[132px] sm:w-[150px]"
        >
          {languageOrder.map((id) => (
            <option key={id} value={id}>
              {languages[id].label}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor="pg-example">
          Example
        </label>
        <Select id="pg-example" value={example.id} onChange={(e) => changeExample(e.target.value)} className="min-w-0 flex-1 sm:w-[240px] sm:flex-none">
          {examples[language].map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </Select>

        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCode(example.code)}
            disabled={code === example.code}
            title="Restore the example’s original code"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
          {runner.busy ? (
            <Button variant="secondary" size="sm" onClick={runner.stop} className="min-w-[92px]">
              <Square className="size-3 fill-current" aria-hidden />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={run} title="Run (Ctrl/⌘ + Enter)" className="min-w-[92px]">
              <Play className="size-3.5 fill-current" aria-hidden />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="flex min-h-[360px] flex-col border-b border-line lg:h-[540px] lg:border-b-0 lg:border-r">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onRun={run}
            ariaLabel={`${info.label} code editor`}
            className="flex-1"
          />
        </div>
        <OutputPanel
          output={runner.output}
          status={runner.status}
          statusText={runner.statusText}
          onClear={runner.clear}
          className="h-[300px] lg:h-[540px]"
        />
      </div>

      {/* Runtime note */}
      <div className="flex items-start gap-2.5 border-t border-line px-4 py-3 text-[12.5px] leading-relaxed text-fg-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p className="flex-1">{info.note}</p>
        <span className="hidden shrink-0 items-center gap-1 text-fg-subtle sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>Enter</Kbd>
          to run
        </span>
      </div>
    </div>
  );
}
