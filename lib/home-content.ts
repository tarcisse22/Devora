import { CodeXml, Layers, Zap, type LucideIcon } from "lucide-react";

export type HeroPillar = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

/** The three pillars shown beneath the hero call-to-actions. */
export const heroPillars: HeroPillar[] = [
  {
    title: "Interactive Learning",
    description: "Visualize and understand core concepts.",
    href: "/learn",
    icon: CodeXml,
  },
  {
    title: "Practice & Grow",
    description: "Solve programming problems with real test cases.",
    href: "/practice",
    icon: Zap,
  },
  {
    title: "Build Projects",
    description: "Apply your skills through practical projects.",
    href: "/projects",
    icon: Layers,
  },
];
