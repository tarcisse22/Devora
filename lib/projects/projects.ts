export type ProjectLevel = "Beginner" | "Intermediate" | "Advanced";

export type ProjectStep = { title: string; details: string };

export type Project = {
  slug: string;
  title: string;
  level: ProjectLevel;
  summary: string;
  overview: string;
  stack: string[];
  /** Skills you should have before starting, with optional Devora links to practise them. */
  skills: { label: string; href?: string }[];
  objectives: string[];
  steps: ProjectStep[];
  checklist: string[];
  stretch: string[];
};

export const projects: Project[] = [
  {
    slug: "personal-portfolio",
    title: "Personal Portfolio",
    level: "Beginner",
    summary: "A responsive site that presents who you are and what you’ve built.",
    overview:
      "Build a fast, accessible single-page portfolio with an introduction, a projects section and a way to contact you. It’s the first thing many recruiters see, and it teaches the fundamentals every web project builds on: semantic HTML, layout with CSS and a little JavaScript.",
    stack: ["HTML", "CSS", "JavaScript"],
    skills: [{ label: "Basic HTML and CSS" }, { label: "JavaScript variables, functions and the DOM", href: "/playground" }],
    objectives: [
      "Structure a page with semantic HTML (header, main, section, footer)",
      "Build responsive layouts with Flexbox and CSS Grid",
      "Make a site accessible: headings, alt text, contrast and keyboard focus",
      "Add small interactions with JavaScript without a framework",
      "Publish a static site to the web",
    ],
    steps: [
      { title: "Plan the content", details: "Write your one-sentence introduction, pick 3–4 projects to feature and decide how people should contact you. Content first, design second." },
      { title: "Write the semantic HTML", details: "Create index.html with a header (name + navigation), an about section, a projects section and a footer. Use real headings in order (h1, then h2s) and descriptive link text." },
      { title: "Style a mobile-first layout", details: "Start with the narrow-screen layout, then add a media query for wider screens. Use CSS Grid for the projects section and custom properties (CSS variables) for colours and spacing." },
      { title: "Add project cards", details: "Each card gets a title, a two-line description, the technologies used and links to the live demo and source code. Give images meaningful alt text." },
      { title: "Add a small interaction", details: "Use JavaScript for one useful behaviour — for example a theme toggle that respects prefers-color-scheme, or highlighting the current section in the navigation while scrolling." },
      { title: "Check accessibility and performance", details: "Navigate the whole page with only the keyboard, check colour contrast and run a Lighthouse audit in your browser’s developer tools. Fix what it flags." },
      { title: "Deploy", details: "Push the project to a Git repository and publish it on a static host (for example GitHub Pages, Netlify or Cloudflare Pages)." },
    ],
    checklist: [
      "Page uses semantic HTML elements and a single h1",
      "Layout works from 320 px phones to wide desktop screens",
      "Every image has meaningful alt text",
      "All interactive elements are reachable and visible with the keyboard",
      "Projects section lists at least three projects with links",
      "Contact information or a contact link is present",
      "Lighthouse accessibility score checked and issues fixed",
      "Site is deployed at a public URL",
    ],
    stretch: ["Add a blog section generated from Markdown files", "Add subtle scroll-triggered animations that respect prefers-reduced-motion", "Set up a custom domain"],
  },
  {
    slug: "task-manager",
    title: "Task Manager",
    level: "Beginner",
    summary: "A to-do app with filters, editing and data that survives a refresh.",
    overview:
      "Build a task manager where you can add, edit, complete, filter and delete tasks. You’ll practise managing application state, rendering lists from data and persisting data in the browser with localStorage.",
    stack: ["HTML", "CSS", "JavaScript", "localStorage"],
    skills: [{ label: "Arrays and objects", href: "/visualize/data-structures/array" }, { label: "DOM events" }, { label: "JSON" }],
    objectives: [
      "Keep application state in one place and render the UI from it",
      "Handle form input, validation and events",
      "Persist and restore data with localStorage and JSON",
      "Implement filtering and derived data (counts, remaining tasks)",
    ],
    steps: [
      { title: "Model the data", details: "Represent each task as an object such as { id, title, done, createdAt }. Keep all tasks in a single array — this is your state." },
      { title: "Render from state", details: "Write a render() function that rebuilds the task list from the array. Every change updates the array, then calls render(). Never edit the DOM directly elsewhere." },
      { title: "Add, complete and delete", details: "Use a form with a submit handler to add tasks (ignore empty titles). Add a checkbox to toggle done and a button to delete. Use event delegation on the list instead of one listener per item." },
      { title: "Edit in place", details: "Double-clicking a task turns its title into an input. Enter saves, Escape cancels, and an empty title deletes the task." },
      { title: "Filter and count", details: "Add All / Active / Completed filters and a “3 tasks left” counter. Filters change what’s displayed, not the stored data." },
      { title: "Persist", details: "Save the array to localStorage (JSON.stringify) after every change and load it (JSON.parse) on start. Handle missing or invalid saved data gracefully." },
    ],
    checklist: [
      "Can add a task; empty titles are rejected",
      "Can mark tasks done and undo it",
      "Can edit a task’s title in place",
      "Can delete a task",
      "Filters show all, active and completed tasks",
      "Remaining-task counter is always correct",
      "Tasks are still there after refreshing the page",
      "Works with the keyboard alone",
    ],
    stretch: ["Drag and drop to reorder tasks", "Due dates with overdue highlighting", "Undo the last deletion"],
  },
  {
    slug: "weather-app",
    title: "Weather Application",
    level: "Intermediate",
    summary: "Search a city and show current conditions and a forecast from a real API.",
    overview:
      "Build an app that looks up a city and displays the current weather and a multi-day forecast using a public weather API. The real lessons are asynchronous code, working with an external API, and handling loading and error states properly.",
    stack: ["JavaScript", "fetch API", "Public weather API (e.g. Open-Meteo)"],
    skills: [{ label: "Promises and async/await", href: "/playground" }, { label: "Working with JSON" }],
    objectives: [
      "Call a third-party HTTP API with fetch and async/await",
      "Read API documentation and map responses to your own data shape",
      "Design loading, empty and error states",
      "Debounce user input and avoid unnecessary requests",
    ],
    steps: [
      { title: "Choose an API and read its docs", details: "Pick a weather API (Open-Meteo offers geocoding and forecasts without an API key). Identify the endpoint for turning a city name into coordinates and the endpoint for the forecast." },
      { title: "Build the search", details: "Add a search box. Debounce input (wait ~300 ms after typing stops) before calling the geocoding endpoint, and show matching cities to choose from." },
      { title: "Fetch the forecast", details: "Use the chosen city’s latitude and longitude to request current conditions and a daily forecast. Convert the response into a small object your UI understands." },
      { title: "Handle every state", details: "Show a loading indicator during requests, a friendly message when a city isn’t found, and a retry option when the network fails. Check response.ok — fetch only rejects on network errors." },
      { title: "Present the data", details: "Display temperature, conditions, wind and a 5–7 day forecast. Map weather codes to readable labels and icons. Format dates and units for the user’s locale." },
      { title: "Remember the last city", details: "Store the last selected city so the app shows its weather on the next visit." },
    ],
    checklist: [
      "City search returns matching places",
      "Current conditions are displayed for the chosen city",
      "A multi-day forecast is displayed",
      "Loading state is visible during requests",
      "Not-found and network errors show helpful messages",
      "Input is debounced",
      "Last city is remembered",
      "Layout works on mobile",
    ],
    stretch: ["Use the browser’s geolocation for “weather near me”", "Switch between metric and imperial units", "Cache responses for a few minutes"],
  },
  {
    slug: "expense-tracker",
    title: "Expense Tracker",
    level: "Intermediate",
    summary: "Track spending by category with summaries and a chart.",
    overview:
      "Build an app to record expenses, categorise them and see where money goes each month. It combines form handling, data aggregation (grouping and summing — the same ideas as SQL’s GROUP BY) and data visualisation.",
    stack: ["React (or vanilla JavaScript)", "A charting library or SVG", "localStorage"],
    skills: [{ label: "Array methods: map, filter, reduce", href: "/playground" }, { label: "Grouping and aggregation", href: "/sql-lab" }],
    objectives: [
      "Design a data model for transactions",
      "Aggregate data by category and by month",
      "Visualise data with a chart",
      "Validate numeric and date input",
      "Import and export data as CSV",
    ],
    steps: [
      { title: "Define the model", details: "Each expense: { id, amount, category, date, note }. Store amounts in cents (integers) to avoid floating-point rounding errors." },
      { title: "Build the entry form", details: "Validate that the amount is positive, the date is valid and a category is chosen. Show errors next to the fields." },
      { title: "List and filter", details: "Show expenses newest first, with filters for month and category, and the ability to edit or delete an entry." },
      { title: "Summaries", details: "Compute totals per category and per month with reduce. Show the month’s total and its biggest category." },
      { title: "Chart it", details: "Draw a bar or donut chart of spending by category for the selected month. Label values directly so the chart is readable without a legend." },
      { title: "Import / export", details: "Export all expenses as CSV and import a CSV back, reporting any rows that fail validation." },
    ],
    checklist: [
      "Can add, edit and delete expenses",
      "Invalid amounts and dates are rejected with clear messages",
      "Amounts are stored as integers (cents)",
      "Totals per category and per month are correct",
      "A chart shows spending by category",
      "Can filter by month and category",
      "CSV export and import work",
      "Data persists between visits",
    ],
    stretch: ["Monthly budgets per category with warnings", "Recurring expenses", "Multiple currencies"],
  },
  {
    slug: "rest-api",
    title: "REST API",
    level: "Intermediate",
    summary: "A documented CRUD API backed by a real database.",
    overview:
      "Build a REST API for a small domain — for example a library of books and authors — with full create, read, update and delete operations, validation, pagination and tests. It’s the backbone of almost every web and mobile app.",
    stack: ["Node.js", "Express (or Fastify)", "SQLite or PostgreSQL", "A test runner"],
    skills: [{ label: "SQL: SELECT, JOIN, INSERT, UPDATE, DELETE", href: "/sql-lab" }, { label: "HTTP methods and status codes" }, { label: "JSON" }],
    objectives: [
      "Design resource-oriented URLs and choose correct HTTP methods and status codes",
      "Use parameterised SQL queries (never string concatenation) to prevent SQL injection",
      "Validate request bodies and return consistent error responses",
      "Paginate and filter list endpoints",
      "Write automated tests for your endpoints",
    ],
    steps: [
      { title: "Design the resources", details: "Write down the endpoints before coding, e.g. GET /books, GET /books/:id, POST /books, PATCH /books/:id, DELETE /books/:id, and the status codes each returns (200, 201, 204, 400, 404)." },
      { title: "Create the schema", details: "Define tables with primary keys, foreign keys and constraints. Add a migration or setup script so the database can be recreated from scratch." },
      { title: "Implement CRUD", details: "Implement each endpoint with parameterised queries. Return 404 for missing records and 201 with the new resource for creation." },
      { title: "Validate input", details: "Reject bad input with 400 and a consistent error body such as { error: { field, message } }. Never trust the client." },
      { title: "Paginate and filter", details: "Support ?limit and ?offset (or cursors) and at least one filter, e.g. ?author=…. Cap the maximum page size." },
      { title: "Test and document", details: "Write tests for success and failure cases of every endpoint. Document the API in a README or an OpenAPI file." },
    ],
    checklist: [
      "All CRUD endpoints work for the main resource",
      "Correct status codes for success, bad input and missing records",
      "All SQL uses parameterised queries",
      "Input validation with a consistent error format",
      "List endpoints are paginated",
      "Automated tests cover success and failure cases",
      "Database can be recreated from a setup script",
      "API is documented",
    ],
    stretch: ["Add rate limiting", "Add an OpenAPI spec and generate interactive docs", "Containerise it with Docker"],
  },
  {
    slug: "authentication-system",
    title: "Authentication System",
    level: "Advanced",
    summary: "Secure sign-up, sign-in and sessions — done properly.",
    overview:
      "Build user registration, login, logout and protected routes, following current security practice. Authentication is easy to get subtly wrong, so this project is as much about understanding threats (credential stuffing, session hijacking, CSRF) as writing code.",
    stack: ["Node.js", "Express", "A database", "argon2 or bcrypt", "HTTP-only cookies"],
    skills: [{ label: "Building a REST API", href: "/projects/rest-api" }, { label: "Hash tables and hashing", href: "/visualize/data-structures/hash-table" }],
    objectives: [
      "Store passwords with a slow, salted hash (argon2id or bcrypt) — never plain text or fast hashes",
      "Manage sessions with secure, HTTP-only, SameSite cookies",
      "Protect against CSRF, brute force and user enumeration",
      "Implement password reset with single-use, expiring tokens",
    ],
    steps: [
      { title: "Model users and sessions", details: "Users have a unique, normalised email and a password hash. Sessions have a random identifier (from a cryptographically secure generator), a user id and an expiry." },
      { title: "Registration", details: "Validate the email and enforce a sensible minimum password length. Hash the password with argon2id or bcrypt before storing it." },
      { title: "Login and sessions", details: "Verify the password with the library’s constant-time compare. On success, create a session and set it in a cookie with HttpOnly, Secure and SameSite=Lax. Return the same error for “unknown email” and “wrong password”." },
      { title: "Protect routes", details: "Add middleware that loads the session from the cookie and rejects requests without a valid, unexpired session. Regenerate the session id on login." },
      { title: "Defend against attacks", details: "Rate-limit login attempts per account and per IP, add CSRF protection for state-changing requests, and log out by deleting the session server-side." },
      { title: "Password reset", details: "Email a link containing a random, single-use token that expires (e.g. after 30 minutes). Store only a hash of the token, and invalidate other sessions after a reset." },
    ],
    checklist: [
      "Passwords are hashed with argon2id or bcrypt",
      "Session cookie is HttpOnly, Secure and SameSite",
      "Login errors don’t reveal whether an email exists",
      "Login attempts are rate-limited",
      "Protected routes reject missing or expired sessions",
      "Logout invalidates the session on the server",
      "CSRF protection on state-changing requests",
      "Password reset tokens are single-use and expire",
    ],
    stretch: ["Add TOTP two-factor authentication", "Support passkeys (WebAuthn)", "Add “sign in with” OAuth providers"],
  },
  {
    slug: "full-stack-app",
    title: "Full-Stack Application",
    level: "Advanced",
    summary: "Design, build, test and deploy a complete app end to end.",
    overview:
      "Combine everything into one product: a frontend, an API, a database, authentication and a deployment pipeline. Pick an idea you care about — a habit tracker, a recipe planner, a study-group organiser — and ship a version real people can use.",
    stack: ["React / Next.js", "Node.js API or server actions", "PostgreSQL", "Authentication", "CI/CD and hosting"],
    skills: [
      { label: "REST API", href: "/projects/rest-api" },
      { label: "Authentication", href: "/projects/authentication-system" },
      { label: "SQL and data modelling", href: "/sql-lab" },
    ],
    objectives: [
      "Turn an idea into scoped user stories and a data model",
      "Build a typed frontend that talks to your own API",
      "Write unit, integration and end-to-end tests",
      "Set up continuous integration and deploy to production",
      "Monitor errors and iterate on feedback",
    ],
    steps: [
      { title: "Scope the MVP", details: "Write 5–8 user stories (“As a … I want … so that …”) and cut everything not needed for a first useful version. Sketch the main screens." },
      { title: "Model the data", details: "Draw the entities and relationships, then write the schema with constraints and indexes for the queries you’ll run most." },
      { title: "Build the API", details: "Implement the endpoints or server actions for your user stories, with validation and authorisation checks on every request." },
      { title: "Build the frontend", details: "Build the screens with real data, including loading, empty and error states. Keep components small and reusable." },
      { title: "Test", details: "Unit-test business logic, integration-test the API against a test database, and write a few end-to-end tests for the critical flows." },
      { title: "Ship it", details: "Set up CI to run tests on every push, deploy to a hosting provider with environment variables for secrets, and add error monitoring." },
    ],
    checklist: [
      "MVP scope is written down as user stories",
      "Database schema with constraints and indexes",
      "Authentication and authorisation on every protected action",
      "Loading, empty and error states in the UI",
      "Automated tests run in CI on every push",
      "Secrets are stored in environment variables, not in code",
      "App is deployed and publicly reachable",
      "At least one real user has tried it and given feedback",
    ],
    stretch: ["Add real-time updates with WebSockets", "Add analytics that respect privacy", "Write a technical blog post about what you learned"],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const projectLevels: ProjectLevel[] = ["Beginner", "Intermediate", "Advanced"];
