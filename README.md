# Devora

An interactive platform for learning Computer Science by doing: lessons, visualizers, a code playground, a code tracer, a SQL lab, coding challenges, guided projects and a community.

## Getting started

```bash
npm install     # also copies the browser runtimes into public/vendor
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (offline unit tests), `npm run test:live` and `npm run test:e2e` (against the real Firebase project — see below).

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
| **Community** | Questions, discussions, shared projects and resources: threads, replies, likes, profiles |
| **Accounts** | Email/password sign-in, usernames, profile editing, account deletion; progress syncs across devices |

Progress (completed lessons, solved challenges, project checklists) lives in the browser and, when signed in, is synced to the account. Code drafts stay in the browser. Everything except posting in the community works without an account.

## Backend: Firebase

Accounts and the community use **Firebase Authentication** (email/password) and **Cloud Firestore**. The web
config in `lib/firebase/config.ts` points at the `devora-62b2a` project; these values identify the project and are
not secrets. Each can be overridden with a `NEXT_PUBLIC_FIREBASE_*` environment variable.

**All access control lives in [`firestore.rules`](firestore.rules)**, enforced by Google’s servers:

- Public profiles with permanent, unique usernames (`users/{uid}`, `usernames/{name}`).
- Private progress (`progress/{uid}`) — only the owner can read or write it.
- Threads, replies and likes: anyone can read; signed-in users write as themselves only, with length limits,
  author-only edits and deletes, and thread authors able to remove replies in their threads.
- A posting cooldown (30 s between threads, 10 s between replies) enforced by the database.

**Changing the rules:** edit `firestore.rules`, then paste it into Firebase console → Firestore Database → Rules →
Publish, and run `npm run test:live` to verify it.

### Using your own Firebase project

1. Create a project at https://console.firebase.google.com.
2. Authentication → Sign-in method → enable **Email/Password**.
3. Firestore Database → Create database (production mode), then publish `firestore.rules`.
4. Project settings → Your apps → Web app; put its config in `.env.local` as `NEXT_PUBLIC_FIREBASE_API_KEY`,
   `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._MESSAGING_SENDER_ID`, `..._APP_ID`.
5. Authentication → Settings → Authorized domains: add the domain you deploy to (`localhost` is allowed by default).

### Live tests

- `npm run test:live` — 44 security-rule checks (including impersonation, editing others’ posts, reading others’
  progress, spam) using two throwaway accounts that are deleted afterwards.
- `npm run test:e2e` — a full browser run (sign-up, usernames, posting, replies, likes, moderation, cross-device
  progress sync, account deletion). Start the app first (`npm run build && npm start`) and install Playwright once
  (`npm i -D playwright && npx playwright install chromium`).

Both create real (temporary) data in the Firebase project and clean it up.

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
  auth/                  Auth provider, sign-in, profile setup, account page, user menu
  community/             Thread list, thread view, new-thread form, profiles
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
  firebase/              Firebase client, profiles, community, progress sync, account deletion
  learn/                 Lesson content
  practice/              Challenges and test harness
  projects/              Project guides
  sql/                   SQLite client, sample data, example queries
  features.ts            Single registry of product areas and their real status
  search.ts              Search index
public/sandbox/          The sandboxed code runner
tests/                   npm test (node:test via tsx); tests/live: real-Firebase rule and e2e tests
firestore.rules          Firestore security rules
```

## Honesty rules

- Feature status (`Available` / `Preview` / `In development`) comes only from `lib/features.ts`.
- No invented metrics, users, testimonials or ratings anywhere.
- Every visualization, test result and query result comes from actually running code.
- The test suite verifies algorithm output against independent references, every challenge’s expected answers
  against reference solutions, and every runnable lesson example.
