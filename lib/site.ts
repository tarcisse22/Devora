export const siteConfig = {
  name: "Devora",
  description:
    "Learn Computer Science by doing: interactive visualizations, real code, challenges and practical projects.",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/** Primary navigation — every entry is a real route. */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Practice", href: "/practice" },
  { label: "Playground", href: "/playground" },
  { label: "Visualize", href: "/visualize" },
  { label: "Projects", href: "/projects" },
  { label: "Community", href: "/community" },
];

/**
 * Homepage walkthrough video. No video has been recorded yet, so `src` is
 * null and the player shows an honest "not available yet" state. To publish
 * one, drop the file in /public/videos and set `src` (and optionally
 * `poster` and `duration`, e.g. "3:12").
 */
export const walkthroughVideo: {
  src: string | null;
  poster: string | null;
  duration: string | null;
} = {
  src: null,
  poster: null,
  duration: null,
};
