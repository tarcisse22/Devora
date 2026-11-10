import type { Lesson, Subject } from "./types";
import { dataStructuresSubject, fundamentals } from "./content/fundamentals-ds";
import { algorithmsSubject, oopSubject } from "./content/algorithms-oop";
import { databasesSubject, osSubject } from "./content/systems";
import { networksSubject, softwareEngineeringSubject } from "./content/networks-se";

export const subjects: Subject[] = [
  fundamentals,
  dataStructuresSubject,
  algorithmsSubject,
  oopSubject,
  osSubject,
  databasesSubject,
  networksSubject,
  softwareEngineeringSubject,
];

export const subjectBySlug = (slug: string) => subjects.find((s) => s.slug === slug);

/** Every lesson in reading order, with its subject. */
export const allLessons: { subject: Subject; lesson: Lesson }[] = subjects.flatMap((subject) => subject.lessons.map((lesson) => ({ subject, lesson })));

export function findLesson(subjectSlug: string, lessonSlug: string) {
  const index = allLessons.findIndex((l) => l.subject.slug === subjectSlug && l.lesson.slug === lessonSlug);
  if (index === -1) return null;
  return { ...allLessons[index], prev: allLessons[index - 1] ?? null, next: allLessons[index + 1] ?? null };
}

export { LEARN_PROGRESS_KEY, lessonHref, lessonKey } from "./keys";

/** Rough reading time from the lesson's text (about 200 words per minute). */
export function readingMinutes(lesson: Lesson): number {
  const words = lesson.blocks
    .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : "code" in b ? b.code : ""))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
