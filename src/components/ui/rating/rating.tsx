import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import { InteractiveRating, type RatingInteractiveProps } from "./rating-interactive";

// Figma `Rating` (Asset → Main): five 20px `.Asset Rate Star` glyphs, gap 4, then the value
// (label-large), which is always shown. Stars are decorative (aria-hidden); the value text
// carries the meaning. The stars round DOWN to the nearest half (4.4 → 4, 4.6 → 4.5), so they
// never promise more than the average; the text states the real value. Selected = `star` in
// rating-fill, Half = `star_half` in rating-fill, Idle = `star` in rating-empty. Figma's `Usage`
// (Simple · Full) draws the same thing, so it has no prop. `size="sm"` gives 16px stars and a label-small value.
// `display="stars"`: the stars only, touching (Card.Product.Vertical `Stars`, 5 × 16 = 80 wide);
// the value is read out (sr-only) but not shown, the card shows the review count instead.
// `display="compact"`: touching stars, then the value in brackets 4 to the right (PDP 06.01
// Reviews Scores: "★★★★☆ (4.0)").

export { RATING_INTERACTIVE_LABELS } from "./rating-interactive";
export type { RatingInteractiveLabels, RatingInteractiveProps } from "./rating-interactive";

export const RATING_MAX = 5;

export const RATING_DEFAULTS = {
  size: "md",
  locale: "en",
} as const;

type StarState = "selected" | "half" | "idle";

/** Small tolerance so binary float noise (e.g. 4.5 stored as 4.4999…) doesn't lose a half. */
const HALF_EPSILON = 1e-9;

/** Rounds down to the nearest half star and returns one state per star. */
export function ratingStars(value: number): StarState[] {
  const halves = Math.floor(Math.min(Math.max(value, 0), RATING_MAX) * 2 + HALF_EPSILON);
  return Array.from({ length: RATING_MAX }, (_, i) => {
    const left = halves - i * 2;
    return left >= 2 ? "selected" : left === 1 ? "half" : "idle";
  });
}

export interface RatingDisplayProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  interactive?: false;
  /** Average rating, 0 … 5. */
  value: number;
  /** md: 20px stars, label-large value (Figma Rating); sm: 16px, label-small (product card). */
  size?: "md" | "sm";
  /** Formats the value (Intl.NumberFormat), e.g. "4.9" / "4,9". */
  locale?: string;
  /**
   * `full` (default): stars and the value; `stars`: touching stars, the value for screen readers;
   * `compact`: touching stars and the value in brackets.
   */
  display?: "full" | "stars" | "compact";
}

export type RatingProps = RatingDisplayProps | RatingInteractiveProps;

export function Rating(props: RatingProps) {
  return props.interactive ? <InteractiveRating {...props} /> : <DisplayRating {...props} />;
}

function DisplayRating({
  interactive: _interactive,
  value,
  size = RATING_DEFAULTS.size,
  locale = RATING_DEFAULTS.locale,
  display = "full",
  className,
  ...props
}: RatingDisplayProps) {
  const starsOnly = display === "stars";
  const compact = display === "compact";
  const clamped = Math.min(Math.max(value, 0), RATING_MAX);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(clamped);

  return (
    <span
      {...props}
      className={cn("inline-flex items-center", starsOnly ? "gap-0" : "gap-4", className)}
    >
      {compact ? (
        <span className="flex">
          <Stars value={clamped} size={size} />
        </span>
      ) : (
        <Stars value={clamped} size={size} />
      )}
      <span
        className={cn(
          "text-text-primary tabular-nums",
          size === "sm" ? "text-label-sm" : "text-label-lg",
          starsOnly && "sr-only",
        )}
      >
        <span className="sr-only">Rated </span>
        {compact ? <span aria-hidden>({formatted})</span> : formatted}
        {compact && <span className="sr-only">{formatted}</span>}
        <span className="sr-only"> out of {RATING_MAX}</span>
      </span>
    </span>
  );
}

function Stars({ value, size }: { value: number; size: "md" | "sm" }) {
  return ratingStars(value).map((state, i) => (
    <Icon
      key={i}
      name={state === "half" ? "star_half" : "star"}
      tone="current"
      size={size === "sm" ? "16" : "md"}
      data-state={state}
      className={state === "idle" ? "text-rating-empty" : "text-rating-fill"}
    />
  ));
}
