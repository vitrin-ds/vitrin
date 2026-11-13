import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { BaseChoice } from "@/components/base/choice/base-choice";
import { choiceGlyphClass, choiceLabelClass } from "@/components/base/choice/choice-classes";
import { Icon } from "../icon/icon";

// Figma `Radio Button` (Usage × State): radio_button_unchecked / radio_button_checked. Native
// radios sharing a `name` give the arrow-key behaviour; group them in `RadioGroup`.

export type RadioProps = Omit<ComponentPropsWithRef<"input">, "type" | "children"> & {
  /** Figma `Label Text`. */
  label: ReactNode;
  hideLabel?: boolean;
  /** Figma `State=Error`: sets aria-invalid. */
  error?: boolean;
};

export function Radio({ error = false, ...props }: RadioProps) {
  return (
    <BaseChoice
      {...props}
      type="radio"
      aria-invalid={error || undefined}
      labelClassName={choiceLabelClass(error)}
      glyph={
        <span className={`${choiceGlyphClass(error)} rounded-full`}>
          <span className="flex group-has-checked:hidden">
            <Icon name="radio_button_unchecked" tone="current" />
          </span>
          <span className="hidden group-has-checked:flex">
            <Icon name="radio_button_checked" tone="current" />
          </span>
        </span>
      }
    />
  );
}

export interface RadioGroupProps {
  /** Visible group question, e.g. "Delivery speed". Rendered as the fieldset legend. */
  legend: ReactNode;
  /** Error message for the group (Figma Radio `State=Error` on each option). */
  errorText?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** fieldset + legend around a stack of Radios (Figma: "Stack vertically for better readability"). */
export function RadioGroup({ legend, errorText, children, className }: RadioGroupProps) {
  const errorId = useId();
  return (
    <fieldset className={className} aria-describedby={errorText ? errorId : undefined}>
      <legend className="mb-12 px-4 text-title-sm text-text-primary">{legend}</legend>
      <div className="flex flex-col items-start gap-24">{children}</div>
      {errorText && (
        <p id={errorId} className="mt-12 px-4 text-label-sm text-text-error">
          {errorText}
        </p>
      )}
    </fieldset>
  );
}
