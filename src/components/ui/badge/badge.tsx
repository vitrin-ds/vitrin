import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `Badge` (Usage × Color) on the indicator-* component tokens: a pill with a 1px inside
// border (inset-ring) and label-small text. Mid 22 · Small 18 tall, at least as wide. Figma
// Color → tone/emphasis: Light = accent surface (subtle bg), Dark = accent solid,
// Green / Red / Yellow = success / error / warning soft. Informational only, never interactive.
export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-4 text-label-sm tabular-nums inset-ring",
  {
    variants: {
      color: {
        light:
          "bg-(--th-indicator-accent-surface-bg-subtle) text-(--th-indicator-accent-surface-text) inset-ring-(--th-indicator-accent-surface-border)",
        // Figma pairs the solid fill with the accent-surface border.
        dark: "bg-(--th-indicator-accent-solid-bg) text-(--th-indicator-accent-solid-text) inset-ring-(--th-indicator-accent-surface-border)",
        green:
          "bg-(--th-indicator-success-soft-bg) text-(--th-indicator-success-soft-text) inset-ring-(--th-indicator-success-soft-border)",
        red: "bg-(--th-indicator-error-soft-bg) text-(--th-indicator-error-soft-text) inset-ring-(--th-indicator-error-soft-border)",
        yellow:
          "bg-(--th-indicator-warning-soft-bg) text-(--th-indicator-warning-soft-text) inset-ring-(--th-indicator-warning-soft-border)",
      },
      size: {
        mid: "min-h-22 min-w-22",
        small: "min-h-18 min-w-18",
      },
    },
  },
);

export const BADGE_DEFAULTS = {
  color: "light",
  size: "mid",
} as const satisfies Required<VariantProps<typeof badgeVariants>>;

/** Figma Don't: "use 99+ for counts over 99". */
export const BADGE_MAX_COUNT = 99;

export function formatBadgeCount(count: number): string {
  return count > BADGE_MAX_COUNT ? `${BADGE_MAX_COUNT}+` : String(count);
}

type BadgeVariants = VariantProps<typeof badgeVariants>;

export type BadgeProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "color"> & {
  /** Figma `Color`: Red urgent · Green success · Yellow pending · Dark / Light neutral counts. */
  color?: NonNullable<BadgeVariants["color"]>;
  /** Figma `Usage`: Small for icon overlays, Mid standalone. */
  size?: NonNullable<BadgeVariants["size"]>;
} & (
    | { /** A count; shown as "99+" above 99. */ count: number; children?: never }
    | { count?: never; /** Figma `Label` text. */ children: ReactNode }
  );

/**
 * Over an icon the visible number has no context: give the badge an `aria-label`
 * ("3 items in basket") or describe it in the parent control's name.
 */
export function Badge({
  color = BADGE_DEFAULTS.color,
  size = BADGE_DEFAULTS.size,
  count,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span {...props} className={cn(badgeVariants({ color, size }), className)}>
      {count !== undefined ? formatBadgeCount(count) : children}
    </span>
  );
}
