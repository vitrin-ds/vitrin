import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type VisuallyHiddenProps<E extends ElementType> = {
  as?: E;
  /**
   * Show the content while it has keyboard focus (skip links).
   * Uses the global focus ring like any other control.
   */
  focusable?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/** Hidden on screen, still read by screen readers. */
export function VisuallyHidden<E extends ElementType = "span">({
  as,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps<E>) {
  const Component: ElementType = as ?? "span";
  return (
    <Component {...props} className={cn(focusable ? "not-focus:sr-only" : "sr-only", className)} />
  );
}
