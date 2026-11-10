import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../lib/practice/challenges";
import { buildHarness, parseHarnessOutput } from "../lib/practice/harness";

/** Independent reference solutions — they prove every expected value is right. */
const reference: Record<string, string> = {
  sumEvens: `function sumEvens(nums) { return nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0); }`,
  reverseWords: `function reverseWords(s) { return s.split(/\\s+/).filter(Boolean).reverse().join(" "); }`,
  isPalindrome: `function isPalindrome(s) { const t = s.toLowerCase().replace(/[^a-z0-9]/g, ""); return t === [...t].reverse().join(""); }`,
  fizzBuzz: `function fizzBuzz(n) { return Array.from({ length: n }, (_, k) => { const i = k + 1; return i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i); }); }`,
  twoSum: `function twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i++) { if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]; seen.set(nums[i], i); } }`,
  isBalanced: `function isBalanced(s) { const st = []; const p = { ")": "(", "]": "[", "}": "{" }; for (const c of s) { if ("([{".includes(c)) st.push(c); else if (st.pop() !== p[c]) return false; } return st.length === 0; }`,
  mergeIntervals: `function mergeIntervals(iv) { const s = [...iv].sort((a, b) => a[0] - b[0]); const out = []; for (const [a, b] of s) { if (out.length && a <= out.at(-1)[1]) out.at(-1)[1] = Math.max(out.at(-1)[1], b); else out.push([a, b]); } return out; }`,
  longestUnique: `function longestUnique(s) { const last = new Map(); let start = 0, best = 0; for (let i = 0; i < s.length; i++) { if (last.has(s[i]) && last.get(s[i]) >= start) start = last.get(s[i]) + 1; last.set(s[i], i); best = Math.max(best, i - start + 1); } return best; }`,
  rotate: `function rotate(m) { const n = m.length; return m[0].map((_, c) => Array.from({ length: n }, (_, r) => m[n - 1 - r][c])); }`,
  shortestPath: `function shortestPath(g) { const R = g.length, C = g[0].length; if (g[0][0] === "#" || g[R-1][C-1] === "#") return -1; const d = Array.from({ length: R }, () => Array(C).fill(-1)); d[0][0] = 0; const q = [[0, 0]]; while (q.length) { const [r, c] = q.shift(); if (r === R - 1 && c === C - 1) return d[r][c]; for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nr = r + dr, nc = c + dc; if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] === "#" || d[nr][nc] !== -1) continue; d[nr][nc] = d[r][c] + 1; q.push([nr, nc]); } } return -1; }`,
  editDistance: `function editDistance(a, b) { const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))); for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]); return dp[a.length][b.length]; }`,
  trap: `function trap(h) { let l = 0, r = h.length - 1, lm = 0, rm = 0, w = 0; while (l < r) { if (h[l] < h[r]) { lm = Math.max(lm, h[l]); w += lm - h[l]; l++; } else { rm = Math.max(rm, h[r]); w += rm - h[r]; r--; } } return w; }`,
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function runHarness(code: string) {
  const lines: { stream: string; text: string }[] = [];
  const consoleShim = { log: (...a: unknown[]) => lines.push({ stream: "stdout", text: a.map(String).join(" ") }) };
  await new AsyncFunction("console", code)(consoleShim);
  return lines;
}

test("every challenge has a reference solution, visible examples and hidden tests", () => {
  assert.equal(challenges.length, 12);
  for (const c of challenges) {
    assert.ok(reference[c.fn.javascript], `${c.slug}: reference solution`);
    assert.ok(c.tests.some((t) => !t.hidden), `${c.slug}: has visible tests`);
    assert.ok(c.tests.some((t) => t.hidden), `${c.slug}: has hidden tests`);
    assert.equal(new Set(challenges.map((x) => x.slug)).size, challenges.length);
  }
});

for (const c of challenges) {
  test(`${c.slug}: reference solution passes every test through the harness`, async () => {
    const marker = "@@T@@";
    const lines = await runHarness(buildHarness(c, "javascript", reference[c.fn.javascript], c.tests, marker));
    const { results } = parseHarnessOutput(lines, marker);
    assert.equal(results.length, c.tests.length);
    results.forEach((r, i) => assert.ok(r.pass, `${c.slug} test ${i}: got ${r.got ?? r.error}, expected ${JSON.stringify(c.tests[i].expected)}`));
  });
}

test("harness reports wrong answers, exceptions, missing functions and keeps user output separate", async () => {
  const c = challenges.find((x) => x.slug === "sum-of-evens")!;
  const marker = "@@T@@";
  const wrong = parseHarnessOutput(await runHarness(buildHarness(c, "javascript", "function sumEvens(nums) { console.log('debug', nums.length); return 1; }", c.tests, marker)), marker);
  assert.ok(wrong.results.every((r) => !r.pass && r.got === "1"));
  assert.ok(wrong.userOutput.some((l) => l.text.startsWith("debug")));
  const crash = parseHarnessOutput(await runHarness(buildHarness(c, "javascript", "function sumEvens(nums) { return nums.foo.bar; }", c.tests, marker)), marker);
  assert.match(crash.results[0].error!, /TypeError/);
  const missing = parseHarnessOutput(await runHarness(buildHarness(c, "javascript", "function other() {}", c.tests, marker)), marker);
  assert.match(missing.results[0].error!, /sumEvens is not defined/);
  const undef = parseHarnessOutput(await runHarness(buildHarness(c, "javascript", "function sumEvens() {}", c.tests, marker)), marker);
  assert.equal(undef.results[0].got, "undefined");
});

test("tests can't be mutated by the solution", async () => {
  const c = challenges.find((x) => x.slug === "merge-intervals")!;
  const marker = "@@T@@";
  // Mutates its input, then returns the reference answer.
  const code = reference.mergeIntervals.replace("{ const s", "{ iv.length = 0; const s").replace("[...iv]", "[...JSON.parse(JSON.stringify(iv))]");
  const { results } = parseHarnessOutput(await runHarness(buildHarness(c, "javascript", code, c.tests, marker)), marker);
  assert.equal(results.length, c.tests.length);
});
