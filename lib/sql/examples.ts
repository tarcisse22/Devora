export type SqlExample = { id: string; topic: string; title: string; sql: string };

/** Example queries — each one is executed in tests against the sample data. */
export const sqlExamples: SqlExample[] = [
  {
    id: "select",
    topic: "SELECT",
    title: "Select columns",
    sql: `-- Pick the columns you need from a table.
SELECT name, major, gpa
FROM students;`,
  },
  {
    id: "where",
    topic: "WHERE",
    title: "Filter rows",
    sql: `-- Computer Science students with a GPA of at least 3.5.
SELECT name, year, gpa
FROM students
WHERE major = 'Computer Science'
  AND gpa >= 3.5;`,
  },
  {
    id: "null",
    topic: "WHERE",
    title: "Find missing values (NULL)",
    sql: `-- NULL means "unknown": compare it with IS NULL, never "= NULL".
SELECT name, major, gpa
FROM students
WHERE major IS NULL OR gpa IS NULL;`,
  },
  {
    id: "order-by",
    topic: "ORDER BY",
    title: "Sort and limit",
    sql: `-- The five highest-paid employees.
SELECT name, title, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;`,
  },
  {
    id: "group-by",
    topic: "GROUP BY",
    title: "Aggregate per group",
    sql: `-- Number of students and average GPA for each major.
SELECT major,
       COUNT(*)           AS students,
       ROUND(AVG(gpa), 2) AS avg_gpa
FROM students
WHERE major IS NOT NULL
GROUP BY major
ORDER BY students DESC;`,
  },
  {
    id: "having",
    topic: "GROUP BY",
    title: "Filter groups with HAVING",
    sql: `-- Departments whose average salary is above 100,000.
SELECT d.name, ROUND(AVG(e.salary)) AS avg_salary, COUNT(*) AS staff
FROM employees e
JOIN departments d ON d.id = e.department_id
GROUP BY d.name
HAVING AVG(e.salary) > 100000;`,
  },
  {
    id: "inner-join",
    topic: "JOIN",
    title: "Inner join",
    sql: `-- Which student took which course, and their grade.
SELECT s.name AS student, c.code, c.title, en.grade
FROM enrollments en
JOIN students s ON s.id = en.student_id
JOIN courses  c ON c.id = en.course_id
ORDER BY s.name, c.code;`,
  },
  {
    id: "left-join",
    topic: "JOIN",
    title: "Left join (keep unmatched rows)",
    sql: `-- Every student, including those with no enrollments.
SELECT s.name, COUNT(en.course_id) AS courses_taken
FROM students s
LEFT JOIN enrollments en ON en.student_id = s.id
GROUP BY s.id
ORDER BY courses_taken, s.name;`,
  },
  {
    id: "self-join",
    topic: "JOIN",
    title: "Self join (employee → manager)",
    sql: `-- A table joined with itself: each employee and their manager.
SELECT e.name AS employee, e.title, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY manager, employee;`,
  },
  {
    id: "subquery",
    topic: "Subqueries",
    title: "Subquery",
    sql: `-- Employees who earn more than the company average.
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;`,
  },
  {
    id: "insert",
    topic: "INSERT",
    title: "Insert a row",
    sql: `-- Add a student, then check it worked.
INSERT INTO students (id, name, major, year, gpa)
VALUES (13, 'Maya Patel', 'Computer Science', 1, 3.70);

SELECT * FROM students WHERE id = 13;`,
  },
  {
    id: "update",
    topic: "UPDATE",
    title: "Update rows",
    sql: `-- Give every Computer Science employee a 5% raise.
UPDATE employees
SET salary = ROUND(salary * 1.05)
WHERE department_id = 1;

SELECT name, salary FROM employees WHERE department_id = 1;`,
  },
  {
    id: "delete",
    topic: "DELETE",
    title: "Delete rows",
    sql: `-- Remove enrollments that have no grade yet.
DELETE FROM enrollments
WHERE grade IS NULL;

SELECT COUNT(*) AS remaining_enrollments FROM enrollments;`,
  },
];
