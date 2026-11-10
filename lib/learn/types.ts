export type CodeLanguage = "javascript" | "python" | "sql" | "c" | "cpp" | "text";

/** Building blocks of a lesson. */
export type LessonBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; language: CodeLanguage; code: string; caption?: string; runnable?: boolean; traceable?: boolean }
  | { type: "callout"; tone: "note" | "tip" | "warning"; text: string }
  | { type: "diagram"; text: string; caption: string }
  | { type: "tool"; href: string; title: string; text: string };

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
  quiz: QuizQuestion[];
  /** Related Devora pages (lessons, tools, challenges). */
  related: { label: string; href: string }[];
};

export type Subject = {
  slug: string;
  name: string;
  description: string;
  lessons: Lesson[];
};
