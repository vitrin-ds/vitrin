import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Alert` (Usage × Width) on the callout-{tone}-soft-* component tokens: icon, title
// (title-medium) and description (body-medium) in the tone's text colour; padding 16, gap 12.
// Card: 1px border all round + radius 8 (inset-ring, Figma inside stroke). Full Width: border
// top and bottom, no radius. Each tone has its own glyph (ALERT_ICONS).

export const alertVariants = cva("flex items-center gap-12 p-16", {
  variants: {
    usage: {
      informative:
        "border-(--th-callout-info-soft-border) bg-(--th-callout-info-soft-bg) text-(--th-callout-info-soft-text) inset-ring-(--th-callout-info-soft-border)",
      positive:
        "border-(--th-callout-success-soft-border) bg-(--th-callout-success-soft-bg) text-(--th-callout-success-soft-text) inset-ring-(--th-callout-success-soft-border)",
      notice:
        "border-(--th-callout-warning-soft-border) bg-(--th-callout-warning-soft-bg) text-(--th-callout-warning-soft-text) inset-ring-(--th-callout-warning-soft-border)",
      negative:
        "border-(--th-callout-error-soft-border) bg-(--th-callout-error-soft-bg) text-(--th-callout-error-soft-text) inset-ring-(--th-callout-error-soft-border)",
      neutral:
        "border-(--th-callout-neutral-soft-border) bg-(--th-callout-neutral-soft-bg) text-(--th-callout-neutral-soft-text) inset-ring-(--th-callout-neutral-soft-border)",
    },
    width: {
      card: "rounded-card inset-ring",
      full: "border-y",
    },
  },
});

const ICON_CLASS = {
  informative: "text-(--th-callout-info-soft-icon)",
  positive: "text-(--th-callout-success-soft-icon)",
  notice: "text-(--th-callout-warning-soft-icon)",
  negative: "text-(--th-callout-error-soft-icon)",
  neutral: "text-(--th-callout-neutral-soft-icon)",
} as const;

/** Figma: Negative `error`, Positive `check_circle`, Notice `warning`, the others `info`. */
export const ALERT_ICONS = {
  informative: "info",
  positive: "check_circle",
  notice: "warning",
  negative: "error",
  neutral: "info",
} as const satisfies Record<keyof typeof ICON_CLASS, IconName>;

export const ALERT_DEFAULTS = {
  usage: "notice",
  width: "full",
} as const;

type AlertVariants = VariantProps<typeof alertVariants>;

export interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  /** Figma `Usage`: Informative (blue) · Positive (green) · Notice (yellow) · Negative (red) · Neutral. */
  usage?: NonNullable<AlertVariants["usage"]>;
  /** Figma `Width`: Full Width for page bands, Card inside cards and forms. */
  width?: NonNullable<AlertVariants["width"]>;
  /** Figma `Title Text`. */
  title?: ReactNode;
  /** Figma `Description Text`. */
  children?: ReactNode;
  /** Figma `Left Icon`; defaults to the tone's glyph. Always shown (Figma: "Don't hide the icon"). Decorative. */
  icon?: IconName;
}

/**
 * Negative alerts interrupt (`role="alert"`); the others are polite status messages. Render
 * an alert that appears after an action into the page once, so it is announced.
 */
export function Alert({
  usage = ALERT_DEFAULTS.usage,
  width = ALERT_DEFAULTS.width,
  icon,
  title,
  children,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role={usage === "negative" ? "alert" : "status"}
      {...props}
      className={cn(alertVariants({ usage, width }), className)}
    >
      <Icon name={icon ?? ALERT_ICONS[usage]} tone="current" className={ICON_CLASS[usage]} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {title && <p className="text-title-md">{title}</p>}
        {children && <div className="text-body-md">{children}</div>}
      </div>
    </div>
  );
}
