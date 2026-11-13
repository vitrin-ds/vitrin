import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// Figma `Spacer` (Single-Layer): vertical whitespace at fixed increments, for the few places
// where the parent's gap can't give the space between sections. Height 20 · 40 · 60 · 80.
// Decorative: hidden from screen readers.
export const spacerVariants = cva("block w-full shrink-0", {
  variants: {
    height: { "20": "h-20", "40": "h-40", "60": "h-60", "80": "h-80" },
  },
});

export const SPACER_DEFAULTS = {
  height: "20",
} as const satisfies Required<VariantProps<typeof spacerVariants>>;

export interface SpacerProps {
  /** Figma `Height`: 20px · 40px · 60px · 80px. */
  height?: NonNullable<VariantProps<typeof spacerVariants>["height"]>;
  className?: string;
}

export function Spacer({ height = SPACER_DEFAULTS.height, className }: SpacerProps) {
  return <div aria-hidden className={cn(spacerVariants({ height }), className)} />;
}
