import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, type FieldMessages } from "@/components/base/field/field";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `Text Input` (Size × State) on the input-* component tokens. Hover and Focus are CSS
// states; Error, Disabled and Modified come from props. The border is an inset ring (Figma
// inside stroke), so Large 60 · Medium 52 · Small 36 stay exact. Figma `State=Focus` has no outer
// ring: the box shows focus with the 1px input-border-focus border and shadow-base, bound to the
// box's :focus-within. Tone On Accent (an input on an accent surface, e.g. the
// footer newsletter) uses the on-accent message tokens.
//
// `action`: a trailing control inside the box (e.g. a small Button "Apply" for a promo code),
// after the <input>, not in it. The box keeps its focus border / shadow while either has focus
// (it is one field). The end padding
// drops to 8 so a Small button sits 8 from the edge of a Medium box (36 in 52), Medium in Large
// (44 in 60) likewise. Messages stay under the box, so the action keeps its place with an error.
export const textInputBoxVariants = cva(
  [
    "flex cursor-text items-center gap-8 rounded-control focus-visible:outline-none",
    "bg-(--th-input-bg) inset-ring inset-ring-(--th-input-border)",
    "hover:not-focus-within:inset-ring-(--th-input-border-hover)",
    "focus-within:shadow-base focus-within:inset-ring-(--th-input-border-focus)",
  ],
  {
    variants: {
      // Vertical padding sits on the <input> (TEXT_INPUT_PADDING_Y) so the whole height is clickable.
      size: { lg: "px-16", md: "px-16", sm: "px-12" },
      // The field itself is the same on any surface; tone switches the message tokens (Field).
      tone: { default: "", "on-accent": "" },
      invalid: {
        true: "inset-ring-(--th-input-border-error) focus-within:inset-ring-(--th-input-border-error) hover:not-focus-within:inset-ring-(--th-input-border-error)",
        false: "",
      },
      modified: {
        true: "bg-(--th-input-bg-modified) shadow-base inset-ring-(--th-input-border-modified)",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed bg-(--th-input-bg-disabled) inset-ring-(--th-input-border-disabled) hover:not-focus-within:inset-ring-(--th-input-border-disabled)",
        false: "",
      },
      action: { true: "pe-8", false: "" },
    },
  },
);

/** The native control inside an input box: value / placeholder colours, no own outline. */
export const fieldControlClass = cn(
  // A 20px line box like the Figma text row (label-large alone is 19.88px).
  "box-content h-20 min-w-0 flex-1 bg-transparent text-label-lg text-(--th-input-text-value) outline-none",
  "placeholder:text-(--th-input-text-placeholder)",
  "aria-invalid:text-(--th-input-text-error)",
  "disabled:cursor-not-allowed disabled:text-(--th-input-text-disabled) disabled:placeholder:text-(--th-input-text-disabled)",
);

export const TEXT_INPUT_PADDING_Y = { lg: "py-20", md: "py-16", sm: "py-8" } as const;

export const TEXT_INPUT_DEFAULTS = {
  size: "md",
  tone: "default",
} as const satisfies Pick<Required<VariantProps<typeof textInputBoxVariants>>, "size" | "tone">;

export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "size" | "children"> &
  FieldMessages & {
    /** Figma `Title Text`. */
    label: ReactNode;
    /** Beside the label, on the right: e.g. a Label "VERIFIED" or "MODIFIED" (03.05). */
    labelDetail?: ReactNode;
    /** Figma `Show Title=false`: the label stays for screen readers only (a search field). */
    hideLabel?: boolean;
    /** Figma `Size`. Forms use Medium. */
    size?: NonNullable<VariantProps<typeof textInputBoxVariants>["size"]>;
    /** The surface it sits on: On Accent for accent fills (footer newsletter). */
    tone?: NonNullable<VariantProps<typeof textInputBoxVariants>["tone"]>;
    /** Figma `State=Modified`: a value changed but not saved yet. */
    modified?: boolean;
    /** Figma `Left Icon`. Decorative. */
    leftIcon?: IconName;
    /** Left Icon colour: input-icon, or input-icon-accent as Toolbar.Top.Search's search glyph. */
    leftIconTone?: "default" | "accent";
    /** Figma `Right Icon`. Decorative; for an interactive control use `action`. */
    rightIcon?: IconName;
    /**
     * Trailing control inside the box, after the input (e.g. `<Button size="sm">Apply</Button>`).
     * Give it its own accessible name; it is not part of the input's.
     */
    action?: ReactNode;
    /** Classes for the outer field (width, grid placement). */
    className?: string;
  };

export function TextInput({
  label,
  labelDetail,
  hideLabel = false,
  helperText,
  errorText,
  size = TEXT_INPUT_DEFAULTS.size,
  tone = TEXT_INPUT_DEFAULTS.tone,
  modified = false,
  leftIcon,
  leftIconTone = "default",
  rightIcon,
  action,
  required,
  disabled = false,
  id,
  className,
  type = "text",
  ...props
}: TextInputProps) {
  const invalid = errorText != null && errorText !== false;
  const iconClass = disabled ? "text-(--th-input-icon-disabled)" : "text-(--th-input-icon)";
  return (
    <Field
      id={id}
      label={label}
      labelDetail={labelDetail}
      hideLabel={hideLabel}
      required={required}
      disabled={disabled}
      tone={tone}
      helperText={helperText}
      errorText={errorText}
      className={className}
    >
      {(control) => (
        <div
          className={textInputBoxVariants({
            size,
            tone,
            invalid,
            modified,
            disabled,
            action: action != null,
          })}
        >
          {leftIcon && (
            <Icon
              name={leftIcon}
              tone="current"
              className={
                leftIconTone === "accent" && !disabled ? "text-(--th-input-icon-accent)" : iconClass
              }
            />
          )}
          <input
            {...props}
            {...control}
            type={type}
            required={required}
            disabled={disabled}
            className={cn(fieldControlClass, TEXT_INPUT_PADDING_Y[size])}
          />
          {rightIcon && <Icon name={rightIcon} tone="current" className={iconClass} />}
          {action != null && <div className="flex shrink-0 items-center">{action}</div>}
        </div>
      )}
    </Field>
  );
}
