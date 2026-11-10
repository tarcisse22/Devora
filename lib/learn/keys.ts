/** Lightweight helpers shared by client components (no lesson content). */
export const lessonHref = (subjectSlug: string, lessonSlug: string) => `/learn/${subjectSlug}/${lessonSlug}`;
export const lessonKey = (subjectSlug: string, lessonSlug: string) => `${subjectSlug}/${lessonSlug}`;
export const LEARN_PROGRESS_KEY = "devora:learn:completed";
