import { Box, ChartNoAxesColumn, Code, CodeXml, Layers, Users, Zap, type LucideIcon } from "lucide-react";

export type Feature = {
  /** Anchor id so primary navigation can link to the feature. */
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    id: "learn",
    title: "Interactive Learning",
    description: "Visualize and understand core concepts.",
    icon: CodeXml,
  },
  {
    id: "practice",
    title: "Practice & Grow",
    description: "Solve programming problems and track your progress.",
    icon: Zap,
  },
  {
    id: "projects",
    title: "Build Projects",
    description: "Apply your skills through practical projects.",
    icon: Layers,
  },
];

export type Stat = {
  value: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Placeholder figures for the design preview. These are NOT real platform
 * metrics — replace them with live data once it exists, and keep the
 * on-page disclaimer until then.
 */
export const placeholderStats: Stat[] = [
  { value: "120K+", label: "Learners", icon: Users },
  { value: "300+", label: "Visualizers", icon: Code },
  { value: "50+", label: "Projects", icon: Box },
  { value: "1000+", label: "Practice Problems", icon: ChartNoAxesColumn },
];
