# Devora

An interactive platform for learning Computer Science: algorithm visualizers, practice problems, and hands-on projects.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide

## Getting started

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

## Structure

```
app/                  Routes: / learn practice playground visualize code-tracer
                      sql-lab projects community get-started sign-in
components/
  home/               Homepage sections (hero, walkthrough, platform overview)
  layout/             Page shell, headers, footer, planned-scope panel
  navigation/         Navbar, nav links, mobile menu, search button
  search/             Search provider (shortcuts) and command palette
  video/              Walkthrough video card, poster art and player dialog
  visualizers/        Algorithm visualizer building blocks
  ui/                 Reusable primitives (Button, Dialog, StatusBadge, Kbd, …)
lib/
  features.ts         Single registry of product areas and their real status
  curriculum.ts       Planned catalogues (subjects, algorithms, projects, …)
  search.ts           Search index and ranking
  algorithms/         Algorithm implementations that emit step traces
styles/globals.css    Design tokens (Tailwind @theme) and base styles
```

## Honesty rules

- Feature status (`Available` / `Preview` / `In development`) comes only from `lib/features.ts`.
  Flip a status there when a feature ships and every page, search result and badge follows.
- No invented metrics, users, testimonials or ratings anywhere.
- The walkthrough video is not recorded yet. Set `walkthroughVideo.src` in `lib/site.ts`
  once a file exists in `public/videos/`; until then the player says so plainly.
- The hero visualizer replays a real Dijkstra trace from `lib/algorithms/dijkstra.ts`.

## Shortcuts

`Ctrl K` / `⌘K` or `/` opens search. In the visualizer, `←` `→` step through the algorithm.
