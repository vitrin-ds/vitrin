import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageGridProps<E extends ElementType> = {
  /** Usually `section`, `main`, `header` or `footer`. */
  as?: E;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/**
 * Figma layout grid: 4 / 6 / 12 columns, 8px gutter, 16 / 16 / 40px margin, max 1440px.
 * Place children with `col-span-*` / `col-start-*` (desktop spans: 3 = 334px, 4 = 448px,
 * 6 = 676px, 7 = 790px, 8 = 904px at 1440). Nest with `grid-cols-subgrid`.
 */
export function PageGrid<E extends ElementType = "div">({
  as,
  className,
  ...props
}: PageGridProps<E>) {
  const Component: ElementType = as ?? "div";
  return <Component {...props} className={cn("page-grid", className)} />;
}
