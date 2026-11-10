export type TracerExample = { id: string; title: string; code: string };

export const tracerExamples: TracerExample[] = [
  {
    id: "sum",
    title: "Loop: sum an array",
    code: `const numbers = [4, 8, 15, 16];
let total = 0;

for (let i = 0; i < numbers.length; i++) {
  total += numbers[i];
}

console.log("total:", total);
`,
  },
  {
    id: "factorial",
    title: "Recursion: factorial",
    code: `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

const result = factorial(4);
console.log(result);
`,
  },
  {
    id: "fibonacci",
    title: "Recursion: Fibonacci tree",
    code: `function fib(n) {
  if (n < 2) return n;
  const a = fib(n - 1);
  const b = fib(n - 2);
  return a + b;
}

console.log(fib(4));
`,
  },
  {
    id: "closure",
    title: "Closures: a counter",
    code: `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}

const next = makeCounter();
next();
next();
console.log("count is", next());
`,
  },
  {
    id: "bubble",
    title: "Bubble sort",
    code: `const items = [5, 2, 9, 1];

for (let i = 0; i < items.length - 1; i++) {
  for (let j = 0; j < items.length - 1 - i; j++) {
    if (items[j] > items[j + 1]) {
      const tmp = items[j];
      items[j] = items[j + 1];
      items[j + 1] = tmp;
    }
  }
}

console.log(items);
`,
  },
  {
    id: "binary-search",
    title: "Binary search",
    code: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(binarySearch([3, 8, 12, 19, 27, 33, 41], 27));
`,
  },
];
