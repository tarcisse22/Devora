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
app/                  Routes and root layout
components/
  home/               Homepage sections
  layout/             Page-level decoration (hero atmosphere)
  navigation/         Navbar, nav links, mobile menu
  ui/                 Reusable primitives (Button, Container, Pill, Logo, FadeIn)
  visualizers/        Algorithm visualizer building blocks
lib/
  algorithms/         Algorithm implementations that emit step traces
  site.ts             Site config and navigation
styles/globals.css    Design tokens (Tailwind @theme) and base styles
```

The hero visualizer replays a real Dijkstra trace from `lib/algorithms/dijkstra.ts`, so its step controls reflect actual algorithm state.
