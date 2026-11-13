import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Figma Skeleton: surface-skeleton, radius 4, no configurable properties (270 × 36 sample).
// Code adds shapes so placeholders can match the content they stand in for.
export const skeletonVariants = cva("block bg-surface-skeleton motion-safe:animate-pulse", {
  variants: {
    shape: {
      /** One line of text: a zero-width character gives it the surrounding line height. */
      text: "w-full rounded-4",
      /** Image, card or any box: give it a size or put it in a sized parent. */
      block: "size-full rounded-4",
      /** Avatar or round thumbnail. */
      circle: "aspect-square rounded-full",
    },
  },
});

export const SKELETON_DEFAULTS = {
  shape: "block",
} as const satisfies Required<VariantProps<typeof skeletonVariants>>;

export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  shape?: NonNullable<VariantProps<typeof skeletonVariants>["shape"]>;
}

/**
 * Loading placeholder. Decorative: announce loading once on the region that is loading
 * (`aria-busy`, or a Spinner with a label), not on each skeleton.
 */
export function Skeleton({ shape = SKELETON_DEFAULTS.shape, className, ...props }: SkeletonProps) {
  return (
    <span {...props} aria-hidden className={cn(skeletonVariants({ shape }), className)}>
      {shape === "text" ? "\u200b" : null}
    </span>
  );
}
