"use client";

import { useId } from "react";
import NextImage from "next/image";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";

// The PDP "Variant Selector" block (06.01: Color 31215:29102, Cosmetic Size 31215:29787). Not a
// Figma main component, so it lives here as a pattern composed of tokens: a top border
// (border-neutral, pt 20, gap 12), the selection line "Shade — Rosewood" (label-large, the value
// title-small), then the options, gap 8:
//
// - `tile` (Cosmetic Size): 120px tiles, padding 20 × 12, radius 8, a 1px border-neutral ring;
//   the label (label-large, text-primary) over an optional sub label (label-small,
//   text-tertiary), e.g. the unit price "€54/100 ml". Selected: interactive-active ring.
// - `swatch` (Color): 40 × 56 image tiles (a crop of the product in that shade, never a hex
//   value), radius 12, a 2px border-neutral ring; selected: 40 × 80 (Figma draws it taller) with
//   a 2px border-accent ring, the system's selected-card rule (Figma's 3px is off
//   the scale). 40px to the eye, a 44px hit area (::before, as Checkbox; decision 1 Nov). Used
//   only when every option has a swatch image; without one the tile style shows the name (no
//   colour is invented).
//
// Accessibility: native radios in a radiogroup (arrow keys, one tab stop), visually hidden, with
// the ring drawn on the tile (). Unavailable options stay visible and disabled
// (Figma Do: show every option); the reason is visible text: the tile's sub label, and for
// swatches a line under the group naming them ("Out of stock: Cocoa"), which the group
// references with aria-describedby.

export interface VariantSelectorOption {
  value: string;
  /** Option name, e.g. "50 ml" or "Rosewood". */
  label: string;
  /** Tile sub label, e.g. the unit price. Replaced by `unavailableLabel` when unavailable. */
  description?: string;
  /** Swatch image (shade); the swatch style needs it on every option. */
  swatch?: ImageAsset;
  /** Out of stock: shown, not selectable. */
  unavailable?: boolean;
}

export interface VariantSelectorLabels {
  /** Visible reason on an unavailable tile, e.g. "Out of stock". */
  unavailable: string;
  /** The line under swatches, e.g. "Out of stock: Cocoa, Berry". */
  unavailableList: (names: string) => string;
}

export const VARIANT_SELECTOR_LABELS: VariantSelectorLabels = {
  unavailable: "Out of stock",
  unavailableList: (names) => `Out of stock: ${names}`,
};

export interface VariantSelectorProps {
  /** The axis, e.g. "Shade" or "Size". Names the group. */
  label: string;
  options: readonly VariantSelectorOption[];
  /** Selected option value. */
  value?: string;
  onValueChange: (value: string) => void;
  /** Radio group name (one per selector on the page). */
  name?: string;
  labels?: VariantSelectorLabels;
  className?: string;
}

export function VariantSelector({
  label,
  options,
  value,
  onValueChange,
  name,
  labels = VARIANT_SELECTOR_LABELS,
  className,
}: VariantSelectorProps) {
  const id = useId();
  const groupName = name ?? `${id}-variant`;
  const swatches = options.length > 0 && options.every((option) => option.swatch);
  const selected = options.find((option) => option.value === value);
  const unavailable = options.filter((option) => option.unavailable);
  const noteId = `${id}-unavailable`;
  const showNote = swatches && unavailable.length > 0;

  return (
    <div className={cn("flex flex-col gap-12 border-t border-border-neutral pt-20", className)}>
      <p aria-hidden className="flex flex-wrap gap-4 text-label-lg text-text-primary">
        <span>{label} —</span>
        {selected && <span className="text-title-sm">{selected.label}</span>}
      </p>
      <div
        role="radiogroup"
        aria-label={label}
        aria-describedby={showNote ? noteId : undefined}
        className="flex flex-wrap gap-8"
      >
        {options.map((option) => {
          const checked = option.value === value;
          const input = (
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={checked}
              disabled={option.unavailable}
              onChange={() => onValueChange(option.value)}
              className="sr-only"
            />
          );
          if (swatches && option.swatch) {
            return (
              <label
                key={option.value}
                className={cn(
                  // 40px wide to the eye, 44px to the pointer: ::before widens the hit area 2px
                  // each side (the Checkbox / Radio method); 56 / 80 tall already.
                  "relative flex w-40 shrink-0 rounded-12",
                  "before:absolute before:-inset-x-2 before:inset-y-0",
                  checked ? "h-80" : "h-56",
                  option.unavailable ? "cursor-not-allowed" : "cursor-pointer",
                )}
              >
                {input}
                {/* Clipped here, not on the label, so the hit area isn't clipped with it. */}
                <span aria-hidden className="relative flex size-full overflow-hidden rounded-12">
                  <NextImage
                    src={option.swatch.src}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                  {/* The ring is a layer above the image (an inset ring on the label would be
                      painted under it), so light shades keep their edge. */}
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-12 inset-ring-2",
                      checked ? "inset-ring-border-accent" : "inset-ring-border-neutral",
                    )}
                  />
                </span>
                <span className="sr-only">
                  {option.label}
                  {option.unavailable && `, ${labels.unavailable}`}
                </span>
              </label>
            );
          }
          const description = option.unavailable ? labels.unavailable : option.description;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-w-120 flex-col items-center gap-4 rounded-control bg-surface-primary px-20 py-12",
                checked
                  ? "inset-ring inset-ring-interactive-active"
                  : "inset-ring inset-ring-border-neutral",
                option.unavailable
                  ? "cursor-not-allowed bg-surface-disabled"
                  : "cursor-pointer hover:inset-ring-interactive-hover",
              )}
            >
              {input}
              <span
                className={cn(
                  "text-label-lg",
                  option.unavailable ? "text-text-disabled line-through" : "text-text-primary",
                )}
              >
                {option.label}
              </span>
              {description && (
                <span className="text-label-sm text-text-tertiary">
                  <span className="sr-only">, </span>
                  {description}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {showNote && (
        <p id={noteId} className="text-label-sm text-text-tertiary">
          {labels.unavailableList(unavailable.map((option) => option.label).join(", "))}
        </p>
      )}
    </div>
  );
}
