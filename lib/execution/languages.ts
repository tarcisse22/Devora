import type { RunLanguage } from "./sandbox";

export type PlaygroundLanguage = "javascript" | "typescript" | "python" | "java";

export type LanguageInfo = {
  id: PlaygroundLanguage;
  label: string;
  /** Runtime used to execute it, or null when it cannot run in the browser yet. */
  runtime: RunLanguage | null;
  /** Shown under the editor so users know exactly how code runs. */
  note: string;
  timeoutMs: number;
};

export const languages: Record<PlaygroundLanguage, LanguageInfo> = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    runtime: "javascript",
    note: "Runs in an isolated Web Worker sandbox. Top-level await is supported; there is no DOM.",
    timeoutMs: 5000,
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    runtime: "javascript",
    note: "Types are stripped (not type-checked), then the code runs in the JavaScript sandbox.",
    timeoutMs: 5000,
  },
  python: {
    id: "python",
    label: "Python",
    runtime: "python",
    note: "Python 3.14 via Pyodide (WebAssembly). Standard library only; input() is not supported. First run loads the runtime.",
    timeoutMs: 10000,
  },
  java: {
    id: "java",
    label: "Java",
    runtime: null,
    note: "Java can’t run in the browser yet. You can edit Java code here, but running it is not supported until a Java runtime is added.",
    timeoutMs: 0,
  },
};

export const languageOrder: PlaygroundLanguage[] = ["javascript", "typescript", "python", "java"];
