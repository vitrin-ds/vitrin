import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Button Group` (Style × Position × State × Size) on `.Base Segment`. Position is not a
// prop: the first segment is Left, the last is Right, the rest are Center, so a group can't get it
// wrong. Hover, Active and Disabled are CSS states; a selected segment reads as the other Style.
// Strokes as in Figma, inside the fixed height: Accent and Disabled only divide the segments;
// White also draws the outline.

const STYLES = {
  accent: [
    "border-r border-border-default last:border-r-0",
    "bg-interactive-default text-text-on-accent",
    "enabled:hover:bg-interactive-hover enabled:focus-visible:bg-interactive-hover enabled:active:bg-interactive-active",
    // Selected reads as the other Style: a White segment, with its outline.
    "enabled:aria-pressed:bg-surface-primary enabled:aria-pressed:text-text-primary",
    "enabled:aria-pressed:inset-ring enabled:aria-pressed:inset-ring-border-default",
    "enabled:aria-pressed:hover:bg-surface-secondary enabled:aria-pressed:focus-visible:bg-surface-secondary enabled:aria-pressed:active:bg-surface-tertiary",
  ],
  white: [
    "border-y border-r border-border-default first:border-l",
    "disabled:border-y-0 disabled:first:border-l-0 disabled:last:border-r-0",
    "bg-surface-primary text-text-primary",
    "enabled:hover:bg-surface-secondary enabled:focus-visible:bg-surface-secondary enabled:active:bg-surface-tertiary",
    // Selected reads as the other Style: an Accent segment.
    "enabled:aria-pressed:bg-interactive-default enabled:aria-pressed:text-text-on-accent",
    "enabled:aria-pressed:hover:bg-interactive-hover enabled:aria-pressed:focus-visible:bg-interactive-hover enabled:aria-pressed:active:bg-interactive-active",
  ],
} as const;

export const buttonGroupSegmentVariants = cva(
  [
    "group relative inline-flex cursor-pointer items-center justify-center gap-12 px-16 text-label-lg whitespace-nowrap",
    "first:rounded-l-control last:rounded-r-control",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
    // Focus is the segment's own stroke in the dark accent tone, not the global ring.
    "focus-visible:inset-ring-2 focus-visible:inset-ring-interactive-active focus-visible:outline-none",
  ],
  {
    variants: {
      variant: STYLES,
      size: {
        lg: "h-52",
        md: "h-44",
        // 36px tall; ::before grows the hit area to 44px, the look stays 36.
        sm: "h-36 before:absolute before:inset-x-0 before:-inset-y-4",
      },
    },
  },
);

const ICON_CLASS = {
  accent:
    "text-icon-on-accent group-aria-pressed:text-icon-accent group-disabled:text-icon-disabled",
  white:
    "text-icon-accent group-aria-pressed:text-icon-on-accent group-disabled:text-icon-disabled",
} as const;

export type ButtonGroupVariant = keyof typeof STYLES;
export type ButtonGroupSize = "lg" | "md" | "sm";

export const BUTTON_GROUP_DEFAULTS = { variant: "accent", size: "md" } as const satisfies {
  variant: ButtonGroupVariant;
  size: ButtonGroupSize;
};

export interface ButtonGroupItem {
  value: string;
  /** Figma `Segment Text`. Without it the segment is icon-only and needs `aria-label`. */
  children?: ReactNode;
  /** Figma `Left Icon`. */
  leftIcon?: IconName;
  "aria-label"?: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  /** The group's accessible name: what the segments choose between. */
  label: string;
  /** Two to five segments, all equally important. */
  items: readonly ButtonGroupItem[];
  /** The selected segment. */
  value: string;
  onValueChange: (value: string) => void;
  /** Figma `Style`: Accent · White. */
  variant?: ButtonGroupVariant;
  /** Figma `Size`: Large 52 · Medium 44 · Small 36. */
  size?: ButtonGroupSize;
  className?: string;
}

/** A connected set of mutually exclusive options, such as a grid and list view switch. */
export function ButtonGroup({
  label,
  items,
  value,
  onValueChange,
  variant = BUTTON_GROUP_DEFAULTS.variant,
  size = BUTTON_GROUP_DEFAULTS.size,
  className,
}: ButtonGroupProps) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-label={item["aria-label"]}
          aria-pressed={item.value === value}
          disabled={item.disabled}
          onClick={() => onValueChange(item.value)}
          className={buttonGroupSegmentVariants({ variant, size })}
        >
          {item.leftIcon && (
            <Icon
              name={item.leftIcon}
              tone="current"
              className={cn("shrink-0", ICON_CLASS[variant])}
            />
          )}
          {item.children}
        </button>
      ))}
    </div>
  );
}
