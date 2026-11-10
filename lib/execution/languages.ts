import type { RunLanguage } from "./sandbox";

export type PlaygroundLanguage = "javascript" | "typescript" | "python" | "cpp" | "c";

export type LanguageInfo = {
  id: PlaygroundLanguage;
  label: string;
  /** Runtime used to execute it. */
  runtime: RunLanguage;
  /** Shown under the editor so users know exactly how code runs. */
  note: string;
  /** Limit for the program itself (runtime loading / compilation is not counted). */
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
  cpp: {
    id: "cpp",
    label: "C++",
    runtime: "cpp",
    note: "Compiled with Clang 21 (C++20, -O1) to WebAssembly in your browser, then run. The first run downloads the compiler (about 25 MB). Exceptions are disabled and standard input is empty.",
    timeoutMs: 5000,
  },
  c: {
    id: "c",
    label: "C",
    runtime: "c",
    note: "Compiled with Clang 21 (C17, -O1) to WebAssembly in your browser, then run. The first run downloads the compiler (about 25 MB). Standard input is empty.",
    timeoutMs: 5000,
  },
};

export const languageOrder: PlaygroundLanguage[] = ["javascript", "typescript", "python", "cpp", "c"];
