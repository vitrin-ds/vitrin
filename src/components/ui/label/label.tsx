import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Label` (Color) on the indicator-* component tokens: padding 4 × 2, gap 2, radius 4,
// label-small text and an optional 8px icon. Default, Outline and Neutral have a 1px inside
// border. Non-interactive (Figma: use Button or Chip for actions). Named after the
// component, not the HTML <label> element: it renders a <span>.
export const labelVariants = cva(
  "inline-flex items-center gap-2 rounded-4 px-4 py-2 text-label-sm whitespace-nowrap",
  {
    variants: {
      color: {
        default:
          "bg-(--th-indicator-accent-surface-bg) text-(--th-indicator-accent-surface-text) inset-ring inset-ring-(--th-indicator-accent-surface-border)",
        // Neutral outline with the accent-surface icon.
        outline:
          "bg-(--th-indicator-neutral-outline-bg) text-(--th-indicator-neutral-outline-text) inset-ring inset-ring-(--th-indicator-neutral-outline-border)",
        neutral:
          "bg-(--th-indicator-neutral-soft-bg) text-(--th-indicator-neutral-soft-text) inset-ring inset-ring-(--th-indicator-neutral-soft-border)",
        accent: "bg-(--th-indicator-accent-solid-bg) text-(--th-indicator-accent-solid-text)",
        assistive:
          "bg-(--th-indicator-assistive-solid-bg) text-(--th-indicator-assistive-solid-text)",
        error: "bg-(--th-indicator-error-soft-bg) text-(--th-indicator-error-soft-text)",
        warning: "bg-(--th-indicator-warning-soft-bg) text-(--th-indicator-warning-soft-text)",
        success: "bg-(--th-indicator-success-soft-bg) text-(--th-indicator-success-soft-text)",
        info: "bg-(--th-indicator-info-soft-bg) text-(--th-indicator-info-soft-text)",
      },
    },
  },
);

const ICON_CLASS = {
  default: "text-(--th-indicator-accent-surface-icon)",
  outline: "text-(--th-indicator-accent-surface-icon)",
  // Figma binds the semantic icon-secondary here; indicator-neutral-soft-icon has the same intent.
  neutral: "text-(--th-indicator-neutral-soft-icon)",
  accent: "text-(--th-indicator-accent-solid-icon)",
  assistive: "text-(--th-indicator-assistive-solid-icon)",
  error: "text-(--th-indicator-error-soft-icon)",
  warning: "text-(--th-indicator-warning-soft-icon)",
  success: "text-(--th-indicator-success-soft-icon)",
  info: "text-(--th-indicator-info-soft-icon)",
} as const;

export const LABEL_DEFAULTS = {
  color: "default",
} as const satisfies Required<VariantProps<typeof labelVariants>>;

export interface LabelProps extends Omit<ComponentPropsWithoutRef<"span">, "children" | "color"> {
  /** Figma `Color`. */
  color?: NonNullable<VariantProps<typeof labelVariants>["color"]>;
  /** Figma `Label Text`: one or two words. */
  children: ReactNode;
  /** Figma `Left Icon` (8px). Decorative. */
  icon?: IconName;
}

export function Label({
  color = LABEL_DEFAULTS.color,
  icon,
  children,
  className,
  ...props
}: LabelProps) {
  return (
    <span {...props} className={cn(labelVariants({ color }), className)}>
      {icon && <Icon name={icon} size="8" tone="current" className={ICON_CLASS[color]} />}
      {children}
    </span>
  );
}
