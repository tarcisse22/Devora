import type { PlaygroundLanguage } from "./languages";

export type Example = { id: string; title: string; code: string };

export const examples: Record<PlaygroundLanguage, Example[]> = {
  javascript: [
    {
      id: "hello",
      title: "Hello, Devora",
      code: `// Press Run (or Ctrl/⌘ + Enter) to execute.
const name = "Devora";
console.log(\`Hello, \${name}!\`);

const squares = [1, 2, 3, 4, 5].map((n) => n * n);
console.log("Squares:", squares);
`,
    },
    {
      id: "fizzbuzz",
      title: "FizzBuzz",
      code: `for (let i = 1; i <= 15; i++) {
  let out = "";
  if (i % 3 === 0) out += "Fizz";
  if (i % 5 === 0) out += "Buzz";
  console.log(out || i);
}
`,
    },
    {
      id: "binary-search",
      title: "Binary search",
      code: `function binarySearch(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

const data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log("index of 23:", binarySearch(data, 23));
console.log("index of 7:", binarySearch(data, 7));
`,
    },
    {
      id: "async",
      title: "Promises & async",
      code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function task(name, ms) {
  await wait(ms);
  console.log(\`\${name} finished after \${ms}ms\`);
  return name;
}

const results = await Promise.all([task("A", 300), task("B", 100), task("C", 200)]);
console.log("All done:", results);
`,
    },
  ],
  typescript: [
    {
      id: "generics",
      title: "Interfaces & generics",
      code: `interface Student {
  name: string;
  score: number;
}

function topBy<T>(items: T[], key: (item: T) => number): T | undefined {
  return [...items].sort((a, b) => key(b) - key(a))[0];
}

const students: Student[] = [
  { name: "Ada", score: 91 },
  { name: "Linus", score: 84 },
  { name: "Grace", score: 97 },
];

const best = topBy(students, (s) => s.score);
console.log("Top student:", best?.name);
`,
    },
    {
      id: "union",
      title: "Union types",
      code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 2 },
  { kind: "rect", width: 3, height: 4 },
];
for (const s of shapes) console.log(s.kind, area(s).toFixed(2));
`,
    },
  ],
  python: [
    {
      id: "hello",
      title: "Hello, Devora",
      code: `name = "Devora"
print(f"Hello, {name}!")

squares = [n * n for n in range(1, 6)]
print("Squares:", squares)
`,
    },
    {
      id: "fib",
      title: "Fibonacci with memoisation",
      code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

for n in (10, 30, 80):
    print(f"fib({n}) = {fib(n)}")
`,
    },
    {
      id: "classes",
      title: "Classes",
      code: `class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def __len__(self):
        return len(self._items)


s = Stack()
for ch in "abc":
    s.push(ch)
print("size:", len(s))
print("popped:", s.pop(), s.pop())
`,
    },
  ],
  java: [
    {
      id: "hello",
      title: "Hello, Devora",
      code: `public class Main {
    public static void main(String[] args) {
        String name = "Devora";
        System.out.println("Hello, " + name + "!");
    }
}
`,
    },
  ],
};
