"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";

// Figma `Stepper` (Size × State): a quantity control, − value +, 157px wide, surface-neutral box
// with a 1px inset border and two surface-primary buttons. Semantic tokens (Stepper is not a
// component-token family). The value is a WAI-ARIA spinbutton: it takes focus, arrow keys and
// Home / End change it, min / max are enforced. The buttons repeat that for pointer users. At
// Min / At Max: that button is disabled, keeps its surface and shadow, and its icon turns
// icon-disabled. State=Disabled greys out the whole control.
//
// `variant` adds the two quantity controls the cart cards draw (not separate Figma components):
// `inline` (Card.CartItem.Detailed: − 3 +, 20px accent icons, padding 6, gap 12, radius 4, 1px
// border-neutral) and `pill` (Card.CartItem.Compact: + 3 − stacked, padding 4 · 8, gap 8, radius
// 16). Both show the value in title-medium; `size` applies to the default box only.

export const stepperVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      box: [
        "w-157 justify-between rounded-control bg-surface-neutral",
        "inset-ring inset-ring-border-neutral hover:inset-ring-border-default",
      ],
      inline: "gap-12 rounded-4 bg-surface-primary p-6 inset-ring inset-ring-border-neutral",
      pill: [
        "min-w-28 flex-col-reverse gap-8 rounded-16 bg-surface-primary px-4 py-8",
        "inset-ring inset-ring-border-neutral",
      ],
    },
    size: { lg: "", md: "", sm: "" },
    error: { true: "inset-ring-border-error hover:inset-ring-border-error", false: "" },
    disabled: {
      true: "inset-ring-border-disabled hover:inset-ring-border-disabled",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "box", size: "lg", className: "h-60 p-12" },
    { variant: "box", size: "md", className: "h-52 p-8" },
    { variant: "box", size: "sm", className: "h-36 p-4" },
    { variant: ["inline", "pill"], disabled: true, className: "bg-surface-disabled" },
  ],
});

const BUTTON_PADDING = { lg: "p-8", md: "p-8", sm: "p-4" } as const;

export const STEPPER_DEFAULTS = {
  variant: "box",
  size: "md",
  min: 1,
  max: 99,
  step: 1,
} as const;

export interface StepperProps {
  /** Accessible name of the value ("Quantity"). */
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** `box` = Figma Stepper; `inline` / `pill` = the cart cards' quantity controls. */
  variant?: NonNullable<VariantProps<typeof stepperVariants>["variant"]>;
  /** Figma `Size` (box only). Large 60 · Medium 52 · Small 36. */
  size?: NonNullable<VariantProps<typeof stepperVariants>["size"]>;
  /** Figma `State=Error`. Explain the error next to the control. */
  error?: boolean;
  disabled?: boolean;
  /** Submits the value with a form (hidden input). */
  name?: string;
  /** Accessible name of the "−" button in place of "Decrease …", e.g. "Remove Glow Serum". */
  decreaseLabel?: string;
  className?: string;
}

export function Stepper({
  label,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = STEPPER_DEFAULTS.min,
  max = STEPPER_DEFAULTS.max,
  step = STEPPER_DEFAULTS.step,
  variant = STEPPER_DEFAULTS.variant,
  size = STEPPER_DEFAULTS.size,
  error = false,
  disabled = false,
  name,
  decreaseLabel,
  className,
}: StepperProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
  const value = valueProp ?? uncontrolled;

  function set(next: number) {
    const clamped = Math.min(Math.max(next, min), max);
    if (clamped === value || disabled) return;
    if (valueProp === undefined) setUncontrolled(clamped);
    onValueChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    const next = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + step * 10,
      PageDown: value - step * 10,
      Home: min,
      End: max,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    set(next);
  }

  return (
    <div className={cn(stepperVariants({ variant, size, error, disabled }), className)}>
      <StepButton
        icon="remove"
        label={decreaseLabel ?? `Decrease ${label.toLowerCase()}`}
        variant={variant}
        size={size}
        error={error}
        disabled={disabled}
        atLimit={value <= min}
        onClick={() => set(value - step)}
      />
      <span
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-invalid={error || undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          "rounded-4 px-4 tabular-nums",
          variant === "box" ? "text-label-lg" : "text-title-md",
          error ? "text-text-error" : "text-text-primary",
          disabled && "text-text-disabled",
        )}
      >
        {value}
      </span>
      <StepButton
        icon="add"
        label={`Increase ${label.toLowerCase()}`}
        variant={variant}
        size={size}
        error={error}
        disabled={disabled}
        atLimit={value >= max}
        onClick={() => set(value + step)}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

interface StepButtonProps {
  icon: "add" | "remove";
  label: string;
  variant: "box" | "inline" | "pill";
  size: keyof typeof BUTTON_PADDING;
  error: boolean;
  /** The whole Stepper is disabled. */
  disabled: boolean;
  /** Figma `At Min` / `At Max` for this button. */
  atLimit: boolean;
  onClick: () => void;
}

// Not in the tab order: the spinbutton is the keyboard stop (APG). Small (28px) grows its hit
// area to 44px with ::before.
function StepButton({
  icon,
  label,
  variant,
  size,
  error,
  disabled,
  atLimit,
  onClick,
}: StepButtonProps) {
  // Cart variants: bare 20px glyphs (icon-accent) with a 44px hit area.
  if (variant !== "box") {
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label={label}
        disabled={disabled || atLimit}
        onClick={onClick}
        className={cn(
          "relative flex cursor-pointer rounded-4 text-icon-accent before:absolute before:-inset-12",
          "hover:text-interactive-hover disabled:cursor-not-allowed disabled:text-icon-disabled",
        )}
      >
        <Icon name={icon} tone="current" />
      </button>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      disabled={disabled || atLimit}
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer rounded-4 shadow-sm disabled:cursor-not-allowed",
        BUTTON_PADDING[size],
        size === "sm" && "before:absolute before:-inset-8",
        disabled
          ? "bg-surface-disabled text-icon-disabled shadow-none"
          : atLimit
            ? "bg-surface-primary text-icon-disabled"
            : [
                error
                  ? "bg-interactive-default text-icon-on-accent"
                  : "bg-surface-primary text-icon-primary",
                "hover:bg-interactive-hover hover:text-icon-on-accent",
                "active:bg-interactive-active active:text-icon-on-accent",
              ],
      )}
    >
      <Icon name={icon} tone="current" />
    </button>
  );
}
