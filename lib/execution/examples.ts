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
  cpp: [
    {
      id: "hello",
      title: "Hello, Devora",
      code: `#include <iostream>
#include <string>

int main() {
    std::string name = "Devora";
    std::cout << "Hello, " << name << "!" << std::endl;

    for (int i = 1; i <= 5; i++) std::cout << i * i << ' ';
    std::cout << '\\n';
}
`,
    },
    {
      id: "two-sum",
      title: "Two Sum (hash map)",
      code: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

// Classic interview problem: indices of two numbers that add up to target.
// One pass with a hash map: O(n) time, O(n) space.
vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen; // value -> index
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> ans = twoSum(nums, 9);
    cout << "[" << ans[0] << ", " << ans[1] << "]" << endl;
}
`,
    },
    {
      id: "stl",
      title: "STL: sort, map, priority_queue",
      code: `#include <algorithm>
#include <iostream>
#include <map>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 2, 9, 1, 7};
    sort(v.begin(), v.end());
    cout << "sorted: ";
    for (int x : v) cout << x << ' ';
    cout << '\\n';

    map<string, int> freq;
    for (string w : {"tree", "graph", "tree", "heap", "tree"}) freq[w]++;
    for (auto& [word, count] : freq) cout << word << " x" << count << '\\n';

    priority_queue<int, vector<int>, greater<int>> minHeap(v.begin(), v.end());
    cout << "smallest: " << minHeap.top() << endl;
}
`,
    },
    {
      id: "bfs-grid",
      title: "BFS shortest path on a grid",
      code: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> grid = {
        "S.#.....",
        ".##..#..",
        "....#..E",
    };
    int rows = grid.size(), cols = grid[0].size();
    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    queue<pair<int, int>> q;
    q.push({0, 0});
    dist[0][0] = 0;
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};

    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        if (grid[r][c] == 'E') {
            cout << "Shortest path length: " << dist[r][c] << endl;
            return 0;
        }
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    cout << "No path" << endl;
}
`,
    },
  ],
  c: [
    {
      id: "hello",
      title: "Hello, Devora",
      code: `#include <stdio.h>

int main(void) {
    const char *name = "Devora";
    printf("Hello, %s!\\n", name);

    for (int i = 1; i <= 5; i++) printf("%d ", i * i);
    printf("\\n");
    return 0;
}
`,
    },
    {
      id: "pointers",
      title: "Pointers & arrays",
      code: `#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3, y = 8;
    swap(&x, &y);
    printf("after swap: x=%d y=%d\\n", x, y);

    int arr[] = {10, 20, 30, 40};
    int *p = arr;
    for (int i = 0; i < 4; i++) {
        printf("arr[%d] = %d at offset %td\\n", i, *(p + i), (p + i) - arr);
    }
    return 0;
}
`,
    },
    {
      id: "linked-list",
      title: "Linked list with malloc",
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *push_front(Node *head, int value) {
    Node *node = malloc(sizeof(Node));
    node->value = value;
    node->next = head;
    return node;
}

Node *reverse(Node *head) {
    Node *prev = NULL;
    while (head) {
        Node *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

void print_list(const Node *n) {
    for (; n; n = n->next) printf("%d -> ", n->value);
    printf("NULL\\n");
}

int main(void) {
    Node *list = NULL;
    for (int i = 1; i <= 5; i++) list = push_front(list, i);
    print_list(list);
    list = reverse(list);
    print_list(list);

    while (list) {
        Node *next = list->next;
        free(list);
        list = next;
    }
    return 0;
}
`,
    },
  ],
};
