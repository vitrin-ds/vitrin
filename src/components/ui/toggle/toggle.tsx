import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `Toggle` (Status × State) on the toggle-* component tokens: a 32×18 track (1px
// toggle-off-border when off) and an 18px knob ringed 2px in the track colour. A native checkbox with role="switch" carries the state;
// the label sits to the left (Figma Do). Focus is Figma's own state: a 2px toggle-active-border stroke on the track.

export type ToggleProps = Omit<ComponentPropsWithRef<"input">, "type" | "role" | "children"> & {
  /** Describes the "on" state ("Email me about offers"). */
  label: ReactNode;
  hideLabel?: boolean;
};

export function Toggle({ label, hideLabel = false, className, disabled, ...props }: ToggleProps) {
  return (
    <label
      className={cn(
        "group relative inline-flex cursor-pointer items-center gap-12",
        "before:absolute before:inset-x-0 before:-inset-y-12",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      <span
        className={cn(
          "text-label-lg text-text-primary group-has-disabled:text-text-disabled",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </span>
      <input
        {...props}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative h-18 w-32 shrink-0 rounded-full",
          "bg-(--th-toggle-off-bg) inset-ring inset-ring-(--th-toggle-off-border)",
          "peer-checked:bg-(--th-toggle-on-bg) peer-checked:inset-ring-0",
          "peer-disabled:bg-surface-disabled peer-disabled:inset-ring-0",
          "peer-focus-visible:inset-ring-2 peer-focus-visible:inset-ring-(--th-toggle-active-border)",
        )}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 size-18 rounded-full bg-(--th-toggle-knob)",
            "inset-ring-2 inset-ring-(--th-toggle-off-bg) motion-safe:transition-transform",
            "group-has-checked:translate-x-14 group-has-checked:inset-ring-(--th-toggle-on-bg)",
            "group-has-disabled:inset-ring-surface-disabled",
          )}
        />
      </span>
    </label>
  );
}
