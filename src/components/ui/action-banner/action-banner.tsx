import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconProps } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Action Banner` (Width × Color, main 30883:565818) on `.Base Action Banner`: an inline
// banner for neutral announcements and guidance, not a semantic Alert. Padding 16, gap 12: the
// left icon in a 44px tile (padding 12, radius 8, a 1px border in the banner's border colour;
// surface-primary, surface-neutral for Light), the title (title-medium) over the description
// (body-medium), both in the callout text colour, and an optional action (`Button [Action]`, an
// Outline button) on the right. Width Card: radius 8 and a border all round; Full Width: top and
// bottom borders only. Color Neutral = callout-neutral-surface, Light = callout-neutral-outline,
// Accent = callout-accent-surface (the callout family's component tokens).

export const actionBannerVariants = cva("flex items-center gap-12 p-16", {
  variants: {
    color: {
      neutral:
        "border-(--th-callout-neutral-surface-border) bg-(--th-callout-neutral-surface-bg) text-(--th-callout-neutral-surface-text) inset-ring-(--th-callout-neutral-surface-border)",
      light:
        "border-(--th-callout-neutral-outline-border) bg-(--th-callout-neutral-outline-bg) text-(--th-callout-neutral-outline-text) inset-ring-(--th-callout-neutral-outline-border)",
      accent:
        "border-(--th-callout-accent-surface-border) bg-(--th-callout-accent-surface-bg) text-(--th-callout-accent-surface-text) inset-ring-(--th-callout-accent-surface-border)",
    },
    width: {
      card: "rounded-card inset-ring",
      full: "border-y",
    },
  },
});

const TILE_CLASS = {
  neutral: "bg-surface-primary inset-ring-(--th-callout-neutral-surface-border)",
  light: "bg-surface-neutral inset-ring-(--th-callout-neutral-outline-border)",
  accent: "bg-surface-primary inset-ring-(--th-callout-accent-surface-border)",
} as const;

const ICON_CLASS = {
  neutral: "text-(--th-callout-neutral-surface-icon)",
  light: "text-(--th-callout-neutral-outline-icon)",
  accent: "text-(--th-callout-accent-surface-icon)",
} as const;

export const ACTION_BANNER_DEFAULTS = { color: "accent", width: "full" } as const;

type ActionBannerVariants = VariantProps<typeof actionBannerVariants>;

export interface ActionBannerProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title" | "color"
> {
  /** Figma `Color`. */
  color?: NonNullable<ActionBannerVariants["color"]>;
  /** Figma `Width`: Full Width for page bands, Card inside cards, sheets and forms. */
  width?: NonNullable<ActionBannerVariants["width"]>;
  /** Figma `Left Icon` (`Show Left Icon`). Decorative. */
  icon?: IconName;
  /**
   * The icon's colour token when it carries a state (a delivered parcel: `success`); by default
   * the banner's icon colour.
   */
  iconTone?: Exclude<NonNullable<IconProps["tone"]>, "current">;
  /** Figma icon `Fill` (default On); Off for an outlined glyph (the tracking note's schedule). */
  iconFill?: boolean;
  /** Figma `Title Text` (`Show Title`). */
  title?: ReactNode;
  /** Figma `Description Text` (`Show Description Text`). */
  children?: ReactNode;
  /** Figma `Button [Action]` (`Show Button [Action]`): an Outline button or link. */
  action?: ReactNode;
}

export function ActionBanner({
  color = ACTION_BANNER_DEFAULTS.color,
  width = ACTION_BANNER_DEFAULTS.width,
  icon,
  iconTone,
  iconFill,
  title,
  children,
  action,
  className,
  ...props
}: ActionBannerProps) {
  return (
    <div {...props} className={cn(actionBannerVariants({ color, width }), className)}>
      {icon && (
        <span
          aria-hidden
          className={cn("flex shrink-0 rounded-8 p-12 inset-ring", TILE_CLASS[color])}
        >
          {iconTone ? (
            <Icon name={icon} tone={iconTone} fill={iconFill} />
          ) : (
            <Icon name={icon} tone="current" fill={iconFill} className={ICON_CLASS[color]} />
          )}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {title && <p className="text-title-md">{title}</p>}
        {children && <div className="text-body-md">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
