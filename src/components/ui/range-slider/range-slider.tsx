"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/cn";

// Figma `Range Slider` (30503:1530, State: Default · Hover · Active · Disabled): an 8px track
// (surface-neutral, radius 4), the Active Track between the knobs (surface-accent) and two 16px
// knobs (radius 4, 1px interactive-default border; Hover / Active: surface-tertiary fill and
// interactive-hover border; Disabled: icon-disabled fill, track surface-disabled). Under the track
// the bounds (label-small, text-tertiary), which the Figma component doesn't draw (asked for in
// the brief; `showBounds={false}` hides them).
//
// A11y: the APG multi-thumb slider. Each knob is role="slider" in the tab order, named by
// labels.min / labels.max ("Minimum price"), with aria-valuemin / max / now and aria-valuetext
// from `formatValue` (e.g. Intl currency). The thumbs can't cross, so the minimum thumb's
// aria-valuemax is the maximum thumb's value and vice versa. Keys: Arrow Left / Down −step,
// Arrow Right / Up +step, Page Down / Up ∓10 steps, Home / End to the lowest / highest allowed
// value. Pointer: press anywhere on the track to move the nearer thumb, then drag (pointer
// capture); the dragged thumb takes focus. The knob itself is the slider, so it draws the global
// focus ring; a ::before pseudo element gives it a 44×44 hit area.
// No transitions, so reduced motion needs nothing.
//
// Geometry: the thumb positions are data, so they can't be token classes, and inline `style` is
// blocked here. As in StoreMap, `--range-start` / `--range-end` (percent of the track) are set on
// the root from a ref in a layout effect and read with `left-(--range-start)` /
// `w-(--range-width)`; the knobs stay invisible until they are placed (no jump on hydration).

export interface RangeSliderLabels {
  /** Accessible name of the minimum thumb, e.g. "Minimum price". */
  min: string;
  /** Accessible name of the maximum thumb, e.g. "Maximum price". */
  max: string;
}

export const RANGE_SLIDER_LABELS: RangeSliderLabels = {
  min: "Minimum",
  max: "Maximum",
};

export const RANGE_SLIDER_DEFAULTS = {
  step: 1,
  disabled: false,
  showBounds: true,
} as const;

/** Page Up / Page Down move this many steps (APG). */
export const RANGE_SLIDER_PAGE_STEPS = 10;

export type RangeValue = readonly [number, number];

export interface RangeSliderProps {
  /** Lowest value of the track. */
  min: number;
  /** Highest value of the track. */
  max: number;
  step?: number;
  /** Controlled [minimum, maximum]. */
  value?: RangeValue;
  /** Uncontrolled start value; the whole track by default. */
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  /** Text for a value: aria-valuetext and the bounds, e.g. Intl currency ("€25"). */
  formatValue?: (value: number) => string;
  /** The min / max labels under the track. */
  showBounds?: boolean;
  /**
   * `compact`: the track row takes the 8px of the track in the layout (Figma Filter Section
   * [Price]); its 44px press area stays, drawn by ::before outside the box.
   */
  density?: "default" | "compact";
  disabled?: boolean;
  labels?: RangeSliderLabels;
  /** Names the pair, e.g. the facet title ("Price"). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

type Thumb = 0 | 1;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

/** Snaps to the step grid that starts at `min`, within [lo, hi]. */
export function snapToStep(raw: number, min: number, step: number, lo: number, hi: number) {
  const snapped = min + Math.round((raw - min) / step) * step;
  // Round off float noise from the multiplication (0.1 steps).
  return clamp(Number(snapped.toFixed(10)), lo, hi);
}

/** Normalises a value to [min ≤ a ≤ b ≤ max]. */
export function normaliseRange([a, b]: RangeValue, min: number, max: number): RangeValue {
  const lo = clamp(Math.min(a, b), min, max);
  const hi = clamp(Math.max(a, b), min, max);
  return [lo, hi];
}

function percent(n: number, min: number, max: number) {
  return max === min ? 0 : ((n - min) / (max - min)) * 100;
}

export function RangeSlider({
  min,
  max,
  step = RANGE_SLIDER_DEFAULTS.step,
  value: valueProp,
  defaultValue,
  onChange,
  formatValue = String,
  showBounds = RANGE_SLIDER_DEFAULTS.showBounds,
  density = "default",
  disabled = RANGE_SLIDER_DEFAULTS.disabled,
  labels = RANGE_SLIDER_LABELS,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: RangeSliderProps) {
  const [inner, setInner] = useState<RangeValue>(defaultValue ?? [min, max]);
  const [low, high] = normaliseRange(valueProp ?? inner, min, max);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragging = useRef<Thumb | null>(null);
  const [active, setActive] = useState<Thumb | null>(null);
  const id = useId();

  const start = percent(low, min, max);
  const end = percent(high, min, max);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    node.style.setProperty("--range-start", `${start}%`);
    node.style.setProperty("--range-end", `${end}%`);
    node.style.setProperty("--range-width", `${end - start}%`);
    node.dataset.placed = "";
  }, [start, end]);

  const commit = useCallback(
    (next: RangeValue) => {
      if (next[0] === low && next[1] === high) return;
      if (valueProp === undefined) setInner(next);
      onChange?.(next);
    },
    [low, high, valueProp, onChange],
  );

  /** Moves one thumb, kept between the bound and the other thumb. */
  function moveThumb(thumb: Thumb, raw: number) {
    if (thumb === 0) commit([snapToStep(raw, min, step, min, high), high]);
    else commit([low, snapToStep(raw, min, step, low, max)]);
  }

  function onKeyDown(thumb: Thumb, event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const current = thumb === 0 ? low : high;
    const page = step * RANGE_SLIDER_PAGE_STEPS;
    const target: Record<string, number> = {
      ArrowLeft: current - step,
      ArrowDown: current - step,
      ArrowRight: current + step,
      ArrowUp: current + step,
      PageDown: current - page,
      PageUp: current + page,
      Home: thumb === 0 ? min : low,
      End: thumb === 0 ? high : max,
    };
    if (!(event.key in target)) return;
    event.preventDefault();
    moveThumb(thumb, target[event.key]!);
  }

  function valueAt(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    return min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    const raw = valueAt(event.clientX);
    const fromThumb = (event.target as HTMLElement).closest<HTMLElement>("[data-thumb]");
    let thumb: Thumb;
    if (fromThumb) thumb = fromThumb.dataset.thumb === "1" ? 1 : 0;
    else if (low === high) thumb = raw < low ? 0 : 1;
    else thumb = Math.abs(raw - low) <= Math.abs(raw - high) ? 0 : 1;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragging.current = thumb;
    setActive(thumb);
    thumbRefs.current[thumb]?.focus();
    if (!fromThumb) moveThumb(thumb, raw);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current === null) return;
    moveThumb(dragging.current, valueAt(event.clientX));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current === null) return;
    dragging.current = null;
    setActive(null);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  const thumbs: { thumb: Thumb; value: number; lo: number; hi: number; label: string }[] = [
    { thumb: 0, value: low, lo: min, hi: high, label: labels.min },
    { thumb: 1, value: high, lo: low, hi: max, label: labels.max },
  ];

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn("group/range flex flex-col gap-4 px-8", className)}
    >
      <div
        className={cn(
          "relative flex touch-none items-center",
          density === "compact"
            ? "h-8 before:absolute before:inset-x-0 before:-inset-y-18"
            : "h-44",
          !disabled && "cursor-pointer",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={trackRef}
          className={cn(
            "relative h-8 w-full rounded-4",
            disabled ? "bg-surface-disabled" : "bg-surface-neutral",
          )}
        >
          <div
            data-range-active=""
            className={cn(
              "absolute inset-y-0 left-(--range-start) w-(--range-width) rounded-4",
              disabled ? "bg-surface-disabled" : "bg-surface-accent",
            )}
          />
        </div>
        {thumbs.map(({ thumb, value, lo, hi, label }) => (
          <div
            key={thumb}
            ref={(node) => {
              thumbRefs.current[thumb] = node;
            }}
            id={`${id}-thumb-${thumb}`}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuemin={lo}
            aria-valuemax={hi}
            aria-valuenow={value}
            aria-valuetext={formatValue(value)}
            aria-orientation="horizontal"
            aria-disabled={disabled || undefined}
            data-thumb={thumb}
            data-active={active === thumb ? "" : undefined}
            onKeyDown={(event) => onKeyDown(thumb, event)}
            className={cn(
              "absolute top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-4",
              // The 44×44 hit area (component dimension: 16 + 2 × 14).
              "before:absolute before:-inset-14",
              "invisible group-data-placed/range:visible",
              thumb === 0 ? "left-(--range-start)" : "left-(--range-end)",
              // Two thumbs on the same value: the maximum stays on top unless it is at the end.
              thumb === 1 && high < max && "z-10",
              disabled
                ? "bg-icon-disabled"
                : "border border-interactive-default bg-surface-raised shadow-sm hover:border-interactive-hover hover:bg-surface-tertiary data-active:border-interactive-hover data-active:bg-surface-tertiary",
            )}
          />
        ))}
      </div>
      {showBounds && (
        <div className="flex justify-between text-label-sm text-text-tertiary tabular-nums">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}
