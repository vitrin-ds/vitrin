import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// The label row and help message shared by Figma `.Base Text Input`, `.Base Textarea` and the
// Dropdown trigger: Title Text + Required asterisk on top, Help Message below, no gap between
// them. Owns the id / aria wiring; the box in the middle belongs to each component. The label
// gets the id `${id}-label` (a listbox popup names itself with it).

export interface FieldMessages {
  /** Figma `Help Message Text` in the default state. */
  helperText?: ReactNode;
  /**
   * Figma `State=Error`. The message replaces the helper text and marks the control invalid.
   * Required for the error state: "Don't show error state without a helpful message".
   */
  errorText?: ReactNode;
}

export interface FieldProps extends FieldMessages {
  /** Figma `Title Text`. Always visible: the placeholder is never a replacement for it. */
  label: ReactNode;
  /** Figma `Show Required`: adds the asterisk. Pass `required` to the control as well. */
  required?: boolean;
  /**
   * Figma `Show Title=false` (e.g. the variant selector inside a product card): the label stays
   * for screen readers only.
   */
  hideLabel?: boolean;
  disabled?: boolean;
  /**
   * The surface the field sits on. On Accent (footer newsletter on surface-accent-strong) draws
   * the help and error messages with input-text-helper-on-accent / input-text-error-on-accent.
   * The label keeps input-text-label: on accent, hide it (no on-accent label token yet).
   */
  tone?: "default" | "on-accent";
  /** Right side of the label row (Figma Text Area `Right Detail`, e.g. a character count). */
  labelDetail?: ReactNode;
  /** Use an existing id for the control; one is generated otherwise. */
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/** Spread onto the native control (input, textarea, combobox button). */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

export function Field({
  label,
  required,
  hideLabel = false,
  disabled,
  tone = "default",
  labelDetail,
  helperText,
  errorText,
  id: idProp,
  className,
  children,
}: FieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const messageId = `${id}-message`;
  const invalid = errorText != null && errorText !== false;
  const message = invalid ? errorText : helperText;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className={cn("flex items-start justify-between gap-8 px-4", hideLabel && "sr-only")}>
        <label
          id={`${id}-label`}
          htmlFor={id}
          className={cn(
            "text-title-sm text-(--th-input-text-label)",
            invalid && "text-(--th-input-text-error)",
            disabled && "text-(--th-input-text-disabled)",
          )}
        >
          {label}
          {required && (
            <span
              aria-hidden
              className={cn(
                "text-(--th-input-text-error)",
                disabled && "text-(--th-input-text-disabled)",
              )}
            >
              *
            </span>
          )}
        </label>
        {labelDetail}
      </div>
      {children({
        id,
        "aria-describedby": message ? messageId : undefined,
        "aria-invalid": invalid || undefined,
      })}
      {message && (
        <p
          id={messageId}
          className={cn(
            "px-4 text-label-sm",
            tone === "on-accent"
              ? invalid
                ? "text-(--th-input-text-error-on-accent)"
                : "text-(--th-input-text-helper-on-accent)"
              : invalid
                ? "text-(--th-input-text-error)"
                : "text-(--th-input-text-helper)",
            disabled && "text-(--th-input-text-disabled)",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
