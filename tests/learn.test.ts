import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { allLessons, subjects } from "../lib/learn";
import { SEED_SQL } from "../lib/sql/seed";
import { algorithms } from "../lib/algorithms/catalog";
import { dataStructures } from "../lib/data-structures/catalog";
import { challenges } from "../lib/practice/challenges";
import { projects } from "../lib/projects/projects";
import { decodeCode, encodeCode } from "../lib/execution/share";

const routes = new Set([
  "/", "/learn", "/practice", "/playground", "/visualize", "/projects", "/community", "/code-tracer", "/sql-lab", "/get-started", "/sign-in",
  ...subjects.map((s) => `/learn/${s.slug}`),
  ...allLessons.map(({ subject, lesson }) => `/learn/${subject.slug}/${lesson.slug}`),
  ...algorithms.map((a) => `/visualize/algorithms/${a.slug}`),
  ...dataStructures.map((d) => `/visualize/data-structures/${d.slug}`),
  ...challenges.map((c) => `/practice/${c.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
]);

test("8 subjects with 3 complete lessons each", () => {
  assert.equal(subjects.length, 8);
  for (const s of subjects) {
    assert.equal(s.lessons.length, 3, s.slug);
    assert.equal(new Set(s.lessons.map((l) => l.slug)).size, 3);
    for (const l of s.lessons) {
      assert.ok(l.blocks.length >= 3, `${l.slug}: has content`);
      assert.ok(l.quiz.length >= 2, `${l.slug}: has exercises`);
      assert.ok(l.related.length >= 1, `${l.slug}: has related topics`);
      for (const q of l.quiz) assert.ok(q.answer >= 0 && q.answer < q.options.length, `${l.slug}: valid answer index`);
    }
  }
});

test("every related link and tool link points to a real page", () => {
  for (const { lesson } of allLessons) {
    const hrefs = [...lesson.related.map((r) => r.href), ...lesson.blocks.flatMap((b) => (b.type === "tool" ? [b.href] : []))];
    for (const href of hrefs) assert.ok(routes.has(href.split("#")[0]), `${lesson.slug}: broken link ${href}`);
  }
});

test("every runnable JavaScript example runs without errors and prints output", () => {
  for (const { lesson } of allLessons) {
    for (const b of lesson.blocks) {
      if (b.type !== "code" || b.language !== "javascript" || !b.runnable) continue;
      const out: string[] = [];
      new Function("console", b.code)({ log: (...a: unknown[]) => out.push(a.map(String).join(" ")) });
      assert.ok(out.length > 0, `${lesson.slug}: example prints something`);
    }
  }
});

test("every runnable SQL example runs against the SQL Lab sample database", async () => {
  const SQL = await initSqlJs();
  for (const { lesson } of allLessons) {
    for (const b of lesson.blocks) {
      if (b.type !== "code" || b.language !== "sql" || !b.runnable) continue;
      const db = new SQL.Database();
      db.exec(SEED_SQL);
      const res = db.exec(b.code);
      assert.ok(res.length > 0 && res[0].values.length > 0, `${lesson.slug}: SQL example returns rows`);
    }
  }
});

test("code share links round-trip, including non-ASCII text", () => {
  for (const code of ["console.log('héllo → 世界')", "x = 1\nprint(x)", ""]) assert.equal(decodeCode(encodeCode(code)), code);
  assert.equal(decodeCode("%%%not-base64"), null);
});
