export type Difficulty = "Easy" | "Medium" | "Hard";
export type ChallengeLanguage = "javascript" | "python";

export type TestCase = {
  args: unknown[];
  expected: unknown;
  /** Hidden tests run on Submit only, and don't reveal their input. */
  hidden?: boolean;
  /** Shown with visible tests in the problem statement. */
  explanation?: string;
};

export type Challenge = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  /** Paragraphs of the problem statement. */
  description: string[];
  constraints: string[];
  hint: string;
  fn: Record<ChallengeLanguage, string>;
  params: string[];
  /** "unordered": compare as multisets (order of the result doesn't matter). */
  compare?: "exact" | "unordered";
  tests: TestCase[];
};

const starter = (c: Pick<Challenge, "fn" | "params">, lang: ChallengeLanguage) =>
  lang === "javascript"
    ? `function ${c.fn.javascript}(${c.params.join(", ")}) {\n  // Write your solution here\n}\n`
    : `def ${c.fn.python}(${c.params.map(toSnake).join(", ")}):\n    # Write your solution here\n    pass\n`;

export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const starterCode = (c: Challenge, lang: ChallengeLanguage) => starter(c, lang);

export const challenges: Challenge[] = [
  /* ---------------------------------------------------------------- Easy */
  {
    slug: "sum-of-evens",
    title: "Sum of Evens",
    difficulty: "Easy",
    topics: ["Arrays", "Loops"],
    description: ["Given an array of integers `nums`, return the sum of all the even numbers in it.", "If there are no even numbers, return `0`."],
    constraints: ["0 ≤ nums.length ≤ 10⁴", "−10⁶ ≤ nums[i] ≤ 10⁶"],
    hint: "A number is even when the remainder after dividing by 2 is 0. Be careful: in some languages the remainder of a negative number is negative.",
    fn: { javascript: "sumEvens", python: "sum_evens" },
    params: ["nums"],
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: 12, explanation: "2 + 4 + 6 = 12" },
      { args: [[7, 9, 11]], expected: 0, explanation: "There are no even numbers." },
      { args: [[]], expected: 0, hidden: true },
      { args: [[-4, -3, 0, 8]], expected: 4, hidden: true },
      { args: [[1000000, 999999, -1000000]], expected: 0, hidden: true },
    ],
  },
  {
    slug: "reverse-words",
    title: "Reverse the Words",
    difficulty: "Easy",
    topics: ["Strings"],
    description: [
      "Given a string `s`, return the words in reverse order.",
      "Words are separated by one or more spaces. The result should have exactly one space between words and no leading or trailing spaces.",
    ],
    constraints: ["0 ≤ s.length ≤ 10⁴", "s contains letters, digits and spaces"],
    hint: "Split on whitespace, drop empty pieces, reverse, then join with a single space.",
    fn: { javascript: "reverseWords", python: "reverse_words" },
    params: ["s"],
    tests: [
      { args: ["learn by doing"], expected: "doing by learn" },
      { args: ["  hello   world  "], expected: "world hello", explanation: "Extra spaces are removed." },
      { args: ["single"], expected: "single", hidden: true },
      { args: [""], expected: "", hidden: true },
      { args: ["a b  c   d"], expected: "d c b a", hidden: true },
    ],
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topics: ["Strings", "Two Pointers"],
    description: [
      "Return `true` if the string `s` reads the same forwards and backwards after removing every character that isn’t a letter or digit and ignoring letter case. Otherwise return `false`.",
    ],
    constraints: ["0 ≤ s.length ≤ 10⁵"],
    hint: "Use two pointers that move towards each other, skipping characters that aren’t letters or digits.",
    fn: { javascript: "isPalindrome", python: "is_palindrome" },
    params: ["s"],
    tests: [
      { args: ["Never odd or even"], expected: true },
      { args: ["Devora"], expected: false },
      { args: ["A man, a plan, a canal: Panama"], expected: true, hidden: true },
      { args: [""], expected: true, hidden: true },
      { args: ["0P"], expected: false, hidden: true },
      { args: ["race a car"], expected: false, hidden: true },
    ],
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz List",
    difficulty: "Easy",
    topics: ["Loops", "Math"],
    description: [
      "Return a list of strings for the numbers 1 to `n`. For multiples of 3 use `\"Fizz\"`, for multiples of 5 use `\"Buzz\"`, for multiples of both use `\"FizzBuzz\"`, and otherwise use the number itself as a string.",
    ],
    constraints: ["1 ≤ n ≤ 10⁴"],
    hint: "Check the “multiple of both” case first, or build the string from the two separate checks.",
    fn: { javascript: "fizzBuzz", python: "fizz_buzz" },
    params: ["n"],
    tests: [
      { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { args: [1], expected: ["1"] },
      { args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"], hidden: true },
    ],
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Tables"],
    description: [
      "Given an array of integers `nums` and an integer `target`, return the indices `[i, j]` (with `i < j`) of the two numbers that add up to `target`.",
      "Each input has exactly one solution, and you may not use the same element twice.",
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "Exactly one valid answer exists"],
    hint: "For each number, the partner you need is `target − num`. A hash map from value to index lets you check for it in O(1).",
    fn: { javascript: "twoSum", python: "two_sum" },
    params: ["nums", "target"],
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1], hidden: true },
      { args: [[-5, 10, 4, 1], -1], expected: [0, 2], hidden: true },
      { args: [[1, 5, 9, 13, 21], 34], expected: [3, 4], hidden: true },
    ],
  },

  /* -------------------------------------------------------------- Medium */
  {
    slug: "balanced-brackets",
    title: "Balanced Brackets",
    difficulty: "Medium",
    topics: ["Stacks", "Strings"],
    description: [
      "Given a string `s` containing only the characters `()[]{}`, return `true` if every bracket is closed by the same type of bracket in the correct order.",
    ],
    constraints: ["0 ≤ s.length ≤ 10⁴"],
    hint: "Push opening brackets onto a stack. Each closing bracket must match the bracket on top of the stack.",
    fn: { javascript: "isBalanced", python: "is_balanced" },
    params: ["s"],
    tests: [
      { args: ["([]{})"], expected: true },
      { args: ["([)]"], expected: false, explanation: "The brackets close in the wrong order." },
      { args: [""], expected: true, hidden: true },
      { args: ["((("], expected: false, hidden: true },
      { args: ["}"], expected: false, hidden: true },
      { args: ["{[()()]}[]"], expected: true, hidden: true },
    ],
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topics: ["Arrays", "Sorting"],
    description: [
      "Given a list of intervals `[start, end]`, merge all overlapping intervals and return the result sorted by start.",
      "Intervals that only touch (one ends where the next starts) also merge.",
    ],
    constraints: ["0 ≤ intervals.length ≤ 10⁴", "start ≤ end"],
    hint: "Sort by start. Then walk through, extending the last merged interval whenever the next one starts before it ends.",
    fn: { javascript: "mergeIntervals", python: "merge_intervals" },
    params: ["intervals"],
    tests: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]], explanation: "Touching intervals merge." },
      { args: [[]], expected: [], hidden: true },
      { args: [[[5, 7], [1, 2], [2, 4]]], expected: [[1, 4], [5, 7]], hidden: true },
      { args: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]], hidden: true },
    ],
  },
  {
    slug: "longest-unique-substring",
    title: "Longest Substring Without Repeats",
    difficulty: "Medium",
    topics: ["Strings", "Sliding Window", "Hash Tables"],
    description: ["Given a string `s`, return the length of the longest substring that contains no repeated characters."],
    constraints: ["0 ≤ s.length ≤ 5 · 10⁴"],
    hint: "Keep a window of unique characters. When you see a repeat, move the window’s start just past that character’s previous position.",
    fn: { javascript: "longestUnique", python: "longest_unique" },
    params: ["s"],
    tests: [
      { args: ["abcabcbb"], expected: 3, explanation: "\"abc\" has length 3." },
      { args: ["bbbbb"], expected: 1 },
      { args: ["pwwkew"], expected: 3, hidden: true },
      { args: [""], expected: 0, hidden: true },
      { args: ["abba"], expected: 2, hidden: true },
      { args: ["dvdf"], expected: 3, hidden: true },
    ],
  },
  {
    slug: "rotate-matrix",
    title: "Rotate the Matrix",
    difficulty: "Medium",
    topics: ["Arrays", "Matrices"],
    description: ["Given an n × n matrix, return a new matrix rotated 90 degrees clockwise."],
    constraints: ["1 ≤ n ≤ 100"],
    hint: "Row i of the result is column i of the original, read from bottom to top.",
    fn: { javascript: "rotate", python: "rotate" },
    params: ["matrix"],
    tests: [
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [
          [3, 1],
          [4, 2],
        ],
      },
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
        expected: [
          [7, 4, 1],
          [8, 5, 2],
          [9, 6, 3],
        ],
      },
      { args: [[[42]]], expected: [[42]], hidden: true },
      {
        args: [
          [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
          ],
        ],
        expected: [
          [13, 9, 5, 1],
          [14, 10, 6, 2],
          [15, 11, 7, 3],
          [16, 12, 8, 4],
        ],
        hidden: true,
      },
    ],
  },

  /* ---------------------------------------------------------------- Hard */
  {
    slug: "grid-shortest-path",
    title: "Shortest Path in a Grid",
    difficulty: "Hard",
    topics: ["Graphs", "BFS", "Matrices"],
    description: [
      "You are given a grid as an array of strings. `.` is an open cell and `#` is a wall. Starting from the top-left cell, return the minimum number of moves to reach the bottom-right cell, moving up, down, left or right.",
      "Return `-1` if the bottom-right cell can’t be reached or if either corner is a wall.",
    ],
    constraints: ["1 ≤ rows, cols ≤ 100"],
    hint: "Breadth-first search explores cells in order of distance, so the first time it reaches the target is the shortest path.",
    fn: { javascript: "shortestPath", python: "shortest_path" },
    params: ["grid"],
    tests: [
      { args: [["..#", "#..", "#.."]], expected: 4 },
      { args: [[".#", "#."]], expected: -1, explanation: "The walls block every route." },
      { args: [["."]], expected: 0, hidden: true },
      { args: [["....", ".##.", "...#", "#..."]], expected: 6, hidden: true },
      { args: [["#.", ".."]], expected: -1, hidden: true },
      { args: [[".....", "####.", ".....", ".####", "....."]], expected: 16, hidden: true },
    ],
  },
  {
    slug: "edit-distance",
    title: "Edit Distance",
    difficulty: "Hard",
    topics: ["Dynamic Programming", "Strings"],
    description: [
      "Return the minimum number of single-character edits — insertions, deletions or substitutions — needed to turn string `a` into string `b`.",
    ],
    constraints: ["0 ≤ a.length, b.length ≤ 500"],
    hint: "Let dp[i][j] be the distance between the first i characters of a and the first j characters of b. Each cell depends on its left, upper and upper-left neighbours.",
    fn: { javascript: "editDistance", python: "edit_distance" },
    params: ["a", "b"],
    tests: [
      { args: ["kitten", "sitting"], expected: 3, explanation: "k→s, e→i, and insert g." },
      { args: ["", "abc"], expected: 3 },
      { args: ["same", "same"], expected: 0, hidden: true },
      { args: ["intention", "execution"], expected: 5, hidden: true },
      { args: ["abc", ""], expected: 3, hidden: true },
      { args: ["sunday", "saturday"], expected: 3, hidden: true },
    ],
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Arrays", "Two Pointers"],
    description: [
      "Each number in `heights` is the height of a bar of width 1. After it rains, water collects between taller bars. Return the total amount of water trapped.",
    ],
    constraints: ["0 ≤ heights.length ≤ 2 · 10⁴", "0 ≤ heights[i] ≤ 10⁵"],
    hint: "The water above a bar is min(tallest bar to its left, tallest bar to its right) minus its own height. Two pointers can compute this in one pass.",
    fn: { javascript: "trap", python: "trap" },
    params: ["heights"],
    tests: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[3, 2, 1]], expected: 0, hidden: true },
      { args: [[5, 0, 5]], expected: 5, hidden: true },
      { args: [[2, 0, 2, 0, 2]], expected: 4, hidden: true },
    ],
  },
];

export const challengeBySlug = (slug: string) => challenges.find((c) => c.slug === slug);
export const allTopics = [...new Set(challenges.flatMap((c) => c.topics))].sort();
