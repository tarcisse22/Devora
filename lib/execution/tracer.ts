import { parse, type Node } from "acorn";

/**
 * Instruments JavaScript for the Code Tracer.
 *
 * The returned code calls hooks provided by the sandbox runner:
 *   __devora.step(line, getter)  before each statement — getter returns the
 *                                variables visible in the current function
 *   __devora.enter(name, line)   when a function starts
 *   __devora.exit()              when it finishes (via try/finally)
 *   __devora.ret(value, line)    when it returns a value
 *
 * Code is only inserted (never moved or reformatted, and never across
 * newlines), so line numbers in the instrumented code match the source.
 */

export type TraceFrame = { name: string; vars: Record<string, string> };
export type TracerStep = {
  line: number;
  /** Call stack, outermost (global) first. */
  frames: TraceFrame[];
  /** Number of console lines printed before this step. */
  outputLength: number;
  /** Set on steps recorded by a `return`. */
  returned?: string;
};

type Scope = {
  kind: "function" | "block";
  parent: Scope | null;
  /** Variables shown in the tracer. */
  vars: Set<string>;
};

type AnyNode = Node & Record<string, unknown>;

const isNode = (v: unknown): v is AnyNode => typeof v === "object" && v !== null && typeof (v as { type?: unknown }).type === "string";

function children(node: AnyNode): AnyNode[] {
  const out: AnyNode[] = [];
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "start" || key === "end" || key === "type") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => isNode(c) && out.push(c));
    else if (isNode(v)) out.push(v);
  }
  return out;
}

/** Identifiers bound by a pattern (params, destructuring). */
function patternNames(p: AnyNode | null | undefined, out: string[] = []): string[] {
  if (!p) return out;
  switch (p.type) {
    case "Identifier":
      out.push(p.name as string);
      break;
    case "AssignmentPattern":
      patternNames(p.left as AnyNode, out);
      break;
    case "RestElement":
      patternNames(p.argument as AnyNode, out);
      break;
    case "ArrayPattern":
      (p.elements as (AnyNode | null)[]).forEach((e) => patternNames(e, out));
      break;
    case "ObjectPattern":
      for (const prop of p.properties as AnyNode[]) patternNames((prop.type === "RestElement" ? prop : prop.value) as AnyNode, out);
      break;
  }
  return out;
}

const isFunction = (n: AnyNode) => n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";
const opensBlockScope = (n: AnyNode) =>
  n.type === "BlockStatement" || n.type === "ForStatement" || n.type === "ForInStatement" || n.type === "ForOfStatement" || n.type === "CatchClause" || n.type === "SwitchStatement";

export type InstrumentResult = { ok: true; code: string } | { ok: false; error: string; line?: number };

export function instrument(source: string): InstrumentResult {
  let program: AnyNode;
  try {
    program = parse(source, { ecmaVersion: "latest", sourceType: "script", locations: true, allowAwaitOutsideFunction: true }) as unknown as AnyNode;
  } catch (err) {
    const e = err as { message?: string; loc?: { line: number } };
    return { ok: false, error: `SyntaxError: ${e.message ?? String(err)}`, line: e.loc?.line };
  }

  /* ---------- pass 1: scopes and the variables declared in them ---------- */
  const scopeOf = new WeakMap<AnyNode, Scope>();
  const functionScope = (s: Scope) => {
    let cur = s;
    while (cur.kind !== "function") cur = cur.parent!;
    return cur;
  };

  const declare = (node: AnyNode, scope: Scope) => {
    if (node.type === "VariableDeclaration") {
      const target = node.kind === "var" ? functionScope(scope) : scope;
      for (const d of node.declarations as AnyNode[]) patternNames(d.id as AnyNode).forEach((n) => target.vars.add(n));
    }
  };

  const collect = (node: AnyNode, scope: Scope) => {
    let inner = scope;
    if (isFunction(node)) {
      inner = { kind: "function", parent: scope, vars: new Set() };
      (node.params as AnyNode[]).forEach((p) => patternNames(p).forEach((n) => inner.vars.add(n)));
      scopeOf.set(node, inner);
      // A block body shares the function's scope.
      if ((node.body as AnyNode).type === "BlockStatement") scopeOf.set(node.body as AnyNode, inner);
    } else if (opensBlockScope(node) && !scopeOf.has(node)) {
      inner = { kind: "block", parent: scope, vars: new Set() };
      scopeOf.set(node, inner);
      if (node.type === "CatchClause" && node.param) patternNames(node.param as AnyNode).forEach((n) => inner.vars.add(n));
    } else if (scopeOf.has(node)) {
      inner = scopeOf.get(node)!;
    }
    declare(node, inner);
    for (const c of children(node)) collect(c, inner);
  };

  const globalScope: Scope = { kind: "function", parent: null, vars: new Set() };
  scopeOf.set(program, globalScope);
  for (const c of children(program)) collect(c, globalScope);

  /* ---------- pass 2: insertions ---------- */
  type Insert = { pos: number; text: string; seq: number };
  const inserts: Insert[] = [];
  let seq = 0;
  const at = (pos: number, text: string) => inserts.push({ pos, text, seq: seq++ });

  const visibleVars = (scope: Scope): string[] => {
    const names = new Set<string>();
    let cur: Scope | null = scope;
    while (cur) {
      cur.vars.forEach((n) => names.add(n));
      if (cur.kind === "function") break;
      cur = cur.parent;
    }
    return [...names].filter((n) => !n.startsWith("__"));
  };

  const getter = (scope: Scope) => {
    const names = visibleVars(scope);
    if (names.length === 0) return "() => ({})";
    const body = names.map((n) => `try { __o[${JSON.stringify(n)}] = ${n}; } catch (__e) { __o[${JSON.stringify(n)}] = __devora.TDZ; }`).join(" ");
    return `() => { const __o = {}; ${body} return __o; }`;
  };

  const lineOf = (n: AnyNode) => (n.loc as { start: { line: number } }).start.line;
  const stepCall = (n: AnyNode, scope: Scope) => `__devora.step(${lineOf(n)}, ${getter(scope)}); `;

  const functionName = (fn: AnyNode, parent: AnyNode | null): string => {
    const id = fn.id as AnyNode | null;
    if (id) return id.name as string;
    if (parent?.type === "VariableDeclarator" && (parent.id as AnyNode).type === "Identifier") return (parent.id as AnyNode).name as string;
    if ((parent?.type === "MethodDefinition" || parent?.type === "Property") && (parent.key as AnyNode).type === "Identifier") return (parent.key as AnyNode).name as string;
    return "anonymous";
  };

  /** Statement lists whose items each get a step. */
  const statementLists = (n: AnyNode): AnyNode[][] => {
    if (n.type === "Program" || n.type === "BlockStatement") return [n.body as AnyNode[]];
    if (n.type === "SwitchStatement") return (n.cases as AnyNode[]).map((c) => c.consequent as AnyNode[]);
    return [];
  };

  /** Single-statement bodies (e.g. `for (...) x++;`) get wrapped in a block so they can be stepped. */
  const looseBodies = (n: AnyNode): AnyNode[] => {
    const out: AnyNode[] = [];
    const add = (b: unknown) => isNode(b) && b.type !== "BlockStatement" && out.push(b);
    if (n.type === "IfStatement") {
      add(n.consequent);
      add(n.alternate);
    }
    if (["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"].includes(n.type)) add(n.body);
    return out;
  };

  const visit = (node: AnyNode, scope: Scope, parent: AnyNode | null) => {
    const own = scopeOf.get(node) ?? scope;

    // Function entry / exit (and arrow expression bodies).
    if (isFunction(node)) {
      const name = JSON.stringify(functionName(node, parent));
      const body = node.body as AnyNode;
      const line = lineOf(node);
      if (body.type === "BlockStatement") {
        at(body.start + 1, ` __devora.enter(${name}, ${line}); try {`);
      } else {
        at(body.start, `{ __devora.enter(${name}, ${line}); try { ${stepCall(body, own)}return __devora.ret((`);
      }
      for (const c of children(node)) visit(c, own, node);
      if (body.type === "BlockStatement") at(body.end - 1, `} finally { __devora.exit(); } `);
      else at(body.end, `), ${lineOf(body)}); } finally { __devora.exit(); } }`);
      return;
    }

    if (node.type === "ReturnStatement" && node.argument) {
      const arg = node.argument as AnyNode;
      at(arg.start, "__devora.ret((");
      for (const c of children(node)) visit(c, own, node);
      at(arg.end, `), ${lineOf(node)})`);
      return;
    }

    const stepped = new Set(statementLists(node).flat());
    const loose = new Set(looseBodies(node));
    for (const c of children(node)) {
      if (stepped.has(c) && c.type !== "FunctionDeclaration" && c.type !== "ClassDeclaration" && c.type !== "EmptyStatement") {
        at(c.start, stepCall(c, own));
        visit(c, own, node);
      } else if (loose.has(c)) {
        at(c.start, `{ ${stepCall(c, own)}`);
        visit(c, own, node);
        at(c.end, " }");
      } else {
        visit(c, own, node);
      }
    }
  };

  visit(program, globalScope, null);

  // Apply insertions in source order; ties keep creation order.
  inserts.sort((a, b) => a.pos - b.pos || a.seq - b.seq);
  let out = "";
  let last = 0;
  for (const ins of inserts) {
    out += source.slice(last, ins.pos) + ins.text;
    last = ins.pos;
  }
  out += source.slice(last);
  return { ok: true, code: out };
}
