export const siteConfig = {
  name: "Devora",
  description:
    "Interactive visualizers, hands-on problem solving, and real-world projects for learning Computer Science.",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation. Routes are placeholders until each section is built;
 * they point at in-page anchors so links never 404.
 */
export const mainNav: NavItem[] = [
  { label: "Learn", href: "#learn" },
  { label: "Practice", href: "#practice" },
  { label: "Visualize", href: "#visualize" },
  { label: "Projects", href: "#projects" },
  { label: "Community", href: "#community" },
];
