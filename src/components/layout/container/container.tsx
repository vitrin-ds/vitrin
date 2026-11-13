import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<E extends ElementType> = {
  as?: E;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/**
 * Centred content column without the grid: max 1440px with the page margin
 * (16 / 16 / 40px). Use PageGrid when children align to columns.
 */
export function Container<E extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<E>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      {...props}
      className={cn("mx-auto w-full max-w-(--breakpoint-wide) px-(--th-grid-margin)", className)}
    />
  );
}
