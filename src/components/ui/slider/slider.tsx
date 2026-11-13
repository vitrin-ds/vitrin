"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { RANGE_SLIDER_PAGE_STEPS, snapToStep } from "../range-slider/range-slider";

// Figma `Standard Slider` (30503:1398, State: Default · Hover · Active · Disabled): an 8px track
// (surface-neutral, radius 4), the Active Track up to the value (surface-accent) and a 16px knob,
// drawn like Range Slider's. Hover, Active and Disabled follow Figma; Figma has no Focus state.
//
// A11y: the APG slider. Keys: Arrow Left / Down −step, Arrow Right / Up +step, Page Down / Up
// ∓10 steps, Home / End. Pointer: press anywhere on the track, then drag. The value is data, so
// `--slider-value` is set on the root in a layout effect and read with token classes.

export const SLIDER_DEFAULTS = { step: 1, showKnob: true, disabled: false } as const;

export interface SliderProps {
  /** Lowest value of the track. */
  min: number;
  /** Highest value of the track. */
  max: number;
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled start value; `min` by default. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Text for a value, read by assistive technology, e.g. "€25". */
  formatValue?: (value: number) => string;
  /** Figma `Show Knob`. Hidden, the track still works by pointer and keyboard. */
  showKnob?: boolean;
  /** Figma `State=Disabled`. */
  disabled?: boolean;
  /** Accessible name; or `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function Slider({
  min,
  max,
  step = SLIDER_DEFAULTS.step,
  value: valueProp,
  defaultValue,
  onChange,
  formatValue = String,
  showKnob = SLIDER_DEFAULTS.showKnob,
  disabled = SLIDER_DEFAULTS.disabled,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: SliderProps) {
  const [inner, setInner] = useState(defaultValue ?? min);
  const value = snapToStep(valueProp ?? inner, min, step, min, max);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const id = useId();
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100;

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    node.style.setProperty("--slider-value", `${position}%`);
    node.dataset.placed = "";
  }, [position]);

  function commit(raw: number) {
    const next = snapToStep(raw, min, step, min, max);
    if (next === value) return;
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const page = step * RANGE_SLIDER_PAGE_STEPS;
    const target: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      PageDown: value - page,
      PageUp: value + page,
      Home: min,
      End: max,
    };
    if (!(event.key in target)) return;
    event.preventDefault();
    commit(target[event.key]!);
  }

  function valueAt(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return min + ratio * (max - min);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragging.current = true;
    setActive(true);
    knobRef.current?.focus();
    commit(valueAt(event.clientX));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current) commit(valueAt(event.clientX));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "group/slider relative flex h-44 touch-none items-center px-8",
        !disabled && "cursor-pointer",
        className,
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
          className={cn(
            "absolute inset-y-0 left-0 w-(--slider-value) rounded-4",
            disabled ? "bg-surface-disabled" : "bg-surface-accent",
          )}
        />
        <div
          ref={knobRef}
          id={id}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
          aria-orientation="horizontal"
          aria-disabled={disabled || undefined}
          data-active={active ? "" : undefined}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute top-1/2 left-(--slider-value) size-16 -translate-x-1/2 -translate-y-1/2 rounded-4",
            // The 44×44 hit area (component dimension: 16 + 2 × 14).
            "before:absolute before:-inset-14",
            "invisible group-data-placed/slider:visible",
            !showKnob && "opacity-0",
            disabled
              ? "bg-icon-disabled"
              : "border border-interactive-default bg-surface-raised shadow-sm hover:border-interactive-hover hover:bg-surface-tertiary data-active:border-interactive-hover data-active:bg-surface-tertiary",
          )}
        />
      </div>
    </div>
  );
}
