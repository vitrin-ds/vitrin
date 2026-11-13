"use client";

import { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `Tooltip` on the callout-neutral-solid-* tokens: body-large text, padding 20 × 16,
// radius 8, text at most 276px wide, a 24×12 arrow 16px in from the corner at start / end.
// WAI-ARIA tooltip pattern: shows on hover and keyboard focus, hides on Escape, blur and
// pointer leave; stays while the pointer is over it (WCAG 1.4.13). Text only, no actions.
// `placement` is the side of the trigger the tooltip sits on (Figma's Position names don't
// match their arrows consistently; see the Phase 2b notes).

export type TooltipSide = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";

const SIDE = {
  top: "bottom-full mb-12",
  bottom: "top-full mt-12",
  left: "right-full mr-12",
  right: "left-full ml-12",
} as const;

const ALIGN = {
  vertical: { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" },
  horizontal: { start: "top-0", center: "top-1/2 -translate-y-1/2", end: "bottom-0" },
} as const;

// The arrow sits on the edge that faces the trigger and points at it.
const ARROW_SIDE = {
  top: "top-full rotate-180",
  bottom: "bottom-full",
  left: "left-full rotate-90 -ml-6",
  right: "right-full -rotate-90 -mr-6",
} as const;

const ARROW_ALIGN = {
  vertical: { start: "left-16", center: "left-1/2 -translate-x-1/2", end: "right-16" },
  horizontal: { start: "top-16", center: "top-1/2 -translate-y-1/2", end: "bottom-16" },
} as const;

export const TOOLTIP_DEFAULTS = { side: "top", align: "center" } as const;

export interface TooltipProps {
  /** Figma `Body Text`: supplementary, optional context, ideally under two lines. */
  content: ReactNode;
  /** The trigger: one focusable element. It gets `aria-describedby`. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: TooltipSide;
  align?: TooltipAlign;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = TOOLTIP_DEFAULTS.side,
  align = TOOLTIP_DEFAULTS.align,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const axis = side === "top" || side === "bottom" ? "vertical" : "horizontal";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {cloneElement(children, {
        "aria-describedby": cn(children.props["aria-describedby"], id) || undefined,
      })}
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={cn(
          "absolute z-20 w-max max-w-316 rounded-overlay px-20 py-16 text-body-lg",
          "bg-(--th-callout-neutral-solid-bg) text-(--th-callout-neutral-solid-text)",
          SIDE[side],
          ALIGN[axis][align],
          className,
        )}
      >
        {content}
        <svg
          aria-hidden
          viewBox="0 0 24 12"
          className={cn(
            "absolute h-12 w-24 fill-(--th-callout-neutral-solid-bg)",
            ARROW_SIDE[side],
            ARROW_ALIGN[axis][align],
          )}
        >
          <path d="M12 0 24 12H0Z" />
        </svg>
      </span>
    </span>
  );
}
