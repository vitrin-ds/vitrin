import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

// Figma Spinner: a 270° icon-accent arc (stroke = size / 10, gap top-right) around an
// accent-subtle disc. Sizes X-Small 12 · Small 16 · Medium 24 · Large 32.
export const spinnerVariants = cva("inline-block shrink-0 motion-safe:animate-spin", {
  variants: {
    size: { xs: "size-12", sm: "size-16", md: "size-24", lg: "size-32" },
  },
});

export const SPINNER_DEFAULTS = {
  size: "xs",
} as const satisfies Required<VariantProps<typeof spinnerVariants>>;

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** Figma `Size`: X-Small for buttons, Large for page loading. */
  size?: NonNullable<VariantProps<typeof spinnerVariants>["size"]>;
  /**
   * Announced to screen readers ("Loading products"). Pass `null` when the surrounding
   * control already announces the busy state, e.g. a button with `aria-busy`.
   */
  label: string | null;
}

// Drawn on a 24-unit grid and scaled by the size class, so the stroke stays size / 10.
const DISC =
  "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-10.44 0a1.44 1.44 0 1 0 2.88 0 1.44 1.44 0 0 0-2.88 0Z";

export function Spinner({
  size = SPINNER_DEFAULTS.size,
  label,
  className,
  ...props
}: SpinnerProps) {
  const graphic = (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={cn(spinnerVariants({ size }), label === null && className)}
    >
      <path d={DISC} fillRule="evenodd" className="fill-surface-accent-subtle" />
      <circle
        cx="12"
        cy="12"
        r="10.8"
        fill="none"
        strokeWidth="2.4"
        pathLength={100}
        strokeDasharray="75 25"
        className="stroke-icon-accent"
      />
    </svg>
  );

  if (label === null) return graphic;

  return (
    <span {...props} role="status" className={cn("inline-flex", className)}>
      {graphic}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
