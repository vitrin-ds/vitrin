"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";
import { pageItemVariants } from "./pagination";

// Figma `Slider Pagination Bar`: a 2px progress track (Progress 2x) and prev / next `.Asset Page`
// buttons, gap 40. For carousels and horizontal scrollers; the owner moves the content.

export interface SliderPaginationLabels {
  progress: string;
  previous: string;
  next: string;
  /** Spoken position, e.g. "3 of 8". */
  position: (current: number, total: number) => string;
}

export const SLIDER_PAGINATION_LABELS: SliderPaginationLabels = {
  progress: "Position",
  previous: "Previous",
  next: "Next",
  position: (current, total) => `${current} of ${total}`,
};

export interface SliderPaginationProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Current position, 1-based (slide or scroll step). */
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  labels?: SliderPaginationLabels;
}

export function SliderPagination({
  current,
  total,
  onPrevious,
  onNext,
  labels = SLIDER_PAGINATION_LABELS,
  className,
  ...props
}: SliderPaginationProps) {
  const position = Math.min(Math.max(current, 1), Math.max(total, 1));
  return (
    <div {...props} className={cn("flex items-center gap-40", className)}>
      <Progress
        className="flex-1"
        value={position}
        max={Math.max(total, 1)}
        label={labels.progress}
        valueText={labels.position(position, total)}
      />
      <div className="flex items-center gap-12">
        <StepButton
          icon="keyboard_arrow_left"
          label={labels.previous}
          disabled={position <= 1}
          onClick={onPrevious}
        />
        <StepButton
          icon="keyboard_arrow_right"
          label={labels.next}
          disabled={position >= total}
          onClick={onNext}
        />
      </div>
    </div>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: "keyboard_arrow_left" | "keyboard_arrow_right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer disabled:cursor-not-allowed",
        pageItemVariants({ state: disabled ? "disabled" : "default" }),
      )}
    >
      <Icon name={icon} size="16" tone="current" />
    </button>
  );
}
