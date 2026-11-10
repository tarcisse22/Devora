# Devora

An interactive platform for learning Computer Science by doing: lessons, visualizers, a code playground, a code tracer, a SQL lab, coding challenges and guided projects.

## Getting started

```bash
npm install     # also copies the browser runtimes into public/vendor
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.

## What works today

| Area | What it does |
| --- | --- |
| **Learn** | 24 lessons across 8 subjects, with runnable examples, diagrams, quizzes and progress |
| **Practice** | 12 original challenges (JavaScript or Python) with example and hidden tests |
| **Playground** | Run JavaScript, TypeScript, Python, C++ and C in an isolated in-browser sandbox |
| **Visualize** | 10 algorithms and 9 data structures, each driven by a real implementation |
| **Code Tracer** | Step through JavaScript line by line: variables, call stack, output |
| **SQL Lab** | Real SQLite in the browser with a sample university/company database |
| **Projects** | 7 guided builds with instructions and completion checklists |
| **Community** | Not built yet — it needs accounts and a backend |

Progress (solved challenges, completed lessons, project checklists, code drafts) is stored in the browser’s localStorage only. There are no accounts yet.

## How code runs

User code never runs on the page itself. `public/sandbox/runner.html` is loaded in an
`<iframe sandbox="allow-scripts">` (an opaque origin with no access to Devora’s cookies or storage) and runs each
program in a Web Worker, so infinite loops are stopped on a timeout without freezing the app.

- **JavaScript / TypeScript:** native, with TypeScript type-stripped by Sucrase.
- **Python:** Pyodide (Python 3.14, WebAssembly).
- **C / C++:** Clang/LLD 21 compiled to WebAssembly (`@yowasp/clang`), run with a WASI shim.
- **SQL:** sql.js (SQLite, WebAssembly) in its own worker.

All runtimes are self-hosted: `scripts/copy-vendor.mjs` copies them from `node_modules` into `public/vendor` (ignored by
Git) on install. The C/C++ compiler is about 25 MB compressed and is downloaded the first time someone runs C or C++.

## Structure

```
app/                     Routes (learn, practice, playground, visualize, code-tracer, sql-lab, projects, …)
components/
  code-tracer/           Code Tracer UI
  data-structures/       Data-structure workbenches and views
  editor/                CodeMirror editor and theme
  home/                  Homepage sections
  layout/                Page shell, headers, footer
  learn/                 Lesson blocks, quizzes, progress
  navigation/            Navbar, mobile menu, search button
  playground/            Playground UI and runner hook
  practice/              Challenge list and workspace
  projects/              Project checklist
  search/                Command palette (Ctrl/⌘ K, /)
  sql/                   SQL Lab UI
  visualizers/           Algorithm workbench, canvases, player controls
  ui/                    Primitives (Button, Dialog, Select, StatusBadge, …)
lib/
  algorithms/            Algorithms that record step frames
  data-structures/       Data-structure operations that record step frames
  execution/             Sandbox client, languages, tracer instrumentation, share links
  learn/                 Lesson content
  practice/              Challenges and test harness
  projects/              Project guides
  sql/                   SQLite client, sample data, example queries
  features.ts            Single registry of product areas and their real status
  search.ts              Search index
public/sandbox/          The sandboxed code runner
tests/                   npm test (node:test via tsx)
```

## Honesty rules

- Feature status (`Available` / `Preview` / `In development`) comes only from `lib/features.ts`.
- No invented metrics, users, testimonials or ratings anywhere.
- Every visualization, test result and query result comes from actually running code.
- The test suite verifies algorithm output against independent references, every challenge’s expected answers
  against reference solutions, and every runnable lesson example.
