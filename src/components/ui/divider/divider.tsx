import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Figma Divider: a 0-tall line with a 1px stroke (Tone: Neutral border-neutral, Strong border-strong), so it takes no height in the
// layout (the stroke is drawn on ::after). Usage=Full Width spans edge to edge, Usage=Inset adds
// 16px on each side so the line aligns with list text.
export const dividerVariants = cva(
  "relative h-0 border-0 after:absolute after:inset-x-0 after:top-0 after:h-px",
  {
    variants: {
      tone: { neutral: "after:bg-border-neutral", strong: "after:bg-border-strong" },
      usage: { "full-width": "w-full", inset: "mx-16" },
    },
  },
);

export const DIVIDER_DEFAULTS = {
  tone: "neutral",
  usage: "full-width",
} as const satisfies Required<VariantProps<typeof dividerVariants>>;

export interface DividerProps extends Omit<ComponentPropsWithoutRef<"hr">, "children"> {
  /** Figma `Tone`: Strong to separate content rows on a plain surface (Product Detail info rows). */
  tone?: NonNullable<VariantProps<typeof dividerVariants>["tone"]>;
  /** Figma `Usage`. Inside padded containers (cards, dialogs) prefer `inset`. */
  usage?: NonNullable<VariantProps<typeof dividerVariants>["usage"]>;
  /** Purely visual line between items that are already grouped: hidden from screen readers. */
  decorative?: boolean;
}

export function Divider({
  tone = DIVIDER_DEFAULTS.tone,
  usage = DIVIDER_DEFAULTS.usage,
  decorative = false,
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      {...props}
      {...(decorative ? { role: "presentation", "aria-hidden": true } : {})}
      className={cn(dividerVariants({ tone, usage }), className)}
    />
  );
}
