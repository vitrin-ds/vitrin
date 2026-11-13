import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Figma `Progress` (Size 2x · 4x · 8x): a surface-neutral track with a surface-accent fill,
// square ends, full width. `tone="success"` fills it in icon-success (green) for a goal that is
// reached, e.g. free shipping unlocked. Determinate only (Figma: "use Spinner for indeterminate loading").
// The fill is an SVG rect sized in %, so the value needs no inline style.
export const progressVariants = cva("block w-full", {
  variants: {
    size: { "2x": "h-2", "4x": "h-4", "8x": "h-8" },
  },
});

export const progressFillVariants = cva("", {
  variants: {
    tone: { accent: "fill-surface-accent", success: "fill-icon-success" },
  },
});

export const PROGRESS_DEFAULTS = {
  size: "2x",
  tone: "accent",
  max: 100,
} as const;

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<"svg">, "children"> {
  /** Current value, 0 … max. */
  value: number;
  max?: number;
  /** Figma `Size`: 2x inline, 8x prominent. */
  size?: NonNullable<VariantProps<typeof progressVariants>["size"]>;
  /** Fill colour: accent (default) or success once the goal is reached. */
  tone?: NonNullable<VariantProps<typeof progressFillVariants>["tone"]>;
  /** What the progress represents ("Upload", "Free delivery"). Figma: never without context. */
  label: string;
  /** Spoken value, e.g. "€38 of €50". Defaults to the percentage. */
  valueText?: string;
}

export function Progress({
  value,
  max = PROGRESS_DEFAULTS.max,
  size = PROGRESS_DEFAULTS.size,
  tone = PROGRESS_DEFAULTS.tone,
  label,
  valueText,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  // Two decimals keep the attribute readable (29 / 100 → "29%", not "28.999…%").
  const percent = max > 0 ? Math.round((clamped / max) * 10000) / 100 : 0;
  return (
    <svg
      {...props}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      preserveAspectRatio="none"
      className={cn(progressVariants({ size }), className)}
    >
      <rect width="100%" height="100%" className="fill-surface-neutral" />
      <rect width={`${percent}%`} height="100%" className={progressFillVariants({ tone })} />
    </svg>
  );
}

export interface ProgressStepsProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Number of steps in the flow (Figma: 2–6, extra steps hidden with `Show Step N`). */
  steps: 2 | 3 | 4 | 5 | 6;
  /** Completed steps (Figma `State`: All Empty = 0 … Step N OK = N). */
  completed: number;
  /** Name of the flow ("Checkout progress"). */
  label: string;
}

/** Figma `ProgressWithSteps`: equal 4px segments, gap 8, accent when done, tertiary when not. */
export function ProgressSteps({
  steps,
  completed,
  label,
  className,
  ...props
}: ProgressStepsProps) {
  const done = Math.min(Math.max(completed, 0), steps);
  return (
    <div
      {...props}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={steps}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${steps} steps completed`}
      className={cn("flex w-full gap-8", className)}
    >
      {Array.from({ length: steps }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-4 flex-1 rounded-4",
            i < done ? "bg-surface-accent" : "bg-surface-tertiary",
          )}
        />
      ))}
    </div>
  );
}
