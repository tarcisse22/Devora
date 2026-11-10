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
