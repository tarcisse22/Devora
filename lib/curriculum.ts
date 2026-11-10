/**
 * Planned content catalogues. These describe what Devora will cover; they are
 * not claims about content that already exists. Pages render them with the
 * owning feature's status label.
 */

export const learnSubjects = [
  { name: "Programming Fundamentals", topics: ["Variables & types", "Control flow", "Functions", "Recursion"] },
  { name: "Data Structures", topics: ["Arrays", "Linked lists", "Stacks & queues", "Trees", "Hash tables"] },
  { name: "Algorithms", topics: ["Complexity", "Sorting", "Searching", "Graph algorithms"] },
  { name: "Object-Oriented Programming", topics: ["Classes & objects", "Inheritance", "Polymorphism", "Design principles"] },
  { name: "Operating Systems", topics: ["Processes & threads", "Scheduling", "Memory", "File systems"] },
  { name: "Database Systems", topics: ["Relational model", "SQL", "Normalisation", "Transactions"] },
  { name: "Computer Networks", topics: ["Network layers", "TCP/IP", "HTTP", "DNS"] },
  { name: "Software Engineering", topics: ["Version control", "Testing", "Architecture", "Delivery"] },
] as const;

export const dataStructureCatalog = [
  "Arrays",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Binary Trees",
  "Binary Search Trees",
  "Heaps",
  "Hash Tables",
  "Graphs",
] as const;

export const projectCatalog = [
  { name: "Personal Portfolio", level: "Beginner" },
  { name: "Task Manager", level: "Beginner" },
  { name: "Weather Application", level: "Intermediate" },
  { name: "Expense Tracker", level: "Intermediate" },
  { name: "REST API", level: "Intermediate" },
  { name: "Authentication System", level: "Advanced" },
  { name: "Full-Stack Application", level: "Advanced" },
] as const;

export const playgroundLanguages = ["JavaScript", "TypeScript", "Python", "Java"] as const;

export const sqlDatasets = ["Students", "Courses", "Employees", "Departments"] as const;
