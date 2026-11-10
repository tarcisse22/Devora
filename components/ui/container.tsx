import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Horizontal page gutter + max width shared by every section. */
export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10", className)} {...props} />;
}
