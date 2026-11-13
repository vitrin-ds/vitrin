"use client";

import { cva } from "class-variance-authority";
import { useState, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from "react";
import { Field, type FieldMessages } from "@/components/base/field/field";

// Figma `Text Area` (State) on the input-* component tokens. One size; padding 12. Figma's
// `Filled` state is the focused one (border-focus + shadow), shown instead of the global focus
// ring, as on Text Input. The resize handle and scrollbar
// are the native ones: Figma draws them with untokenised vectors.
export const textAreaVariants = cva([
  "block min-h-144 w-full resize-y rounded-control p-12 text-label-lg",
  "bg-(--th-input-bg) text-(--th-input-text-value) inset-ring inset-ring-(--th-input-border)",
  "placeholder:text-(--th-input-text-placeholder)",
  "hover:not-focus:inset-ring-(--th-input-border-hover)",
  "outline-none focus:shadow-base focus:inset-ring-(--th-input-border-focus)",
  "aria-invalid:text-(--th-input-text-error) aria-invalid:inset-ring-(--th-input-border-error)",
  "aria-invalid:hover:not-focus:inset-ring-(--th-input-border-error) aria-invalid:focus:inset-ring-(--th-input-border-error)",
  "disabled:cursor-not-allowed disabled:resize-none disabled:bg-(--th-input-bg-disabled)",
  "disabled:text-(--th-input-text-disabled) disabled:inset-ring-(--th-input-border-disabled)",
  "disabled:placeholder:text-(--th-input-text-disabled) disabled:hover:inset-ring-(--th-input-border-disabled)",
]);

export const TEXT_AREA_DEFAULTS = {
  // Figma: min height 144 = six 20px lines + 12px padding (min-h-144 holds it exactly).
  rows: 6,
  showCount: false,
} as const;

export type TextAreaProps = Omit<ComponentPropsWithRef<"textarea">, "children"> &
  FieldMessages & {
    /** Figma `Title Text`. */
    label: ReactNode;
    /** Figma `Right Detail`: shows `{length}/{maxLength}` when `maxLength` is set. */
    showCount?: boolean;
    /** Figma `Right Detail` as text, e.g. "(optional)"; the counter wins when both are given. */
    labelDetail?: ReactNode;
    /** Classes for the outer field (width, grid placement). */
    className?: string;
  };

export function TextArea({
  label,
  helperText,
  errorText,
  showCount = TEXT_AREA_DEFAULTS.showCount,
  labelDetail,
  rows = TEXT_AREA_DEFAULTS.rows,
  required,
  disabled,
  id,
  className,
  value,
  defaultValue,
  onChange,
  maxLength,
  ...props
}: TextAreaProps) {
  const [uncontrolledLength, setUncontrolledLength] = useState(String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value).length : uncontrolledLength;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  }

  const counter =
    showCount && maxLength !== undefined ? (
      <span className="text-body-sm text-(--th-input-text-placeholder)">
        {length}/{maxLength}
      </span>
    ) : undefined;

  return (
    <Field
      id={id}
      label={label}
      required={required}
      disabled={disabled}
      helperText={helperText}
      errorText={errorText}
      labelDetail={
        counter ??
        (labelDetail && (
          <span className="text-body-sm text-(--th-input-text-placeholder)">{labelDetail}</span>
        ))
      }
      className={className}
    >
      {(control) => (
        <textarea
          {...props}
          {...control}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          className={textAreaVariants()}
        />
      )}
    </Field>
  );
}
