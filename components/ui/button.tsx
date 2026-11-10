import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/button inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-soft)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-200 text-[#14101f] shadow-[0_0_0_1px_rgb(255_255_255/0.2)_inset,0_8px_24px_-8px_rgb(157_134_247/0.6)] " +
    "hover:bg-accent-100 hover:shadow-[0_0_0_1px_rgb(255_255_255/0.3)_inset,0_10px_32px_-8px_rgb(157_134_247/0.75)]",
  secondary:
    "border border-line-strong bg-white/[0.02] text-fg hover:border-white/25 hover:bg-white/[0.06]",
  ghost: "text-fg-muted hover:bg-white/[0.05] hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-[15px]",
  lg: "h-12 px-6 text-[15px]",
};

type StyleProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function buttonClasses({ variant = "primary", size = "md", className }: Omit<StyleProps, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ComponentPropsWithoutRef<"button">) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  href,
  ...props
}: StyleProps & ComponentPropsWithoutRef<typeof Link>) {
  return <Link href={href} className={buttonClasses({ variant, size, className })} {...props} />;
}
