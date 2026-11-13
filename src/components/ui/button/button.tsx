import { cva } from "class-variance-authority";
import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  BaseButton,
  type BaseButtonContent,
  type BaseButtonOwnProps,
  type BaseButtonProps,
} from "@/components/base/button/base-button";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Button` (Style × Size × State) on the button-{accent|error}-* component tokens. Hover,
// Active and Disabled are CSS states; Figma has no Focus state, so keyboard focus looks like Hover. Borders are drawn with inset-ring, like Figma's inside
// stroke, so they never change the size: Large 52 · Medium 44 · Small 36 tall. Filled Error and
// Outline Error are for destructive actions. Icon-only (no text) is square: the vertical padding
// on every side (Medium 44 × 44, padding 12 around a 20px icon).

const STYLES = {
  filled: [
    "bg-(--th-button-accent-solid-bg) text-(--th-button-accent-solid-text)",
    "hover:bg-(--th-button-accent-solid-bg-hover) focus-visible:bg-(--th-button-accent-solid-bg-hover) active:bg-(--th-button-accent-solid-bg-active)",
    "disabled:bg-(--th-button-accent-solid-bg-disabled) disabled:text-(--th-button-accent-solid-text-disabled)",
    "disabled:inset-ring disabled:inset-ring-(--th-button-accent-solid-border-disabled)",
  ],
  outline: [
    "bg-(--th-button-accent-outline-bg) text-(--th-button-accent-outline-text)",
    "inset-ring inset-ring-(--th-button-accent-outline-border)",
    "hover:inset-ring-(--th-button-accent-outline-border-hover) focus-visible:inset-ring-(--th-button-accent-outline-border-hover) active:inset-ring-(--th-button-accent-outline-border-active)",
    "disabled:bg-(--th-button-accent-outline-bg-disabled) disabled:text-(--th-button-accent-outline-text-disabled)",
    "disabled:inset-ring-(--th-button-accent-outline-border-disabled)",
  ],
  ghost: [
    "text-(--th-button-accent-ghost-text)",
    "hover:text-(--th-button-accent-ghost-text-hover) focus-visible:text-(--th-button-accent-ghost-text-hover) active:text-(--th-button-accent-ghost-text-active)",
    "disabled:text-(--th-button-accent-ghost-text-disabled)",
  ],
  "filled-error": [
    "bg-(--th-button-error-solid-bg) text-(--th-button-error-solid-text)",
    "hover:bg-(--th-button-error-solid-bg-hover) focus-visible:bg-(--th-button-error-solid-bg-hover) active:bg-(--th-button-error-solid-bg-active)",
    "disabled:bg-(--th-button-error-solid-bg-disabled) disabled:text-(--th-button-error-solid-text-disabled)",
    "disabled:inset-ring disabled:inset-ring-(--th-button-error-solid-border-disabled)",
  ],
  "outline-error": [
    "bg-(--th-button-error-outline-bg) text-(--th-button-error-outline-text)",
    "inset-ring inset-ring-(--th-button-error-outline-border)",
    "hover:inset-ring-(--th-button-error-outline-border-hover) focus-visible:inset-ring-(--th-button-error-outline-border-hover) active:inset-ring-(--th-button-error-outline-border-active)",
    "disabled:bg-(--th-button-error-outline-bg-disabled) disabled:text-(--th-button-error-outline-text-disabled)",
    "disabled:inset-ring-(--th-button-error-outline-border-disabled)",
  ],
} as const;

const ICON_CLASS = {
  filled:
    "text-(--th-button-accent-solid-icon) group-disabled:text-(--th-button-accent-solid-icon-disabled)",
  outline:
    "text-(--th-button-accent-outline-icon) group-disabled:text-(--th-button-accent-outline-icon-disabled)",
  ghost: [
    "text-(--th-button-accent-ghost-icon) group-hover:text-(--th-button-accent-ghost-icon-hover) group-focus-visible:text-(--th-button-accent-ghost-icon-hover)",
    "group-active:text-(--th-button-accent-ghost-icon-active) group-disabled:text-(--th-button-accent-ghost-icon-disabled)",
  ].join(" "),
  "filled-error":
    "text-(--th-button-error-solid-icon) group-disabled:text-(--th-button-error-solid-icon-disabled)",
  "outline-error":
    "text-(--th-button-error-outline-icon) group-disabled:text-(--th-button-error-outline-icon-disabled)",
} as const;

export const buttonVariants = cva(
  "group relative cursor-pointer rounded-control text-label-lg focus-visible:outline-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: STYLES,
      size: {
        lg: "gap-12 px-16 py-16",
        md: "gap-12 px-20 py-12",
        // 36px tall; ::before grows the hit area to 44px, the look stays 36.
        sm: "gap-8 px-16 py-8 before:absolute before:inset-x-0 before:-inset-y-4",
      },
      iconOnly: { true: "", false: "" },
    },
    compoundVariants: [
      // Ghost has no container, so no horizontal padding (after size, so it wins the merge).
      { variant: "ghost", className: "px-0" },
      { iconOnly: true, size: "lg", className: "p-16" },
      { iconOnly: true, size: "md", className: "p-12" },
      // Small keeps its 44px hit area on both axes.
      { iconOnly: true, size: "sm", className: "p-8 before:-inset-x-4" },
    ],
    defaultVariants: { iconOnly: false },
  },
);

export type ButtonVariant = keyof typeof STYLES;
export type ButtonSize = "lg" | "md" | "sm";

export const BUTTON_DEFAULTS = {
  variant: "filled",
  size: "md",
} as const satisfies {
  variant: ButtonVariant;
  size: ButtonSize;
};

export type ButtonProps = Omit<BaseButtonOwnProps, "iconClassName"> &
  BaseButtonContent & {
    /**
     * Figma `Style`: Filled (primary action) · Outline (secondary) · Ghost (tertiary, inline) ·
     * Filled Error and Outline Error (destructive actions: delete, remove, cancel subscription).
     */
    variant?: ButtonVariant;
    /** Figma `Size`: Large 52 · Medium 44 · Small 36. */
    size?: ButtonSize;
  };

export function Button({
  variant = BUTTON_DEFAULTS.variant,
  size = BUTTON_DEFAULTS.size,
  className,
  ...props
}: ButtonProps) {
  const iconOnly = props.children === undefined || props.children === null;
  return (
    <BaseButton
      {...(props as BaseButtonProps)}
      iconClassName={ICON_CLASS[variant]}
      className={cn(buttonVariants({ variant, size, iconOnly }), className)}
    />
  );
}

export type ButtonLinkProps = Omit<ComponentPropsWithRef<typeof NextLink>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
};

/**
 * A Figma `Button` that navigates (Store details, Contact us, Go to home): a link with the same
 * variant classes, so links never restyle a button by hand. Actions that don't navigate use
 * `Button`.
 */
export function ButtonLink({
  variant = BUTTON_DEFAULTS.variant,
  size = BUTTON_DEFAULTS.size,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const iconClassName = ICON_CLASS[variant];
  return (
    <NextLink
      {...props}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        buttonVariants({ variant, size }),
        className,
      )}
    >
      {leftIcon && (
        <Icon name={leftIcon} tone="current" className={cn("shrink-0", iconClassName)} />
      )}
      {children}
      {rightIcon && (
        <Icon name={rightIcon} tone="current" className={cn("shrink-0", iconClassName)} />
      )}
    </NextLink>
  );
}
