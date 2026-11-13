"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";

// Rating's `interactive` mode, used through `<Rating interactive>`. Its own file only because it
// needs state: the display Rating stays usable from Server Components.
//
// `interactive`: the star picker of Write a Review (Figma 31512:40595): a title, five 32px stars and
// the word for the chosen value. `.Asset Rate Star`: Idle rating-empty, Hover and Selected
// rating-fill. A native radio group in a fieldset (legend = the title), so Tab, the arrow keys and
// Space work as the APG asks. Each radio is named "4 stars, Very good"; the label is 44px (32 + 6
// padding). The word follows the hover and is aria-hidden: the checked radio's name says it.
// Messages sit under the stars, linked with aria-describedby (role radio has no aria-invalid).

export interface RatingInteractiveLabels {
  /** Word per value 1 … 5 (index 0 = 1 star). */
  words: readonly [string, string, string, string, string];
  /** Accessible name of one star, e.g. "4 stars, Very good". */
  star: (value: number, word: string) => string;
}

export const RATING_INTERACTIVE_LABELS: RatingInteractiveLabels = {
  words: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  star: (value, word) => `${value} ${value === 1 ? "star" : "stars"}, ${word}`,
};

const STAR_VALUES = [1, 2, 3, 4, 5];

export interface RatingInteractiveProps {
  interactive: true;
  /** The title, rendered as the fieldset legend. */
  label: ReactNode;
  /** Radio group name. */
  name: string;
  /** Chosen value; 0 = not rated. */
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: ReactNode;
  /** Replaces the helper text. */
  errorText?: ReactNode;
  /** id prefix: the radios are `${id}-1` … `${id}-5`. */
  id?: string;
  labels?: RatingInteractiveLabels;
  className?: string;
}

export function InteractiveRating({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  helperText,
  errorText,
  id: idProp,
  labels = RATING_INTERACTIVE_LABELS,
  className,
}: RatingInteractiveProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const [hover, setHover] = useState(0);
  const shown = (!disabled && hover) || value;
  const word = shown > 0 ? labels.words[shown - 1] : undefined;
  const invalid = errorText != null && errorText !== false;
  const message = invalid ? errorText : helperText;
  const messageId = `${id}-message`;
  const disabledText = disabled && "text-(--th-input-text-disabled)";

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={message ? messageId : undefined}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <legend className={cn("text-title-lg text-text-primary", disabledText)}>
        {label}
        {required && (
          <span aria-hidden className={cn("text-(--th-input-text-error)", disabledText)}>
            *
          </span>
        )}
      </legend>
      <div className="flex items-center gap-8" onMouseLeave={() => setHover(0)}>
        <div className="flex">
          {STAR_VALUES.map((star) => {
            const filled = star <= shown;
            return (
              <label
                key={star}
                className={cn(
                  "relative flex p-6",
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
                onMouseEnter={() => setHover(star)}
              >
                <input
                  id={`${id}-${star}`}
                  type="radio"
                  name={name}
                  value={star}
                  checked={value === star}
                  onChange={() => onChange(star)}
                  required={required}
                  className="peer sr-only"
                />
                <Icon
                  name="star"
                  size="32"
                  tone="current"
                  data-state={filled ? "selected" : "idle"}
                  className={cn(
                    "rounded-4",
                    disabled
                      ? "text-icon-disabled"
                      : filled
                        ? "text-rating-fill"
                        : "text-rating-empty",
                  )}
                />
                <span className="sr-only">{labels.star(star, labels.words[star - 1]!)}</span>
              </label>
            );
          })}
        </div>
        {word && (
          <span aria-hidden className={cn("text-body-sm text-text-primary", disabledText)}>
            {word}
          </span>
        )}
      </div>
      {message && (
        <p
          id={messageId}
          className={cn(
            "px-4 text-label-sm",
            invalid ? "text-(--th-input-text-error)" : "text-(--th-input-text-helper)",
            disabledText,
          )}
        >
          {message}
        </p>
      )}
    </fieldset>
  );
}
