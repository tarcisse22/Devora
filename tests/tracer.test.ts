import { test } from "node:test";
import assert from "node:assert/strict";
import { instrument, type TracerStep } from "../lib/execution/tracer";

/** Reference implementation of the runner's __devora hooks. */
function trace(source: string) {
  const res = instrument(source);
  if (!res.ok) throw new Error(res.error);
  const TDZ = Symbol("tdz");
  const output: string[] = [];
  const frames: { name: string; getter: null | (() => Record<string, unknown>) }[] = [{ name: "global", getter: null }];
  const steps: TracerStep[] = [];
  const snap = () =>
    frames.map((f) => {
      const raw = f.getter ? f.getter() : {};
      return { name: f.name, vars: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === TDZ ? "<uninitialized>" : JSON.stringify(v) ?? String(v)])) };
    });
  const devora = {
    TDZ,
    step(line: number, getter: () => Record<string, unknown>) {
      if (steps.length > 5000) throw new Error("step limit");
      frames[frames.length - 1].getter = getter;
      steps.push({ line, frames: snap(), outputLength: output.length });
    },
    enter(name: string) {
      frames.push({ name, getter: null });
    },
    exit() {
      frames.pop();
    },
    ret(value: unknown, line: number) {
      steps.push({ line, frames: snap(), outputLength: output.length, returned: JSON.stringify(value) });
      return value;
    },
  };
  const consoleShim = { log: (...a: unknown[]) => output.push(a.map(String).join(" ")) };
  new Function("__devora", "console", res.code)(devora, consoleShim);
  return { steps, output, code: res.code };
}

function runPlain(source: string) {
  const output: string[] = [];
  new Function("console", source)({ log: (...a: unknown[]) => output.push(a.map(String).join(" ")) });
  return output;
}

test("loop with a brace-less body is stepped and keeps its meaning", () => {
  const { steps, output } = trace("let s = 0;\nfor (let i = 1; i <= 3; i++) s += i;\nconsole.log(s);");
  assert.deepEqual(output, ["6"]);
  assert.deepEqual(steps.map((s) => s.line), [1, 2, 2, 2, 2, 3]);
  assert.equal(steps.at(-1)!.frames[0].vars.s, "6");
  // Loop variable visible inside the loop body.
  assert.equal(steps[2].frames[0].vars.i, "1");
});

test("recursion builds a call stack and records return values", () => {
  const src = "function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nconsole.log(fact(3));";
  const { steps, output } = trace(src);
  assert.deepEqual(output, ["6"]);
  const depth = Math.max(...steps.map((s) => s.frames.length));
  assert.equal(depth, 4, "global + fact(3) + fact(2) + fact(1)");
  const deepest = steps.find((s) => s.frames.length === 4)!;
  assert.deepEqual(deepest.frames.map((f) => f.name), ["global", "fact", "fact", "fact"]);
  assert.deepEqual(deepest.frames.map((f) => f.vars.n), [undefined, "3", "2", "1"]);
  assert.deepEqual(steps.filter((s) => s.returned).map((s) => s.returned), ["1", "2", "6"]);
});

test("arrow functions with expression bodies get a frame and a return value", () => {
  const { steps, output } = trace("const double = (x) => x * 2;\nconst y = double(21);\nconsole.log(y);");
  assert.deepEqual(output, ["42"]);
  const inArrow = steps.find((s) => s.frames.at(-1)!.name === "double")!;
  assert.equal(inArrow.frames.at(-1)!.vars.x, "21");
  assert.ok(steps.some((s) => s.returned === "42"));
});

test("let/const before initialisation show as uninitialized; functions are not listed as variables", () => {
  const { steps } = trace("function helper() {}\nconsole.log('start');\nlet late = 5;");
  assert.equal(steps[0].frames[0].vars.late, "<uninitialized>");
  assert.ok(!("helper" in steps[0].frames[0].vars));
  assert.equal(steps.at(-1)!.frames[0].vars.late, "<uninitialized>");
});

test("instrumented programs print exactly what the originals print", () => {
  const programs = [
    "const a = [5, 3, 8, 1];\nfor (let i = 0; i < a.length; i++)\n  for (let j = 0; j < a.length - 1 - i; j++)\n    if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];\nconsole.log(a.join(','));",
    "function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }\nconsole.log(fib(10));",
    "let x = 7;\nif (x > 10) console.log('big');\nelse if (x > 5) console.log('medium');\nelse console.log('small');",
    "function counter() { let c = 0; return () => ++c; }\nconst next = counter();\nnext(); next();\nconsole.log(next());",
    "class Stack { constructor() { this.items = []; } push(v) { this.items.push(v); return this; } }\nconsole.log(new Stack().push(1).push(2).items.length);",
    "let out = '';\nswitch (3) { case 1: out = 'one'; break; case 3: out = 'three'; break; default: out = '?'; }\nconsole.log(out);",
    "const {a, b: [c, ...rest]} = {a: 1, b: [2, 3, 4]};\nlet n = 0;\nwhile (n < 3) n++;\ndo { n--; } while (n > 1);\nconsole.log(a, c, rest.length, n);",
    "try { throw new Error('boom'); } catch (e) { console.log('caught', e.message); } finally { console.log('done'); }",
  ];
  for (const p of programs) assert.deepEqual(trace(p).output, runPlain(p), p);
});

test("class methods are named in the call stack", () => {
  const { steps } = trace("class Box {\n  area(w, h) {\n    return w * h;\n  }\n}\nnew Box().area(2, 3);");
  assert.ok(steps.some((s) => s.frames.at(-1)!.name === "area" && s.frames.at(-1)!.vars.w === "2"));
});

test("syntax errors are reported with a line number and line numbers are preserved", () => {
  const res = instrument("let a = 1;\nlet = = 2;");
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.line, 2);
  const ok = instrument("const a = 1;\n\nconsole.log(a);");
  assert.ok(ok.ok);
  if (ok.ok) assert.equal(ok.code.split("\n").length, 3);
});
