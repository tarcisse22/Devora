import type { Subject } from "../types";

export const fundamentals: Subject = {
  slug: "programming-fundamentals",
  name: "Programming Fundamentals",
  description: "The building blocks every program is made of: values, variables, decisions, repetition and functions.",
  lessons: [
    {
      slug: "variables-and-types",
      title: "Variables and Types",
      summary: "How programs store values, and why every value has a type.",
      blocks: [
        { type: "p", text: "A program works with **values** — numbers, text, true/false. A **variable** is a name that refers to a value so you can use it later. Assigning a new value to the variable changes what the name refers to." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "Declaring and updating variables",
          code: `let score = 10;        // a number
const name = "Ada";    // a string (text)
let passed = score >= 5; // a boolean: true

score = score + 5;     // reassign: score is now 15
console.log(name, score, passed);`,
        },
        { type: "h", text: "Types" },
        { type: "p", text: "Every value has a **type** that decides what you can do with it: you can add numbers, join strings and negate booleans. Common primitive types are numbers, strings, booleans and a value meaning “nothing” (`null` / `undefined` in JavaScript, `None` in Python). Collections such as arrays and objects group many values together." },
        {
          type: "code",
          language: "python",
          runnable: true,
          caption: "Python is dynamically typed: a value carries its type",
          code: `age = 21
height = 1.75
name = "Grace"
tags = ["student", "cs"]

print(type(age), type(height), type(name), type(tags))
print(name + " is " + str(age))  # convert before joining`,
        },
        { type: "callout", tone: "warning", text: "Mixing types can surprise you. In JavaScript `\"5\" + 1` is the string `\"51\"`, while `\"5\" - 1` is the number `4`. Convert explicitly (`Number(x)`, `String(x)`) instead of relying on automatic coercion." },
        { type: "h", text: "const vs let" },
        { type: "p", text: "In JavaScript, use `const` when a name should always refer to the same value and `let` when you’ll reassign it. `const` doesn’t make objects immutable — you can still change the contents of a `const` array — it just stops the name from being pointed somewhere else." },
      ],
      quiz: [
        { question: "What does `\"5\" + 1` evaluate to in JavaScript?", options: ["6", "\"51\"", "An error", "\"6\""], answer: 1, explanation: "With a string on either side, + concatenates, so the number 1 is converted to the string \"1\"." },
        { question: "Which statement about `const arr = [1, 2]` is true?", options: ["arr.push(3) throws an error", "arr = [3] is allowed", "arr.push(3) works, but arr = [3] throws", "Both operations work"], answer: 2, explanation: "const prevents reassigning the name, not changing the array it refers to." },
      ],
      related: [
        { label: "Control flow", href: "/learn/programming-fundamentals/control-flow" },
        { label: "Open the Playground", href: "/playground" },
      ],
    },
    {
      slug: "control-flow",
      title: "Control Flow: Conditions and Loops",
      summary: "Making decisions with if/else and repeating work with loops.",
      blocks: [
        { type: "p", text: "By default code runs top to bottom. **Control flow** statements change that: conditions choose between paths, and loops repeat a block while something is true." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "if / else if / else picks exactly one branch",
          code: `const temperature = 23;

if (temperature > 30) {
  console.log("hot");
} else if (temperature > 15) {
  console.log("mild");
} else {
  console.log("cold");
}`,
        },
        { type: "h", text: "Loops" },
        { type: "p", text: "A `for` loop is ideal when you know how many times to repeat; a `while` loop repeats until a condition becomes false. `break` exits a loop early and `continue` skips to the next iteration." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "Sum the even numbers from 1 to 10",
          code: `let total = 0;
for (let i = 1; i <= 10; i++) {
  if (i % 2 !== 0) continue; // skip odd numbers
  total += i;
}
console.log(total); // 30`,
        },
        { type: "tool", href: "/code-tracer", title: "Watch a loop run", text: "Open any example on this page in the Code Tracer to see the loop variable and total change on every iteration." },
        { type: "callout", tone: "warning", text: "Every loop needs a way to stop. A `while (true)` loop with no `break`, or a condition that never becomes false, runs forever — Devora’s sandbox stops such programs after a few seconds." },
      ],
      quiz: [
        { question: "How many times does `for (let i = 0; i < 5; i++)` run its body?", options: ["4", "5", "6", "Forever"], answer: 1, explanation: "i takes the values 0, 1, 2, 3 and 4 — five iterations." },
        { question: "What does `continue` do inside a loop?", options: ["Exits the loop", "Skips the rest of this iteration", "Restarts the loop from the first iteration", "Pauses the program"], answer: 1, explanation: "continue jumps straight to the next iteration; break would exit the loop." },
      ],
      related: [
        { label: "Functions and recursion", href: "/learn/programming-fundamentals/functions-and-recursion" },
        { label: "Practice: FizzBuzz List", href: "/practice/fizzbuzz" },
      ],
    },
    {
      slug: "functions-and-recursion",
      title: "Functions and Recursion",
      summary: "Packaging logic into reusable functions — including functions that call themselves.",
      blocks: [
        { type: "p", text: "A **function** is a named, reusable piece of logic. It takes **parameters**, does some work and **returns** a result. Good functions do one thing and have a descriptive name." },
        {
          type: "code",
          language: "python",
          runnable: true,
          code: `def area(width, height):
    """Return the area of a rectangle."""
    return width * height

print(area(3, 4))   # 12
print(area(10, 2))  # 20`,
        },
        { type: "h", text: "The call stack" },
        { type: "p", text: "Each time a function is called, the program pushes a **frame** onto the call stack holding that call’s parameters and local variables. When the function returns, its frame is popped and execution continues where it was called from." },
        { type: "h", text: "Recursion" },
        { type: "p", text: "A **recursive** function calls itself on a smaller version of the problem. It needs a **base case** that stops the recursion, and a **recursive case** that moves towards it." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "n! = n × (n − 1)!, and 1! = 1",
          code: `function factorial(n) {
  if (n <= 1) return 1;          // base case
  return n * factorial(n - 1);   // recursive case
}

console.log(factorial(5)); // 120`,
        },
        { type: "tool", href: "/code-tracer", title: "See the call stack grow", text: "Trace the factorial example to watch one frame per call pile up, then unwind as each call returns its value." },
        { type: "callout", tone: "tip", text: "Without a reachable base case, recursion never stops and eventually overflows the call stack. Always check: does every call get closer to the base case?" },
      ],
      quiz: [
        { question: "What does every recursive function need to terminate?", options: ["A loop", "A base case", "A global variable", "At least two parameters"], answer: 1, explanation: "The base case returns without recursing, which stops the chain of calls." },
        { question: "When factorial(3) calls factorial(2), what happens to factorial(3)’s frame?", options: ["It is deleted", "It stays on the call stack, waiting for the result", "It is copied into factorial(2)", "It returns immediately"], answer: 1, explanation: "The caller’s frame waits on the stack until the callee returns its value." },
      ],
      related: [
        { label: "Stacks and queues", href: "/learn/data-structures/stacks-and-queues" },
        { label: "Code Tracer", href: "/code-tracer" },
      ],
    },
  ],
};

export const dataStructuresSubject: Subject = {
  slug: "data-structures",
  name: "Data Structures",
  description: "Ways of organising data so the operations you need are fast.",
  lessons: [
    {
      slug: "arrays-and-linked-lists",
      title: "Arrays and Linked Lists",
      summary: "Two ways to store a sequence — and the trade-offs between them.",
      blocks: [
        { type: "p", text: "An **array** stores elements in one contiguous block of memory. Because every element has the same size, the address of element `i` is `start + i × size`, so **access by index is O(1)**. The cost: inserting or deleting in the middle means shifting every later element, which is **O(n)**." },
        { type: "diagram", caption: "An array: neighbours in memory", text: "index:   0    1    2    3\n       ┌────┬────┬────┬────┐\nvalue: │ 12 │ 45 │  7 │ 23 │\n       └────┴────┴────┴────┘" },
        { type: "p", text: "A **linked list** stores each element in a separate **node** that also holds a pointer to the next node. Nodes can live anywhere in memory. Inserting at the head is **O(1)** — just re-point two pointers — but finding element `i` means following `i` pointers from the head: **O(n)**." },
        { type: "diagram", caption: "A singly linked list", text: "head → [3|•] → [8|•] → [15|•] → null" },
        { type: "tool", href: "/visualize/data-structures/linked-list", title: "Operate on a linked list", text: "Insert, delete, search and reverse nodes and watch the pointers move." },
        {
          type: "list",
          items: ["Need fast random access or iterate a lot? Use an array.", "Need frequent inserts/removals at the ends or in the middle of a known position? A linked list (or a deque) can help.", "In practice, arrays are often faster even for inserts on small data, because they are cache-friendly."],
        },
      ],
      quiz: [
        { question: "What is the cost of reading element i of an array?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 0, explanation: "The address is computed directly from the index." },
        { question: "Why is inserting at the front of an array O(n)?", options: ["The array must be sorted again", "Every existing element shifts one place", "Memory must be zeroed", "It isn’t — it’s O(1)"], answer: 1, explanation: "All n elements move right to make room at index 0." },
      ],
      related: [
        { label: "Array visualizer", href: "/visualize/data-structures/array" },
        { label: "Big-O notation", href: "/learn/algorithms/big-o-notation" },
      ],
    },
    {
      slug: "stacks-and-queues",
      title: "Stacks and Queues",
      summary: "LIFO and FIFO: two restricted structures that show up everywhere.",
      blocks: [
        { type: "p", text: "A **stack** allows adding and removing only at the top: **last in, first out (LIFO)**. Its operations are `push`, `pop` and `peek`, all O(1). Function calls, undo history and checking balanced brackets all use stacks." },
        { type: "p", text: "A **queue** adds at the rear and removes from the front: **first in, first out (FIFO)**. Its operations are `enqueue`, `dequeue` and `peek`. Task scheduling, buffering and breadth-first search use queues." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "Checking balanced brackets with a stack",
          code: `function isBalanced(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}

console.log(isBalanced("{[()]}")); // true
console.log(isBalanced("([)]"));   // false`,
        },
        { type: "callout", tone: "note", text: "Using `array.shift()` as a queue’s dequeue is O(n) in JavaScript because every element moves. Real queues use a circular buffer, a linked list or two stacks for O(1) operations." },
        { type: "tool", href: "/visualize/data-structures/stack", title: "Push and pop", text: "Try the stack and queue visualizers to see LIFO and FIFO side by side." },
      ],
      quiz: [
        { question: "You push 1, 2, 3 onto a stack and pop once. What do you get?", options: ["1", "2", "3", "The stack is empty"], answer: 2, explanation: "The last value pushed (3) is the first popped." },
        { question: "Which structure does breadth-first search use to decide what to visit next?", options: ["Stack", "Queue", "Hash table", "Heap"], answer: 1, explanation: "BFS processes nodes in the order they were discovered — FIFO." },
      ],
      related: [
        { label: "Practice: Balanced Brackets", href: "/practice/balanced-brackets" },
        { label: "Queue visualizer", href: "/visualize/data-structures/queue" },
      ],
    },
    {
      slug: "hash-tables",
      title: "Hash Tables",
      summary: "How dictionaries and maps find values in constant time on average.",
      blocks: [
        { type: "p", text: "A **hash table** stores key–value pairs. A **hash function** turns each key into a number, which is reduced to a **bucket index** (for example with `% buckets`). To find a key, hash it and look only in that bucket — no scanning of the whole table." },
        { type: "diagram", caption: "Keys hashed into buckets (chaining)", text: "hash(\"apple\") % 7 = 3\n\n[0] → empty\n[1] → (\"fig\", 4)\n[2] → empty\n[3] → (\"apple\", 3) → (\"date\", 9)\n[4] → (\"banana\", 7)" },
        { type: "p", text: "Different keys can hash to the same bucket — a **collision**. With **chaining**, each bucket holds a small list. As long as the **load factor** (entries ÷ buckets) stays low, chains are short and `get`, `put` and `remove` are **O(1) on average**. When the table gets too full, it **resizes** and rehashes every key." },
        {
          type: "code",
          language: "python",
          runnable: true,
          caption: "Python dicts are hash tables",
          code: `counts = {}
for word in "the cat and the hat and the bat".split():
    counts[word] = counts.get(word, 0) + 1

print(counts)
print(counts["the"])  # 3 — found without scanning`,
        },
        { type: "callout", tone: "warning", text: "Worst case, every key collides into one bucket and operations degrade to O(n). Good hash functions spread keys evenly; some languages also randomise hashing to resist attacks that deliberately cause collisions." },
        { type: "tool", href: "/visualize/data-structures/hash-table", title: "Hash keys yourself", text: "Put, get and remove keys and watch which bucket each lands in." },
      ],
      quiz: [
        { question: "What is the average cost of looking up a key in a well-sized hash table?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 0, explanation: "Only one short bucket is searched on average." },
        { question: "What is a collision?", options: ["Two keys with the same value", "Two different keys mapping to the same bucket", "A key that can’t be hashed", "Running out of memory"], answer: 1, explanation: "Collisions are expected; chaining or open addressing resolves them." },
      ],
      related: [
        { label: "Practice: Two Sum", href: "/practice/two-sum" },
        { label: "Hash table visualizer", href: "/visualize/data-structures/hash-table" },
      ],
    },
  ],
};
