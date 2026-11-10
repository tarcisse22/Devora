import type { Challenge, ChallengeLanguage, TestCase } from "./challenges";

export type TestResult = {
  index: number;
  pass: boolean;
  /** The function's return value, as text. */
  got?: string;
  error?: string;
};

/**
 * Builds a program that defines the user's solution, then calls it on each
 * test and prints one machine-readable line per result:
 *   <marker>{"i":0,"pass":true,"got":"…"}
 * The marker is random per run so user output can't be mistaken for results.
 */
export function buildHarness(challenge: Challenge, lang: ChallengeLanguage, userCode: string, tests: TestCase[], marker: string): string {
  const payload = JSON.stringify(tests.map((t) => ({ args: t.args, expected: t.expected })));
  const unordered = challenge.compare === "unordered";

  if (lang === "javascript") {
    const fn = challenge.fn.javascript;
    return `${userCode}
;
{
  const __tests = ${payload};
  const __norm = (v) => (${unordered} && Array.isArray(v) ? [...v].map((x) => JSON.stringify(x)).sort() : v);
  const __show = (v) => (v === undefined ? "undefined" : JSON.stringify(v) ?? String(v));
  for (let __i = 0; __i < __tests.length; __i++) {
    const __t = __tests[__i];
    let __r;
    try {
      if (typeof ${fn} !== "function") throw new ReferenceError("${fn} is not defined — keep the function name from the starter code");
      const __out = await ${fn}(...structuredClone(__t.args));
      __r = { i: __i, pass: JSON.stringify(__norm(__out)) === JSON.stringify(__norm(__t.expected)), got: __show(__out) };
    } catch (__e) {
      __r = { i: __i, pass: false, error: (__e && __e.name ? __e.name + ": " : "") + (__e && __e.message ? __e.message : String(__e)) };
    }
    console.log(${JSON.stringify(marker)} + JSON.stringify(__r));
  }
}
`;
  }

  const fn = challenge.fn.python;
  return `${userCode}

import json as __json, copy as __copy
__tests = __json.loads(${JSON.stringify(payload)})
def __norm(v):
    v = __json.loads(__json.dumps(v, default=str))
    if ${unordered ? "True" : "False"} and isinstance(v, list):
        return sorted(__json.dumps(x) for x in v)
    return v
for __i, __t in enumerate(__tests):
    try:
        if "${fn}" not in globals():
            raise NameError("${fn} is not defined — keep the function name from the starter code")
        __out = ${fn}(*__copy.deepcopy(__t["args"]))
        __r = {"i": __i, "pass": __norm(__out) == __norm(__t["expected"]), "got": __json.dumps(__out, default=str)}
    except Exception as __e:
        __r = {"i": __i, "pass": False, "error": f"{type(__e).__name__}: {__e}"}
    print(${JSON.stringify(marker)} + __json.dumps(__r))
`;
}

/** Split runner output into test results and the user's own printed lines. */
export function parseHarnessOutput(lines: { stream: string; text: string }[], marker: string) {
  const results: TestResult[] = [];
  const userOutput: { stream: string; text: string }[] = [];
  for (const line of lines) {
    if (line.text.startsWith(marker)) {
      try {
        const r = JSON.parse(line.text.slice(marker.length));
        results[r.i] = { index: r.i, pass: Boolean(r.pass), got: r.got, error: r.error };
      } catch {
        userOutput.push(line);
      }
    } else {
      userOutput.push(line);
    }
  }
  return { results, userOutput };
}

export const formatValue = (v: unknown) => JSON.stringify(v);

/** A fresh, unguessable result marker for one run. */
export const createMarker = () => `@@devora-${crypto.randomUUID()}@@`;
