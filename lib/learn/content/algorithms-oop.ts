import type { Subject } from "../types";

export const algorithmsSubject: Subject = {
  slug: "algorithms",
  name: "Algorithms",
  description: "Step-by-step procedures for solving problems — and how to measure how well they scale.",
  lessons: [
    {
      slug: "big-o-notation",
      title: "Big-O Notation",
      summary: "Describing how running time grows as input grows.",
      blocks: [
        { type: "p", text: "**Big-O notation** describes how an algorithm’s work grows with the size of its input, `n`, ignoring constant factors. It answers: if the input doubles, roughly how much more work is done?" },
        {
          type: "list",
          items: [
            "**O(1)** — constant: array access by index, hash table lookup (average).",
            "**O(log n)** — logarithmic: binary search halves the problem each step.",
            "**O(n)** — linear: one pass over the data.",
            "**O(n log n)** — merge sort, and the best general comparison sorts.",
            "**O(n²)** — quadratic: nested loops over the same data, like bubble sort.",
          ],
        },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          caption: "Counting operations makes growth visible",
          code: `function countPairs(n) {
  let ops = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) ops++;
  return ops;
}

for (const n of [10, 20, 40]) {
  console.log(n, "→", countPairs(n), "operations"); // ×4 each time n doubles
}`,
        },
        { type: "p", text: "We usually quote the **worst case**, and drop lower-order terms: `3n² + 5n + 2` is **O(n²)** because for large `n` the `n²` term dominates. Space can be analysed the same way." },
        { type: "callout", tone: "tip", text: "Big-O is about growth, not speed on small inputs. An O(n²) algorithm can beat an O(n log n) one on ten items — but not on ten million." },
      ],
      quiz: [
        { question: "Two nested loops, each over n items. What is the complexity?", options: ["O(n)", "O(2n)", "O(n²)", "O(log n)"], answer: 2, explanation: "The inner loop runs n times for each of the n outer iterations." },
        { question: "What is O(4n² + 100n + 7) simplified?", options: ["O(4n²)", "O(n²)", "O(n² + n)", "O(100n)"], answer: 1, explanation: "Drop constants and lower-order terms." },
      ],
      related: [
        { label: "Sorting algorithms", href: "/learn/algorithms/sorting" },
        { label: "Bubble sort visualizer", href: "/visualize/algorithms/bubble-sort" },
      ],
    },
    {
      slug: "sorting",
      title: "Sorting Algorithms",
      summary: "From simple quadratic sorts to divide-and-conquer.",
      blocks: [
        { type: "p", text: "Sorting puts items in order and makes many other problems easier (searching, finding duplicates, merging). The classic algorithms show very different strategies:" },
        {
          type: "list",
          items: [
            "**Bubble, selection and insertion sort** compare nearby elements and are O(n²). Insertion sort is fast on nearly-sorted data.",
            "**Merge sort** splits the array in half, sorts each half and merges them: always O(n log n), but needs O(n) extra memory.",
            "**Quick sort** partitions around a pivot: O(n log n) on average, O(n²) in the worst case, and very fast in practice.",
          ],
        },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          caption: "Insertion sort: grow a sorted prefix",
          code: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; // shift right
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}

console.log(insertionSort([5, 2, 9, 1, 6]));`,
        },
        { type: "tool", href: "/visualize/algorithms/merge-sort", title: "Compare the sorts", text: "Run each sorting algorithm on the same input size and compare the comparison and write counters." },
        { type: "callout", tone: "note", text: "A sort is **stable** if equal elements keep their original order. Merge sort and insertion sort are stable; selection sort and the usual quick sort are not." },
      ],
      quiz: [
        { question: "Which algorithm is O(n log n) even in the worst case?", options: ["Quick sort", "Merge sort", "Insertion sort", "Bubble sort"], answer: 1, explanation: "Merge sort always splits evenly; quick sort can degrade with bad pivots." },
        { question: "Which sort is a great choice for data that is already almost sorted?", options: ["Selection sort", "Insertion sort", "Merge sort", "Any — they’re all the same"], answer: 1, explanation: "Insertion sort does very few shifts when elements are near their final positions, approaching O(n)." },
      ],
      related: [
        { label: "Quick sort visualizer", href: "/visualize/algorithms/quick-sort" },
        { label: "Practice: Merge Intervals", href: "/practice/merge-intervals" },
      ],
    },
    {
      slug: "binary-search",
      title: "Binary Search",
      summary: "Finding a value in a sorted array in O(log n).",
      blocks: [
        { type: "p", text: "If an array is **sorted**, you don’t need to check every element. Compare the target with the middle element: if it’s smaller, the target can only be in the left half; if larger, the right half. Each comparison halves the search space, so an array of a million elements needs at most about **20 comparisons**." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          code: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(binarySearch([2, 5, 8, 12, 16, 23, 38], 23)); // 5`,
        },
        { type: "callout", tone: "warning", text: "Off-by-one errors are the classic bug: use `lo <= hi` (not `<`) when `hi` is the last valid index, and always move `lo` or `hi` past `mid` so the range shrinks." },
        { type: "tool", href: "/visualize/algorithms/binary-search", title: "Watch the range shrink", text: "Step through binary search and see lo, mid and hi move on each comparison." },
      ],
      quiz: [
        { question: "What must be true for binary search to work?", options: ["The array has no duplicates", "The array is sorted", "The array length is a power of two", "Values are positive"], answer: 1, explanation: "Halving relies on knowing which side the target must be on." },
        { question: "Roughly how many comparisons does binary search need for 1,000,000 sorted items?", options: ["About 20", "About 1,000", "About 500,000", "1,000,000"], answer: 0, explanation: "log₂(1,000,000) ≈ 20." },
      ],
      related: [
        { label: "Linear search visualizer", href: "/visualize/algorithms/linear-search" },
        { label: "Big-O notation", href: "/learn/algorithms/big-o-notation" },
      ],
    },
  ],
};

export const oopSubject: Subject = {
  slug: "object-oriented-programming",
  name: "Object-Oriented Programming",
  description: "Modelling programs as objects that combine data with the behaviour that operates on it.",
  lessons: [
    {
      slug: "classes-and-objects",
      title: "Classes and Objects",
      summary: "Bundling data and behaviour together.",
      blocks: [
        { type: "p", text: "A **class** is a blueprint; an **object** is an instance built from it. The class defines **fields** (the data each object holds) and **methods** (functions that act on that data). The **constructor** sets up a new object’s initial state." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          code: `class BankAccount {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }
  deposit(amount) {
    this.balance += amount;
    return this.balance;
  }
}

const account = new BankAccount("Ada");
account.deposit(50);
console.log(account.owner, account.balance); // Ada 50`,
        },
        { type: "p", text: "Each object has its own copy of the fields: two accounts have independent balances. Methods use `this` (or `self` in Python) to refer to the object they were called on." },
        {
          type: "code",
          language: "python",
          runnable: true,
          code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance_to_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3, 4)
print(p.distance_to_origin())  # 5.0`,
        },
      ],
      quiz: [
        { question: "What is the relationship between a class and an object?", options: ["They are the same thing", "An object is an instance of a class", "A class is an instance of an object", "Objects define classes"], answer: 1, explanation: "The class is the blueprint; objects are built from it." },
        { question: "What does the constructor do?", options: ["Deletes the object", "Initialises a new object’s state", "Copies the class", "Defines static methods only"], answer: 1, explanation: "It runs when an object is created, setting its initial fields." },
      ],
      related: [{ label: "Inheritance and polymorphism", href: "/learn/object-oriented-programming/inheritance-and-polymorphism" }],
    },
    {
      slug: "inheritance-and-polymorphism",
      title: "Inheritance and Polymorphism",
      summary: "Reusing behaviour and treating different objects through one interface.",
      blocks: [
        { type: "p", text: "**Inheritance** lets a class extend another: the subclass gets the parent’s fields and methods and can add or **override** them. **Polymorphism** means code can work with the parent type while each object runs its own version of a method." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          traceable: true,
          code: `class Shape {
  area() { return 0; }
  describe() { return \`\${this.constructor.name} with area \${this.area().toFixed(1)}\`; }
}
class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}
class Square extends Shape {
  constructor(s) { super(); this.s = s; }
  area() { return this.s ** 2; }
}

for (const shape of [new Circle(1), new Square(2)]) {
  console.log(shape.describe()); // each uses its own area()
}`,
        },
        { type: "callout", tone: "tip", text: "Inheritance creates a tight coupling between classes. Use it for genuine “is-a” relationships (a Circle is a Shape). For “has-a” relationships, prefer composition — covered in the next lesson." },
      ],
      quiz: [
        { question: "What is method overriding?", options: ["Calling a method twice", "A subclass providing its own version of a parent method", "Deleting a method", "Renaming a method"], answer: 1, explanation: "The subclass’s version runs for its objects." },
        { question: "Polymorphism lets you…", options: ["Use one interface for objects of different classes", "Store objects in a database", "Run code in parallel", "Avoid writing classes"], answer: 0, explanation: "The caller uses describe() without knowing the concrete shape." },
      ],
      related: [{ label: "Encapsulation and composition", href: "/learn/object-oriented-programming/encapsulation-and-composition" }],
    },
    {
      slug: "encapsulation-and-composition",
      title: "Encapsulation and Composition",
      summary: "Hiding internal details and building objects from smaller parts.",
      blocks: [
        { type: "p", text: "**Encapsulation** keeps an object’s internal state private and exposes a small public interface. Callers can’t put the object into an invalid state, and you can change the internals without breaking them." },
        {
          type: "code",
          language: "javascript",
          runnable: true,
          code: `class Counter {
  #count = 0;             // private field: not accessible outside
  increment() { this.#count++; }
  get value() { return this.#count; }
}

const c = new Counter();
c.increment();
c.increment();
console.log(c.value); // 2
// c.#count = 99;     // SyntaxError: private field`,
        },
        { type: "p", text: "**Composition** builds objects by combining other objects instead of inheriting from them: a `Car` *has an* `Engine`. It is more flexible than deep inheritance trees because parts can be swapped independently." },
        {
          type: "list",
          items: [
            "**Single responsibility:** a class should have one reason to change.",
            "**Program to an interface:** depend on what an object does, not on its concrete class.",
            "**Favour composition over inheritance** for sharing behaviour.",
          ],
        },
      ],
      quiz: [
        { question: "What is the main benefit of encapsulation?", options: ["Faster code", "Protecting internal state behind a public interface", "Smaller files", "Avoiding classes"], answer: 1, explanation: "Invariants are enforced by the object itself." },
        { question: "A Library has many Books. That is an example of…", options: ["Inheritance", "Composition", "Polymorphism", "Recursion"], answer: 1, explanation: "It’s a “has-a” relationship." },
      ],
      related: [{ label: "Writing maintainable code", href: "/learn/software-engineering/maintainable-code" }],
    },
  ],
};
