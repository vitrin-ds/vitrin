import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import type { IconName } from "./icon-names";

// Figma: "Material Symbols Rounded · 20px. Weight 200 / 400, Fill Off / On.
// Default colour icon/icon-accent; override with icon/* tokens."
export const iconVariants = cva("icon", {
  variants: {
    // 8 (Label), 16 (Chip, Pagination), 24 (overlay close) and 32 (File Upload) are component
    // sizes without an Icon token yet.
    size: {
      "8": "icon-8",
      "16": "icon-16",
      "24": "icon-24",
      "32": "icon-32",
      sm: "icon-sm",
      md: "icon-md",
      lg: "icon-lg",
      xl: "icon-xl",
      "2xl": "icon-2xl",
    },
    weight: { 400: "", 200: "icon-light" },
    fill: { true: "icon-filled", false: "" },
    tone: {
      accent: "text-icon-accent",
      primary: "text-icon-primary",
      secondary: "text-icon-secondary",
      assistive: "text-icon-assistive",
      "on-accent": "text-icon-on-accent",
      inverse: "text-icon-inverse",
      disabled: "text-icon-disabled",
      success: "text-icon-success",
      warning: "text-icon-warning",
      error: "text-icon-error",
      info: "text-icon-info",
      current: "",
    },
  },
});

export const ICON_DEFAULTS = {
  size: "md",
  weight: 400,
  fill: true,
  tone: "accent",
} as const satisfies Required<VariantProps<typeof iconVariants>>;

type IconVariants = VariantProps<typeof iconVariants>;

export interface IconProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** Material Symbols name as in Figma, e.g. `location_on`. */
  name: IconName;
  /** Figma Icon/Small · Regular · Medium · Large · XX-Large = 12 · 20 · 28 · 40 · 48px; 8 / 16 / 24 / 32 for Label / Chip / overlay close / File Upload. */
  size?: NonNullable<IconVariants["size"]>;
  /** Figma `Weight` (400 regular, 200 light). */
  weight?: 400 | 200;
  /** Figma `Fill` (On / Off). */
  fill?: boolean;
  /** icon/* colour token; `current` inherits the text colour (e.g. inside a button). */
  tone?: NonNullable<IconVariants["tone"]>;
  /**
   * Material Symbols optical size. Left out, it follows the icon size (20 for 16 · 20px). `24`
   * draws the 24-grid glyph in the same box, where a Figma icon is that glyph scaled down (the
   * BottomSheet close: close_small at 20px is 8 × 8 in Figma, 6 × 6 at opsz 20).
   */
  opticalSize?: 24;
  /**
   * Accessible name. Leave it out for decorative icons next to a visible label:
   * the icon is then hidden from assistive technology.
   */
  label?: string;
}

/** One component for every Material Symbol in Vitrin's icon set. */
export function Icon({
  name,
  size = ICON_DEFAULTS.size,
  weight = ICON_DEFAULTS.weight,
  fill = ICON_DEFAULTS.fill,
  tone = ICON_DEFAULTS.tone,
  opticalSize,
  label,
  className,
  ...props
}: IconProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <span
      {...props}
      {...a11y}
      data-icon={name}
      data-opsz={opticalSize}
      className={cn(iconVariants({ size, weight, fill, tone }), className)}
    />
  );
}
