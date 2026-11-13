import { cva } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Floating Action Button` (Style × Size × State) on `.Base Floating Action Button`: a round
// icon button with shadow-lg, 52 · 44 · 36 wide and tall. Hover, Active and Disabled are CSS
// states; Disabled has a 1px border and no shadow. The page places it: `fixed` with its corner.

const STYLES = {
  filled: [
    "bg-interactive-default enabled:hover:bg-interactive-hover enabled:active:bg-interactive-active",
  ],
  outline: [
    "bg-surface-primary inset-ring inset-ring-interactive-default",
    "enabled:hover:inset-ring-interactive-hover enabled:active:inset-ring-interactive-active",
  ],
} as const;

export const floatingActionButtonVariants = cva(
  [
    "group relative inline-flex cursor-pointer items-center justify-center rounded-full shadow-lg",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:shadow-none",
    "disabled:inset-ring disabled:inset-ring-border-disabled",
  ],
  {
    variants: {
      variant: STYLES,
      size: {
        lg: "size-52",
        md: "size-44",
        // 36px wide and tall; ::before grows the hit area to 44px.
        sm: "size-36 before:absolute before:-inset-4",
      },
    },
  },
);

const ICON_CLASS = {
  filled: "text-icon-on-accent group-disabled:text-icon-disabled",
  outline: "text-icon-accent group-disabled:text-icon-disabled",
} as const;

export type FloatingActionButtonVariant = keyof typeof STYLES;
export type FloatingActionButtonSize = "lg" | "md" | "sm";

export const FLOATING_ACTION_BUTTON_DEFAULTS = {
  variant: "filled",
  size: "lg",
} as const satisfies { variant: FloatingActionButtonVariant; size: FloatingActionButtonSize };

export type FloatingActionButtonProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "aria-label"
> & {
  /** Figma `Icon`. */
  icon: IconName;
  /** The action in words: the button has no visible text. */
  "aria-label": string;
  /** Figma `Style`: Filled · Outline. */
  variant?: FloatingActionButtonVariant;
  /** Figma `Size`: Large 52 · Medium 44 · Small 36. */
  size?: FloatingActionButtonSize;
};

export function FloatingActionButton({
  icon,
  variant = FLOATING_ACTION_BUTTON_DEFAULTS.variant,
  size = FLOATING_ACTION_BUTTON_DEFAULTS.size,
  type = "button",
  className,
  ...props
}: FloatingActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(floatingActionButtonVariants({ variant, size }), className)}
    >
      <Icon name={icon} tone="current" className={ICON_CLASS[variant]} />
    </button>
  );
}
