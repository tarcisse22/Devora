import type { Subject } from "../types";

export const osSubject: Subject = {
  slug: "operating-systems",
  name: "Operating Systems",
  description: "How the OS shares one machine between many programs: processes, scheduling and memory.",
  lessons: [
    {
      slug: "processes-and-threads",
      title: "Processes and Threads",
      summary: "The units of execution an operating system manages.",
      blocks: [
        { type: "p", text: "A **process** is a running program with its own private memory (address space), open files and at least one thread. Processes are isolated from each other: one crashing doesn’t corrupt another’s memory." },
        { type: "p", text: "A **thread** is a sequence of execution inside a process. Threads in the same process **share memory**, which makes communication cheap but introduces **race conditions** when two threads update the same data without coordination." },
        { type: "diagram", caption: "Two processes, one with two threads", text: "┌──────── Process A ────────┐   ┌─── Process B ───┐\n│ memory: code, heap, data  │   │ memory          │\n│ ┌ thread 1 ┐ ┌ thread 2 ┐ │   │ ┌ thread 1 ┐    │\n│ │ stack    │ │ stack    │ │   │ │ stack    │    │\n│ └──────────┘ └──────────┘ │   │ └──────────┘    │\n└───────────────────────────┘   └─────────────────┘" },
        { type: "h", text: "Process states" },
        { type: "list", items: ["**New** → **Ready**: created and waiting for a CPU.", "**Running**: executing on a CPU core.", "**Blocked/Waiting**: waiting for I/O, a lock or a timer.", "**Terminated**: finished; its resources are released."] },
        { type: "callout", tone: "note", text: "A **context switch** saves the running thread’s registers and loads another’s. It lets one core run many threads, but each switch costs time." },
        { type: "p", text: "JavaScript in browsers runs your code on a single thread with an **event loop**; Devora’s Playground runs your code in a separate **Web Worker** — a different thread — which is why an infinite loop there doesn’t freeze the page." },
      ],
      quiz: [
        { question: "What do threads of the same process share?", options: ["Nothing", "Their memory (address space)", "Their stacks", "Their CPU registers"], answer: 1, explanation: "Threads share heap and globals, but each has its own stack and registers." },
        { question: "A process waiting for a disk read is in which state?", options: ["Running", "Ready", "Blocked / waiting", "Terminated"], answer: 2, explanation: "It can’t run until the I/O completes." },
      ],
      related: [{ label: "CPU scheduling", href: "/learn/operating-systems/cpu-scheduling" }],
    },
    {
      slug: "cpu-scheduling",
      title: "CPU Scheduling",
      summary: "Deciding which ready process runs next.",
      blocks: [
        { type: "p", text: "When several processes are ready, the **scheduler** picks which runs next. Goals conflict: maximise throughput, minimise waiting time and keep interactive programs responsive." },
        {
          type: "list",
          items: [
            "**First-Come, First-Served (FCFS):** simple, but a long job makes everyone behind it wait (the convoy effect).",
            "**Shortest Job First (SJF):** minimises average waiting time, but needs to know job lengths and can starve long jobs.",
            "**Round Robin (RR):** each process gets a fixed **time slice**, then goes to the back of the queue. Fair and responsive.",
            "**Priority scheduling:** higher-priority jobs first; **aging** raises the priority of waiting jobs to prevent starvation.",
          ],
        },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          caption: "Round-robin scheduling with a time slice of 2",
          code: `const jobs = [
  { name: "A", left: 5 },
  { name: "B", left: 2 },
  { name: "C", left: 3 },
];
const queue = [...jobs];
const slice = 2;
let time = 0;

while (queue.length) {
  const job = queue.shift();
  const run = Math.min(slice, job.left);
  time += run;
  job.left -= run;
  console.log(\`t=\${time}: ran \${job.name} for \${run}\`);
  if (job.left > 0) queue.push(job);
  else console.log(\`  \${job.name} finished at t=\${time}\`);
}`,
        },
        { type: "tool", href: "/visualize/data-structures/queue", title: "Round robin is a queue", text: "The ready list in round robin behaves exactly like a FIFO queue." },
      ],
      quiz: [
        { question: "Which algorithm gives every process a fixed time slice in turn?", options: ["FCFS", "SJF", "Round Robin", "Priority"], answer: 2, explanation: "Round robin cycles through the ready queue." },
        { question: "What problem does aging solve?", options: ["Memory leaks", "Starvation of low-priority processes", "Deadlock", "Slow context switches"], answer: 1, explanation: "Waiting processes gradually gain priority until they run." },
      ],
      related: [{ label: "Memory and virtual memory", href: "/learn/operating-systems/memory" }],
    },
    {
      slug: "memory",
      title: "Memory and Virtual Memory",
      summary: "How each process gets its own private view of memory.",
      blocks: [
        { type: "p", text: "Each process sees a **virtual address space** that looks like one large, private block of memory. The OS and the CPU’s **memory management unit (MMU)** translate virtual addresses into physical RAM addresses using **page tables**." },
        { type: "diagram", caption: "Virtual pages map to physical frames", text: "Process A virtual pages      Physical RAM frames\n  page 0 ─────────────────►  frame 7\n  page 1 ─────────────────►  frame 2\n  page 2 ─── (on disk) ───   swap" },
        { type: "list", items: ["**Isolation:** a process can’t read another’s memory, because it has no mapping to it.", "**Paging:** memory is split into fixed-size pages (often 4 KiB) so it can be allocated flexibly.", "**Page fault:** touching a page that isn’t in RAM traps into the OS, which loads it (e.g. from disk) and resumes.", "**Swapping:** rarely used pages can be moved to disk when RAM is full."] },
        { type: "h", text: "Stack vs heap" },
        { type: "p", text: "Inside a process, the **stack** holds function frames and local variables and is freed automatically when functions return. The **heap** holds data allocated at runtime (`malloc` in C, objects in JavaScript) that lives until it is freed or garbage-collected." },
        {
          type: "code",
          language: "c",
          runnable: true,
          caption: "Stack and heap allocation in C",
          code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int on_stack = 42;                 // freed when main returns
    int *on_heap = malloc(sizeof(int)); // lives until free()
    *on_heap = 7;
    printf("stack: %d, heap: %d\\n", on_stack, *on_heap);
    free(on_heap);
    return 0;
}`,
        },
      ],
      quiz: [
        { question: "What translates virtual addresses to physical addresses?", options: ["The compiler", "The MMU using page tables", "The hard disk", "The scheduler"], answer: 1, explanation: "Hardware (MMU) uses OS-managed page tables." },
        { question: "Where does memory from malloc come from?", options: ["The stack", "The heap", "The CPU cache", "The page table"], answer: 1, explanation: "Dynamic allocations come from the heap and must be freed." },
      ],
      related: [{ label: "Run C in the Playground", href: "/playground" }],
    },
  ],
};

export const databasesSubject: Subject = {
  slug: "database-systems",
  name: "Database Systems",
  description: "Storing, querying and protecting structured data with relational databases.",
  lessons: [
    {
      slug: "relational-model",
      title: "The Relational Model",
      summary: "Tables, rows, keys and relationships.",
      blocks: [
        { type: "p", text: "A relational database stores data in **tables**. Each **row** is one record and each **column** has a name and type. A **primary key** uniquely identifies each row; a **foreign key** is a column that refers to another table’s primary key, linking the two." },
        { type: "diagram", caption: "students ←— enrollments —→ courses", text: "students              enrollments                    courses\n┌────┬───────┐        ┌────────────┬───────────┐    ┌────┬───────┐\n│ id │ name  │◄───────│ student_id │ course_id │───►│ id │ code  │\n└────┴───────┘        └────────────┴───────────┘    └────┴───────┘" },
        { type: "p", text: "The `enrollments` table resolves a **many-to-many** relationship: one student takes many courses and one course has many students. **Constraints** (`NOT NULL`, `UNIQUE`, `CHECK`, foreign keys) let the database reject invalid data." },
        {
          type: "code",
          language: "sql",
          caption: "Defining tables with keys and constraints",
          code: `CREATE TABLE students (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER CHECK (year BETWEEN 1 AND 4)
);

CREATE TABLE enrollments (
  student_id INTEGER REFERENCES students(id),
  course_id  INTEGER REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);`,
        },
        { type: "tool", href: "/sql-lab", title: "Explore a real schema", text: "The SQL Lab’s sample database uses exactly these relationships. Open the schema panel to see every key." },
      ],
      quiz: [
        { question: "What does a foreign key do?", options: ["Encrypts a column", "References a primary key in another table", "Sorts the table", "Speeds up every query"], answer: 1, explanation: "It links rows across tables and can be enforced by the database." },
        { question: "How is a many-to-many relationship usually stored?", options: ["In one table with a list column", "With a junction table holding two foreign keys", "With two primary keys per table", "It can’t be stored"], answer: 1, explanation: "A junction (link) table like enrollments has one row per pairing." },
      ],
      related: [{ label: "SQL queries and joins", href: "/learn/database-systems/sql-queries-and-joins" }],
    },
    {
      slug: "sql-queries-and-joins",
      title: "SQL Queries and Joins",
      summary: "Filtering, grouping and combining tables.",
      blocks: [
        { type: "p", text: "SQL is **declarative**: you describe the result you want and the database works out how to get it. A query reads clauses in a logical order: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`." },
        {
          type: "code",
          language: "sql",
          runnable: true,
          caption: "Average GPA per major, best first",
          code: `SELECT major, COUNT(*) AS students, ROUND(AVG(gpa), 2) AS avg_gpa
FROM students
WHERE major IS NOT NULL
GROUP BY major
ORDER BY avg_gpa DESC;`,
        },
        { type: "h", text: "Joins" },
        { type: "list", items: ["**INNER JOIN** keeps only rows that match in both tables.", "**LEFT JOIN** keeps every row from the left table, filling missing matches with `NULL`.", "A **self join** joins a table to itself — for example employees to their managers."] },
        {
          type: "code",
          language: "sql",
          runnable: true,
          code: `SELECT s.name, c.title, e.grade
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses  c ON c.id = e.course_id
WHERE e.grade = 'A';`,
        },
        { type: "callout", tone: "warning", text: "`NULL` means unknown, so `x = NULL` is never true. Use `IS NULL` / `IS NOT NULL`." },
        { type: "tool", href: "/sql-lab", title: "Run these queries", text: "Every query on this page runs against the SQL Lab’s sample data — try changing them." },
      ],
      quiz: [
        { question: "Which clause filters groups after aggregation?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1, explanation: "WHERE filters rows before grouping; HAVING filters the groups." },
        { question: "A LEFT JOIN from students to enrollments includes…", options: ["Only students with enrollments", "All students, with NULLs where there is no enrollment", "Only enrollments", "Every combination of rows"], answer: 1, explanation: "Left rows are always kept." },
      ],
      related: [
        { label: "Open the SQL Lab", href: "/sql-lab" },
        { label: "Normalization and transactions", href: "/learn/database-systems/normalization-and-transactions" },
      ],
    },
    {
      slug: "normalization-and-transactions",
      title: "Normalization and Transactions",
      summary: "Designing tables without redundancy, and keeping data consistent.",
      blocks: [
        { type: "p", text: "**Normalization** organises tables to remove redundancy. If a course’s title were repeated in every enrollment row, renaming the course would require updating many rows — and missing one leaves the data inconsistent (an **update anomaly**)." },
        { type: "list", items: ["**1NF:** each column holds a single value; no repeating groups.", "**2NF:** every non-key column depends on the whole key.", "**3NF:** non-key columns depend only on the key, not on other non-key columns."] },
        { type: "h", text: "Transactions and ACID" },
        { type: "p", text: "A **transaction** groups statements so they succeed or fail together. Transferring money means debiting one account and crediting another — never just one of the two." },
        {
          type: "code",
          language: "sql",
          code: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK; to undo both`,
        },
        { type: "list", items: ["**Atomicity:** all or nothing.", "**Consistency:** constraints hold before and after.", "**Isolation:** concurrent transactions don’t see each other’s partial work.", "**Durability:** once committed, data survives crashes."] },
      ],
      quiz: [
        { question: "What does atomicity guarantee?", options: ["Queries are fast", "All statements in a transaction take effect, or none do", "Data is encrypted", "Tables are normalized"], answer: 1, explanation: "A failed transaction is rolled back completely." },
        { question: "Storing a course title in every enrollment row risks…", options: ["Update anomalies", "Faster joins", "Stronger isolation", "Nothing"], answer: 0, explanation: "Redundant copies can drift out of sync." },
      ],
      related: [{ label: "Project: REST API", href: "/projects/rest-api" }],
    },
  ],
};
