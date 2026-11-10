import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { SEED_SQL } from "../lib/sql/seed";
import { sqlExamples } from "../lib/sql/examples";

async function freshDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.exec(SEED_SQL);
  return db;
}

const scalar = (db: Awaited<ReturnType<typeof freshDb>>, sql: string) => db.exec(sql)[0].values[0][0];

test("sample database has the expected tables and row counts", async () => {
  const db = await freshDb();
  const counts = Object.fromEntries(
    ["departments", "employees", "students", "courses", "enrollments"].map((t) => [t, scalar(db, `SELECT COUNT(*) FROM ${t}`)]),
  );
  assert.deepEqual(counts, { departments: 5, employees: 12, students: 12, courses: 8, enrollments: 24 });
  // Foreign keys are consistent.
  assert.equal(scalar(db, "SELECT COUNT(*) FROM enrollments e LEFT JOIN students s ON s.id = e.student_id WHERE s.id IS NULL"), 0);
  assert.equal(scalar(db, "SELECT COUNT(*) FROM enrollments e LEFT JOIN courses c ON c.id = e.course_id WHERE c.id IS NULL"), 0);
});

for (const ex of sqlExamples) {
  test(`example "${ex.title}" runs and returns rows`, async () => {
    const db = await freshDb();
    const results = db.exec(ex.sql);
    assert.ok(results.length > 0, "returns a result set");
    assert.ok(results.at(-1)!.values.length > 0, "result set has rows");
  });
}

test("examples produce the documented answers", async () => {
  const db = await freshDb();
  const run = (id: string) => db.exec(sqlExamples.find((e) => e.id === id)!.sql).at(-1)!;
  assert.deepEqual(run("where").values.map((r) => r[0]), ["Ada Nwosu", "Chloe Martin", "Farah Siddiqui", "Lina Haddad"]);
  assert.deepEqual(run("null").values.map((r) => r[0]), ["Kofi Asante"]);
  assert.equal(run("order-by").values[0][0], "Amara Okafor");
  assert.deepEqual(run("group-by").values[0], ["Computer Science", 5, 3.6]);
  assert.equal(run("left-join").values[0][0], "Kofi Asante");
  assert.equal(run("left-join").values[0][1], 0);
  assert.equal(run("insert").values[0][1], "Maya Patel");
});

test("constraints reject bad data", async () => {
  const db = await freshDb();
  assert.throws(() => db.exec("INSERT INTO students (id, name, year) VALUES (99, 'X', 7)"), /CHECK constraint failed/);
  assert.throws(() => db.exec("INSERT INTO students (id, name, year) VALUES (1, 'Dup', 1)"), /UNIQUE constraint failed/);
  assert.throws(() => db.exec("SELECT * FROM nope"), /no such table: nope/);
});
