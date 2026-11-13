"use client";

import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BaseChoice } from "@/components/base/choice/base-choice";
import { choiceGlyphClass, choiceLabelClass } from "@/components/base/choice/choice-classes";
import { Icon } from "../icon/icon";

// Figma `Checkbox` (Usage × State). The glyph is the Material Symbol itself, filled:
// check_box_outline_blank · check_box · indeterminate_check_box. Unchecked / Checked follow
// the native input (CSS); Indeterminate is a prop, because HTML has no attribute for it.

export const CHECKBOX_DEFAULTS = { indeterminate: false, error: false } as const;

export type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type" | "children"> & {
  /** Figma `Label Text`. Always required: the visible label can be hidden with `hideLabel`. */
  label: ReactNode;
  hideLabel?: boolean;
  /** Figma `Usage=Indeterminate`, e.g. "select all" with only some items selected. */
  indeterminate?: boolean;
  /** Figma `State=Error`: sets aria-invalid. Explain the error next to the group. */
  error?: boolean;
};

export function Checkbox({
  indeterminate = CHECKBOX_DEFAULTS.indeterminate,
  error = CHECKBOX_DEFAULTS.error,
  ref,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <BaseChoice
      {...props}
      ref={(node) => {
        inputRef.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      type="checkbox"
      aria-invalid={error || undefined}
      labelClassName={choiceLabelClass(error)}
      glyph={
        <span className={choiceGlyphClass(error)}>
          {indeterminate ? (
            <Icon name="indeterminate_check_box" tone="current" />
          ) : (
            <>
              <span className={cn("flex group-has-checked:hidden")}>
                <Icon name="check_box_outline_blank" tone="current" />
              </span>
              <span className="hidden group-has-checked:flex">
                <Icon name="check_box" tone="current" />
              </span>
            </>
          )}
        </span>
      }
    />
  );
}
