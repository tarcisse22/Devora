import {
  BookOpen,
  Database,
  Footprints,
  FolderKanban,
  Network,
  SquareTerminal,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Honest build status for each product area. This single registry drives the
 * navigation, search, homepage overview and the route pages, so a status
 * label can never disagree between places.
 *
 * - available: fully usable today
 * - preview:   partially working (a real, interactive slice exists)
 * - planned:   designed and scoped, not built yet
 */
export type FeatureStatus = "available" | "preview" | "planned";

export type FeatureId =
  | "learn"
  | "practice"
  | "playground"
  | "visualize"
  | "code-tracer"
  | "sql-lab"
  | "projects"
  | "community";

export type Feature = {
  id: FeatureId;
  name: string;
  href: string;
  icon: LucideIcon;
  status: FeatureStatus;
  /** One line used in cards and search results. */
  summary: string;
  /** Longer intro used at the top of the feature's page. */
  description: string;
  /** What the finished feature will include — shown as "Planned scope". */
  scope: string[];
};

export const features: Record<FeatureId, Feature> = {
  learn: {
    id: "learn",
    name: "Learn",
    href: "/learn",
    icon: BookOpen,
    status: "available",
    summary: "24 lessons across 8 core Computer Science subjects.",
    description:
      "Lessons organised by subject, each combining clear explanations, code examples, visual illustrations and practical exercises.",
    scope: [
      "Lessons with explanations, code examples and illustrations",
      "Practical exercises inside each lesson",
      "Related topics and previous / next lesson navigation",
      "A consistent lesson layout that grows with new content",
    ],
  },
  practice: {
    id: "practice",
    name: "Practice",
    href: "/practice",
    icon: Target,
    status: "available",
    summary: "12 original coding challenges with real test cases.",
    description:
      "Solve original programming challenges in JavaScript or Python. Run the examples, then submit against hidden tests — every result comes from actually running your code.",
    scope: [
      "Challenge list with search, topic filters and difficulty labels",
      "Problem descriptions with input / output examples",
      "In-browser code editor",
      "Real test cases with submission feedback",
    ],
  },
  playground: {
    id: "playground",
    name: "Playground",
    href: "/playground",
    icon: SquareTerminal,
    status: "available",
    summary: "Write and run JavaScript, TypeScript, Python, C++ and C in your browser.",
    description:
      "A lightweight developer environment: write code, run it in an isolated sandbox and inspect the output. JavaScript, TypeScript, Python, C++ and C all run in your browser — C and C++ are compiled with a real Clang toolchain.",
    scope: [
      "Code editor with syntax highlighting and line numbers",
      "Sandboxed JavaScript execution, isolated from the app",
      "Python via Pyodide; C and C++ compiled with Clang to WebAssembly",
      "Run, reset and clear controls with a console panel",
      "Example snippets to start from",
    ],
  },
  visualize: {
    id: "visualize",
    name: "Visualize",
    href: "/visualize",
    icon: Network,
    status: "available",
    summary: "10 algorithms and 9 data structures you can run, step through and modify.",
    description:
      "Interactive visualizations driven by real algorithm implementations, so every frame reflects actual execution. Ten sorting, searching and graph algorithms, plus nine data structures you can operate on.",
    scope: [
      "Sorting, searching and graph algorithms, each with its own visualization",
      "Play, pause, step forward / back, reset and speed control",
      "Adjustable and randomised inputs",
      "Step explanations, pseudocode and complexity notes",
      "Data structures you can operate on: insert, delete, push, pop and more",
    ],
  },
  "code-tracer": {
    id: "code-tracer",
    name: "Code Tracer",
    href: "/code-tracer",
    icon: Footprints,
    status: "available",
    summary: "Step through JavaScript line by line and inspect state.",
    description:
      "See how a program really runs: the current line, every variable, the call stack and the output, one step at a time.",
    scope: [
      "Editor with step-by-step execution controls",
      "Current-line highlighting",
      "Variable inspection and call stack view",
      "Output panel — starting with JavaScript",
    ],
  },
  "sql-lab": {
    id: "sql-lab",
    name: "SQL Lab",
    href: "/sql-lab",
    icon: Database,
    status: "available",
    summary: "Run real SQL against sample datasets in your browser.",
    description:
      "A real SQLite database running in your browser with related sample tables — students, courses, enrollments, employees and departments — so every query you write runs against real data.",
    scope: [
      "SQL editor with results table",
      "Sample tables: students, courses, enrollments, employees, departments",
      "Schema viewer and example queries",
      "SELECT, WHERE, ORDER BY, GROUP BY, JOIN, INSERT, UPDATE, DELETE",
      "One-click database reset",
    ],
  },
  projects: {
    id: "projects",
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    status: "available",
    summary: "7 guided projects, from a portfolio to a full-stack app.",
    description:
      "Practical builds organised by difficulty and technology, each with objectives, instructions and a completion checklist.",
    scope: [
      "Projects grouped by difficulty and technology",
      "Required skills, tech stack and learning objectives",
      "Step-by-step instructions",
      "A completion checklist",
    ],
  },
  community: {
    id: "community",
    name: "Community",
    href: "/community",
    icon: Users,
    status: "planned",
    summary: "Discussions, shared projects and resources — once accounts exist.",
    description:
      "A place for discussions, questions, shared projects and learning resources. It needs accounts and a backend, so it comes after those are in place.",
    scope: [
      "Discussions and Q&A",
      "Shared projects",
      "Curated learning resources",
      "Developer profiles",
    ],
  },
};

export const featureList = Object.values(features);

export const statusLabel: Record<FeatureStatus, string> = {
  available: "Available",
  preview: "Preview",
  planned: "In development",
};
