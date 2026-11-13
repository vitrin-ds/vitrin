"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { BrandImage } from "@/components/base/brand-image/brand-image";
import { cn } from "@/lib/cn";
import { keyToMove, moveIndex } from "@/lib/a11y/list-navigation";
import { useDismiss } from "@/lib/a11y/use-dismiss";
import { isTypeaheadKey, useTypeahead } from "@/lib/a11y/use-typeahead";
import { Field, type FieldMessages } from "@/components/base/field/field";
import { DropdownItem } from "./dropdown-item";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import {
  TEXT_INPUT_DEFAULTS,
  TEXT_INPUT_PADDING_Y,
  textInputBoxVariants,
  type TextInputProps,
} from "../text-input/text-input";

// Figma `Dropdown` (trigger, Size × State) + `Dropdown Item` (option, State), as the WAI-ARIA
// APG select-only combobox: focus stays on the trigger, the highlighted option is
// aria-activedescendant. Figma has no menu panel yet: it is a raised surface (surface-raised + shadow)
// under the trigger; see the Phase 2a notes.
//
// Variants:
// - `box` (default): the trigger shares the Text Input box, inside a Field (label on top, help /
//   error message below). For forms.
// - `text`: a plain text trigger, "Sort: Relevance ⌄" (Figma Sort trigger 31511:13429: title-small,
//   gap 8, keyboard_arrow_down in icon-accent). The label is the visible prefix and the
//   accessible name is "label + value" (aria-labelledby on both spans). Toolbar use only: no help
//   or error message. The hit area is 44 high; the menu (268 wide, Figma Sort menu 31511:13432)
//   opens under it, aligned to its end.
//
// Forms and autofill: the trigger is a <button>, which neither submits a value nor gets
// autofilled. With `name` or `autoComplete`, a visually hidden native <select> mirrors the value:
// - it carries `name`, so a native form submission (and FormData) includes the value;
// - it carries `autocomplete` (e.g. "country"), and browsers autofill <select> elements by
//   matching an option's value or text (Chrome, Safari and Firefox all fill selects; none fill
//   <input type="hidden">). Autofill fires `change` on it, which selects that option here.
// It is sr-only rather than display:none / hidden, because browsers skip fields that are not
// rendered; tabIndex -1 + aria-hidden keep it out of the tab order and the accessibility tree
// (the combobox is the control). It never gets `required`: a native validation bubble can't
// point at an invisible field, so required-ness is aria-required on the combobox and validation
// stays with the form.

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Figma Dropdown Item `Left Icon`. Decorative. */
  icon?: IconName;
  /** A picture instead of the icon, e.g. a country's flag (public/brand/flags). Decorative. */
  image?: string;
  /** Figma Dropdown Item `Right Icon`. Decorative; the selected option shows check_circle. */
  rightIcon?: IconName;
}

export type DropdownVariant = "box" | "text" | "plain";

export type DropdownProps = FieldMessages & {
  /**
   * Figma `Label Text`. For `variant="text"` it is the visible prefix before the value
   * ("Sort:"), and part of the accessible name with the value.
   */
  label: ReactNode;
  /**
   * `box`: the form field (Text Input box). `text`: a plain text trigger, e.g. Sort. `plain`: the
   * Date Picker's year and month: value only (label for screen readers), label-large, gap 4.
   */
  variant?: DropdownVariant;
  /** `plain`: which edge of the trigger the 140-wide menu lines up with. */
  menuAlign?: "start" | "end";
  /** Keeps the label for screen readers only (e.g. inside a product card). */
  hideLabel?: boolean;
  options: readonly DropdownOption[];
  /** Controlled value. `null` = nothing selected. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Figma empty state ("Select"). */
  placeholder?: string;
  /** Figma `Size`. Forms use Medium. */
  size?: TextInputProps["size"];
  /** Figma `Left Icon` on the trigger. Decorative. */
  leftIcon?: IconName;
  required?: boolean;
  disabled?: boolean;
  /** Submits the value with a form (through the hidden native select). */
  name?: string;
  /** Autofill token (e.g. "country", "shipping country"); see the header comment. */
  autoComplete?: string;
  /** Focus left the trigger (the list never takes focus, so this is the whole widget). */
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  id?: string;
  className?: string;
};

export const DROPDOWN_DEFAULTS = {
  variant: "box",
  size: TEXT_INPUT_DEFAULTS.size,
  placeholder: "Select",
} as const;

export function Dropdown({
  label,
  variant = DROPDOWN_DEFAULTS.variant,
  menuAlign = "end",
  hideLabel,
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = DROPDOWN_DEFAULTS.placeholder,
  size = DROPDOWN_DEFAULTS.size,
  leftIcon,
  required,
  disabled = false,
  name,
  autoComplete,
  onBlur,
  helperText,
  errorText,
  id: idProp,
  className,
}: DropdownProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : uncontrolled;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const refs = useMemo(() => [triggerRef, listRef], []);
  const invalid = errorText != null && errorText !== false;

  const close = useCallback(() => setOpen(false), []);
  useDismiss(refs, open, close);
  const typeahead = useTypeahead(options, (o) => o.label);

  /** Opening highlights the selected option, or the first enabled one. */
  function firstActive() {
    return selectedIndex >= 0 ? selectedIndex : moveIndex(options, -1, "next");
  }

  function show(index: number) {
    setActive(index);
    setOpen(true);
    scrollToOption(index);
  }

  function highlight(index: number) {
    setActive(index);
    scrollToOption(index);
  }

  function scrollToOption(index: number) {
    requestAnimationFrame(() =>
      document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" }),
    );
  }

  function select(index: number) {
    const option = options[index];
    if (!option || option.disabled) return false;
    if (valueProp === undefined) setUncontrolled(option.value);
    if (option.value !== value) onValueChange?.(option.value);
    return true;
  }

  function choose(index: number) {
    if (!select(index)) return;
    setOpen(false);
    triggerRef.current?.focus();
  }

  /** Browser autofill (or a script) changed the hidden native select. */
  function onNativeChange(event: ChangeEvent<HTMLSelectElement>) {
    select(options.findIndex((o) => o.value === event.target.value));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const move = keyToMove(event.key);
    const start = firstActive();

    if (!open) {
      if (move === "first" || move === "last") {
        event.preventDefault();
        show(moveIndex(options, start, move));
      } else if (move || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show(start);
      } else if (isTypeaheadKey(event)) {
        const match = typeahead(event.key, selectedIndex);
        if (match !== null) show(match);
      }
      return;
    }

    if (move) {
      event.preventDefault();
      highlight(moveIndex(options, active, move));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      // APG: Tab selects the highlighted option and moves on.
      if (active >= 0) choose(active);
      setOpen(false);
    } else if (isTypeaheadKey(event)) {
      const match = typeahead(event.key, active);
      if (match !== null) highlight(match);
    }
  }

  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const isPlain = variant === "plain";
  const isText = variant === "text" || isPlain;

  const chevronClass = disabled
    ? "text-(--th-input-icon-disabled)"
    : invalid && !isText
      ? "text-(--th-input-icon-error)"
      : open || variant === "text"
        ? "text-(--th-input-icon-accent)"
        : "text-(--th-input-icon)";

  const chevron = (
    <Icon
      name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
      tone="current"
      className={cn("shrink-0", chevronClass)}
    />
  );

  /** Shared by both variants: role, popup wiring and keyboard. */
  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    role: "combobox" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": listId,
    "aria-activedescendant": open && active >= 0 ? optionId(active) : undefined,
    "aria-required": required || undefined,
    disabled,
    onClick: () => (open ? setOpen(false) : show(firstActive())),
    onKeyDown,
    onBlur,
  };

  const nativeSelect = (name || autoComplete) && (
    <select
      name={name}
      autoComplete={autoComplete}
      value={value ?? ""}
      onChange={onNativeChange}
      disabled={disabled}
      tabIndex={-1}
      aria-hidden
      className="sr-only"
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const listbox = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      aria-labelledby={labelId}
      tabIndex={-1}
      hidden={!open}
      className={cn(
        "absolute top-full z-10 mt-4 max-h-200 overflow-y-auto rounded-overlay bg-surface-raised shadow-md",
        isPlain
          ? cn("w-140", menuAlign === "start" ? "start-0" : "end-0")
          : isText
            ? "end-0 w-268"
            : "inset-x-0",
      )}
    >
      {options.map((option, index) => (
        <DropdownItem
          key={option.value}
          id={optionId(index)}
          label={option.label}
          selected={index === selectedIndex}
          highlighted={index === active}
          disabled={option.disabled}
          image={option.image}
          icon={option.icon}
          rightIcon={option.rightIcon}
          onPointerMove={() => !option.disabled && setActive(index)}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => choose(index)}
        />
      ))}
    </ul>
  );

  if (isText) {
    return (
      <div className={cn("relative inline-flex", className)}>
        <button
          {...triggerProps}
          id={id}
          aria-labelledby={`${labelId} ${valueId}`}
          className={cn(
            "inline-flex cursor-pointer items-center rounded-4 whitespace-nowrap",
            isPlain
              ? "relative gap-4 text-label-lg before:absolute before:-inset-y-12"
              : "min-h-44 gap-8 text-title-sm",
            disabled
              ? "cursor-not-allowed text-(--th-input-text-disabled)"
              : "text-(--th-input-text-value)",
          )}
        >
          <span>
            <span id={labelId} className={isPlain ? "sr-only" : undefined}>
              {label}
            </span>{" "}
            <span id={valueId}>{selected ? selected.label : placeholder}</span>
          </span>
          {chevron}
        </button>
        {nativeSelect}
        {listbox}
      </div>
    );
  }

  return (
    <Field
      id={id}
      label={label}
      required={required}
      hideLabel={hideLabel}
      disabled={disabled}
      helperText={helperText}
      errorText={errorText}
      className={className}
    >
      {(control) => (
        <div className="relative">
          <button
            {...control}
            {...triggerProps}
            className={cn(
              textInputBoxVariants({ size, invalid, disabled, modified: false }),
              TEXT_INPUT_PADDING_Y[size],
              "w-full cursor-pointer text-left text-label-lg",
              open && "inset-ring-(--th-input-border-focus)",
            )}
          >
            {leftIcon && (
              <Icon
                name={leftIcon}
                tone="current"
                className={
                  disabled
                    ? "text-(--th-input-icon-disabled)"
                    : invalid
                      ? "text-(--th-input-icon-error)"
                      : "text-(--th-input-icon-accent)"
                }
              />
            )}
            {selected?.image && (
              <BrandImage
                src={selected.image}
                alt=""
                width={20}
                height={20}
                className="shrink-0"
                fallback={
                  <span
                    aria-hidden
                    className="size-20 shrink-0 rounded-full bg-surface-secondary"
                  />
                }
              />
            )}
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                selected ? "text-(--th-input-text-value)" : "text-(--th-input-text-placeholder)",
                disabled && "text-(--th-input-text-disabled)",
              )}
            >
              {selected ? selected.label : placeholder}
            </span>
            {chevron}
          </button>
          {nativeSelect}
          {listbox}
        </div>
      )}
    </Field>
  );
}
