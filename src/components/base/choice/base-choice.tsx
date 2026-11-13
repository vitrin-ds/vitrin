import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `.Base Checkbox` / `.Base Radio Button`: a 20px control glyph, gap 8, label-large text
// (`Show Label` · `Label Text`). The native input stays in the DOM, visually hidden, so the
// keyboard, form and screen-reader behaviour are the browser's own. The row is 20px tall like
// Figma; ::before adds a 44px hit area (touch targets are at least 44×44).

export type BaseChoiceProps = Omit<ComponentPropsWithRef<"input">, "type" | "children"> & {
  type: "checkbox" | "radio";
  /** Figma `Label Text`. */
  label: ReactNode;
  /** Figma `Show Label=false`: the label is kept for screen readers only. */
  hideLabel?: boolean;
  /** The visible control, drawn after the input (`peer-*` variants apply). */
  glyph: ReactNode;
  /** Classes for the label text (state colours). */
  labelClassName?: string;
};

export function BaseChoice({
  type,
  label,
  hideLabel = false,
  glyph,
  labelClassName,
  className,
  disabled,
  ...props
}: BaseChoiceProps) {
  return (
    <label
      className={cn(
        "group relative inline-flex cursor-pointer items-center gap-8",
        "before:absolute before:inset-x-0 before:-inset-y-12",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      <input {...props} type={type} disabled={disabled} className="peer sr-only" />
      {glyph}
      <span className={cn("text-label-lg", hideLabel && "sr-only", labelClassName)}>{label}</span>
    </label>
  );
}
