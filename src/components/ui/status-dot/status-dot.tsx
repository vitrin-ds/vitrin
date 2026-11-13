import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Figma `Status Dot` (Status × Size) on the indicator-dot-* tokens: a plain circle, 6 · 8 · 12 · 16.
// `.Base.StatusDot`'s Show Small / Medium / Large / X-Large booleans are the size slot.
export const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    status: {
      success: "bg-(--th-indicator-dot-success)",
      error: "bg-(--th-indicator-dot-error)",
      warning: "bg-(--th-indicator-dot-warning)",
      info: "bg-(--th-indicator-dot-info)",
      neutral: "bg-(--th-indicator-dot-neutral)",
    },
    size: { sm: "size-6", md: "size-8", lg: "size-12", xl: "size-16" },
  },
});

export const STATUS_DOT_DEFAULTS = {
  status: "success",
  size: "sm",
} as const satisfies Required<VariantProps<typeof statusDotVariants>>;

type StatusDotVariants = VariantProps<typeof statusDotVariants>;

export interface StatusDotProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  status?: NonNullable<StatusDotVariants["status"]>;
  size?: NonNullable<StatusDotVariants["size"]>;
  /**
   * What the colour means ("In stock"). Pass `null` when visible text next to the dot already
   * says it (Figma: "Don't use without contextual label").
   */
  label: string | null;
}

export function StatusDot({
  status = STATUS_DOT_DEFAULTS.status,
  size = STATUS_DOT_DEFAULTS.size,
  label,
  className,
  ...props
}: StatusDotProps) {
  const a11y = label === null ? { "aria-hidden": true } : { role: "img", "aria-label": label };
  return (
    <span {...props} {...a11y} className={cn(statusDotVariants({ status, size }), className)} />
  );
}
