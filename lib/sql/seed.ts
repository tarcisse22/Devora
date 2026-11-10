/**
 * Sample database for the SQL Lab. All names and figures are fictional and
 * exist only for practice queries.
 */
export const SEED_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE departments (
  id        INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL UNIQUE,
  building  TEXT    NOT NULL,
  budget    INTEGER NOT NULL
);

CREATE TABLE employees (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  title         TEXT    NOT NULL,
  salary        INTEGER NOT NULL,
  hire_date     TEXT    NOT NULL,
  manager_id    INTEGER REFERENCES employees(id)
);

CREATE TABLE students (
  id     INTEGER PRIMARY KEY,
  name   TEXT    NOT NULL,
  major  TEXT,
  year   INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  gpa    REAL    CHECK (gpa BETWEEN 0 AND 4)
);

CREATE TABLE courses (
  id            INTEGER PRIMARY KEY,
  code          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  credits       INTEGER NOT NULL
);

CREATE TABLE enrollments (
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id  INTEGER NOT NULL REFERENCES courses(id),
  term       TEXT    NOT NULL,
  grade      TEXT,
  PRIMARY KEY (student_id, course_id, term)
);

INSERT INTO departments (id, name, building, budget) VALUES
  (1, 'Computer Science', 'Turing Hall', 950000),
  (2, 'Mathematics', 'Noether Hall', 620000),
  (3, 'Physics', 'Curie Lab', 710000),
  (4, 'Information Systems', 'Hopper Center', 480000),
  (5, 'Student Services', 'Main Building', 300000);

INSERT INTO employees (id, name, department_id, title, salary, hire_date, manager_id) VALUES
  (1, 'Amara Okafor', 1, 'Department Chair', 142000, '2014-08-15', NULL),
  (2, 'Lucas Ferreira', 1, 'Professor', 118000, '2016-01-10', 1),
  (3, 'Mei Tanaka', 1, 'Associate Professor', 104000, '2019-08-20', 1),
  (4, 'Noah Schmidt', 1, 'Lecturer', 78000, '2022-09-01', 1),
  (5, 'Priya Raman', 2, 'Department Chair', 131000, '2013-07-01', NULL),
  (6, 'Daniel Mensah', 2, 'Professor', 112000, '2017-08-28', 5),
  (7, 'Sofia Lindqvist', 3, 'Department Chair', 136000, '2012-09-03', NULL),
  (8, 'Omar Haddad', 3, 'Research Scientist', 97000, '2020-02-17', 7),
  (9, 'Grace Chen', 4, 'Department Chair', 125000, '2015-06-22', NULL),
  (10, 'Ethan Brooks', 4, 'Systems Analyst', 84000, '2021-03-08', 9),
  (11, 'Zara Ahmed', 5, 'Advisor', 61000, '2023-01-09', NULL),
  (12, 'Leo Rossi', NULL, 'Visiting Researcher', 69000, '2024-09-02', 1);

INSERT INTO students (id, name, major, year, gpa) VALUES
  (1, 'Ada Nwosu', 'Computer Science', 3, 3.82),
  (2, 'Ben Carter', 'Mathematics', 2, 3.15),
  (3, 'Chloe Martin', 'Computer Science', 4, 3.67),
  (4, 'Diego Alvarez', 'Physics', 1, 2.94),
  (5, 'Emma Johansson', 'Information Systems', 3, 3.48),
  (6, 'Farah Siddiqui', 'Computer Science', 2, 3.91),
  (7, 'Gabriel Dubois', 'Mathematics', 4, 3.33),
  (8, 'Hana Kim', 'Computer Science', 1, 3.05),
  (9, 'Isaac Mwangi', 'Physics', 3, 3.71),
  (10, 'Julia Novak', 'Information Systems', 2, 2.88),
  (11, 'Kofi Asante', NULL, 1, NULL),
  (12, 'Lina Haddad', 'Computer Science', 3, 3.56);

INSERT INTO courses (id, code, title, department_id, credits) VALUES
  (1, 'CS101', 'Introduction to Programming', 1, 4),
  (2, 'CS201', 'Data Structures', 1, 4),
  (3, 'CS301', 'Algorithms', 1, 4),
  (4, 'CS340', 'Databases', 1, 3),
  (5, 'MA150', 'Discrete Mathematics', 2, 3),
  (6, 'MA210', 'Linear Algebra', 2, 3),
  (7, 'PH110', 'Mechanics', 3, 4),
  (8, 'IS220', 'Systems Analysis', 4, 3);

INSERT INTO enrollments (student_id, course_id, term, grade) VALUES
  (1, 2, '2025-FA', 'A'), (1, 3, '2026-SP', 'A'), (1, 4, '2026-SP', 'B'),
  (2, 5, '2025-FA', 'B'), (2, 6, '2026-SP', 'B'),
  (3, 3, '2025-FA', 'A'), (3, 4, '2025-FA', 'A'), (3, 8, '2026-SP', 'B'),
  (4, 7, '2025-FA', 'C'), (4, 1, '2026-SP', NULL),
  (5, 8, '2025-FA', 'A'), (5, 4, '2026-SP', 'B'),
  (6, 1, '2025-FA', 'A'), (6, 2, '2026-SP', 'A'), (6, 5, '2026-SP', 'A'),
  (7, 6, '2025-FA', 'B'), (7, 3, '2026-SP', 'C'),
  (8, 1, '2026-SP', NULL),
  (9, 7, '2025-FA', 'A'), (9, 6, '2026-SP', 'A'),
  (10, 8, '2026-SP', 'C'), (10, 1, '2025-FA', 'B'),
  (12, 2, '2025-FA', 'B'), (12, 4, '2026-SP', 'A');
`;
