"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/a11y/use-dismiss";
import { Field } from "@/components/base/field/field";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";
import { Spinner } from "@/components/ui/spinner/spinner";
import {
  TEXT_INPUT_PADDING_Y,
  fieldControlClass,
  textInputBoxVariants,
  type TextInputProps,
} from "@/components/ui/text-input/text-input";
import { HighlightMatch } from "./highlight-match";

// Figma "Search & Auto Complete" (03. Patterns › Search Filtering) as the WAI-ARIA APG combobox
// with a listbox popup (list autocomplete, no automatic selection):
// - Field: the Text Input box (`Text Input [Inner Search]` in Main Header [Search] is Small, 36px)
//   with the `search` glyph on the right. Here the glyph is the form's submit button, so mouse
//   users can submit; Enter submits natively, so the form works without JS (GET /search?q=).
// - Panel ("Suggestion Panel", WD/WM.08.01–08.02): a raised surface (surface-raised + shadow) right under the
//   field, py 16, radius 8. Each group ("Featured Box") is py 20 with an overline title
//   (label-medium, text-accent, px 16 · py 4) above `SearchSuggestionList` rows.
// - Row (`.Base.SearchSuggestionList`): px 16 · py 12, gap 12, title-small text-primary on one
//   line (Figma Do: truncate), a 20px light trailing glyph (icon-accent), a 1px border-neutral
//   rule drawn inside the row's bottom edge, so rows stay 44 tall.
//   Figma's Hover & Tap / Focus variants only tint that rule (interactive-subtle-hover / -active),
//   which is not a visible focus indicator for aria-activedescendant; the same two tokens fill the
//   row instead (hover · highlighted).
// Figma has no separate mobile sheet: on WM.08.* the same panel opens under the header field at
// full width, so one component covers both.

export interface SearchOption {
  /** Stable id, unique within `options`. */
  value: string;
  /** Figma `Title Text`. Inserted into the field when chosen. */
  label: string;
  /** Group title (Figma "Box Title", e.g. "Popular searches"). Consecutive options share it. */
  group?: string;
  /** Figma `Right Icon`. Decorative: the whole row is the target (Figma Don't). */
  icon?: IconName;
}

export type SearchAutocompleteProps = {
  /** Accessible name of the field and the search landmark ("Search products"). */
  label: string;
  /** Show the label above the field. The header field has none (Figma), so hidden by default. */
  showLabel?: boolean;
  /** Figma `Text Input` size: Small in the header, Medium on a page (forms use Medium). */
  size?: TextInputProps["size"];
  placeholder?: string;
  /** Suggestions for the current query, already filtered by the caller. */
  options: readonly SearchOption[];
  /** The caller is fetching suggestions: the panel shows a spinner and the listbox is busy. */
  loading?: boolean;
  /** Controlled query. */
  value?: string;
  defaultValue?: string;
  /** Every edit of the query (typing, Escape clearing it, choosing a suggestion). */
  onQueryChange?: (query: string) => void;
  /**
   * A suggestion was chosen. Without it the form submits the suggestion's label, i.e. it goes
   * to `action?name=label`.
   */
  onSelect?: (option: SearchOption) => void;
  /** Called on submit with the trimmed query. Call `event.preventDefault()` to route yourself. */
  onSubmit?: (query: string, event: FormEvent<HTMLFormElement>) => void;
  /** Form action: the search route. */
  action?: string;
  /** Query parameter name. */
  name?: string;
  /** Open the panel on focus when there are suggestions (Figma 08.01 "First Focus"). */
  openOnFocus?: boolean;
  /** Overrides for the UI strings (i18n). */
  labels?: Partial<SearchAutocompleteLabels>;
  id?: string;
  /** Classes for the form (width, grid placement). */
  className?: string;
};

export interface SearchAutocompleteLabels {
  submit: string;
  loading: string;
  /** Live-region text for the number of suggestions. */
  count: (count: number) => string;
  /** Live-region text when a non-empty query has no suggestions. */
  empty: string;
}

export const SEARCH_AUTOCOMPLETE_LABELS: SearchAutocompleteLabels = {
  submit: "Search",
  loading: "Loading suggestions",
  count: (count) => (count === 1 ? "1 suggestion" : `${count} suggestions`),
  empty: "No suggestions",
};

export const SEARCH_AUTOCOMPLETE_DEFAULTS = {
  size: "sm",
  action: "/search",
  name: "q",
  placeholder: "Search",
  openOnFocus: true,
} as const satisfies Pick<
  Required<SearchAutocompleteProps>,
  "size" | "action" | "name" | "placeholder" | "openOnFocus"
>;

interface OptionGroup {
  label?: string;
  items: { option: SearchOption; index: number }[];
}

/** Consecutive options with the same `group` form one listbox group, in order. */
function groupOptions(options: readonly SearchOption[]): OptionGroup[] {
  const groups: OptionGroup[] = [];
  options.forEach((option, index) => {
    const last = groups.at(-1);
    if (last && last.label === option.group) last.items.push({ option, index });
    else groups.push({ label: option.group, items: [{ option, index }] });
  });
  return groups;
}

export function SearchAutocomplete({
  label,
  showLabel = false,
  size = SEARCH_AUTOCOMPLETE_DEFAULTS.size,
  placeholder = SEARCH_AUTOCOMPLETE_DEFAULTS.placeholder,
  options,
  loading = false,
  value: valueProp,
  defaultValue = "",
  onQueryChange,
  onSelect,
  onSubmit,
  action = SEARCH_AUTOCOMPLETE_DEFAULTS.action,
  name = SEARCH_AUTOCOMPLETE_DEFAULTS.name,
  openOnFocus = SEARCH_AUTOCOMPLETE_DEFAULTS.openOnFocus,
  labels: labelOverrides,
  id: idProp,
  className,
}: SearchAutocompleteProps) {
  const labels = { ...SEARCH_AUTOCOMPLETE_LABELS, ...labelOverrides };
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const query = valueProp ?? uncontrolled;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const refs = useMemo(() => [formRef], []);
  function close() {
    setOpen(false);
    setActive(-1);
  }
  useDismiss(refs, open, close);

  const groups = useMemo(() => groupOptions(options), [options]);
  const hasOptions = options.length > 0;
  const expanded = open && hasOptions;
  const showPanel = open && (hasOptions || loading);
  // A stale active index (the options changed) points at nothing.
  const activeIndex = active < options.length ? active : -1;

  function setQuery(next: string) {
    if (valueProp === undefined) setUncontrolled(next);
    onQueryChange?.(next);
  }

  function highlight(index: number) {
    setActive(index);
    requestAnimationFrame(() =>
      document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" }),
    );
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    setQuery(option.label);
    close();
    inputRef.current?.focus();
    if (onSelect) onSelect(option);
    else {
      // Submit with the chosen label once React has written it into the input.
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActive(-1);
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (!hasOptions) return;
        event.preventDefault();
        const down = event.key === "ArrowDown";
        const last = options.length - 1;
        if (!expanded) setOpen(true);
        // APG listbox: no wrap; from no highlight, Down goes to the first and Up to the last.
        if (!expanded || activeIndex === -1) highlight(down ? 0 : last);
        else highlight(down ? Math.min(activeIndex + 1, last) : Math.max(activeIndex - 1, 0));
        return;
      }
      case "Enter":
        if (expanded && activeIndex >= 0) {
          event.preventDefault();
          choose(activeIndex);
        }
        // Otherwise the form submits natively.
        return;
      case "Escape":
        event.preventDefault();
        if (expanded) close();
        else if (query) setQuery("");
        return;
      case "Tab":
        close();
        return;
      default:
        // Home / End / Left / Right keep editing the text (APG); typing reopens the list.
        return;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const trimmed = query.trim();
    if (!trimmed) {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }
    close();
    onSubmit?.(trimmed, event);
  }

  const status = loading
    ? labels.loading
    : expanded
      ? labels.count(options.length)
      : open && query.trim()
        ? labels.empty
        : "";

  return (
    <form
      ref={formRef}
      role="search"
      action={action}
      method="get"
      aria-labelledby={`${id}-label`}
      onSubmit={handleSubmit}
      className={cn("relative", className)}
    >
      <Field id={id} label={label} hideLabel={!showLabel}>
        {(control) => (
          <div className={cn(textInputBoxVariants({ size }), "pr-0")}>
            <input
              {...control}
              ref={inputRef}
              type="text"
              name={name}
              value={query}
              placeholder={placeholder}
              autoComplete="off"
              enterKeyHint="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={listId}
              aria-activedescendant={
                expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined
              }
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={() => openOnFocus && setOpen(true)}
              onClick={() => setOpen(true)}
              className={cn(fieldControlClass, TEXT_INPUT_PADDING_Y[size])}
            />
            <button
              type="submit"
              aria-label={labels.submit}
              className={cn(
                // Figma Text Input [Inner Search]: the search glyph in the accent icon colour.
                "flex shrink-0 cursor-pointer self-stretch rounded-8 text-(--th-input-icon-accent)",
                size === "sm" ? "px-12" : "px-16",
                "relative before:absolute before:inset-x-0 before:-inset-y-4",
              )}
            >
              <Icon name="search" weight={200} tone="current" className="self-center" />
            </button>
          </div>
        )}
      </Field>
      <div
        hidden={!showPanel}
        className={cn(
          "absolute inset-x-0 top-full z-20 max-h-dvh overflow-y-auto overscroll-contain",
          "rounded-overlay bg-surface-raised py-16 shadow-base",
        )}
      >
        {loading && !hasOptions && (
          <div className="flex justify-center p-16">
            <Spinner size="sm" label={null} />
          </div>
        )}
        <div
          id={listId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          aria-busy={loading || undefined}
          hidden={!hasOptions}
        >
          {groups.map((group, groupIndex) =>
            group.label ? (
              <div
                key={`${group.label}-${groupIndex}`}
                role="group"
                aria-labelledby={`${id}-group-${groupIndex}`}
                className="py-20"
              >
                <div
                  id={`${id}-group-${groupIndex}`}
                  role="presentation"
                  className="px-16 py-4 text-label-md text-text-accent uppercase"
                >
                  {group.label}
                </div>
                {group.items.map(renderOption)}
              </div>
            ) : (
              group.items.map(renderOption)
            ),
          )}
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {status}
      </span>
    </form>
  );

  function renderOption({ option, index }: { option: SearchOption; index: number }) {
    return (
      <div
        key={option.value}
        id={optionId(index)}
        role="option"
        aria-selected={index === activeIndex}
        onPointerDown={(event) => event.preventDefault()}
        onPointerMove={() => setActive(index)}
        onClick={() => choose(index)}
        className={cn(
          // The rule is drawn inside the row (Figma: the stroke is inside, rows are 44 tall).
          "relative flex cursor-pointer items-center gap-12 px-16 py-12",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-border-neutral",
          "hover:bg-interactive-subtle-hover aria-selected:bg-interactive-subtle-active",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-title-sm text-text-primary">
          <HighlightMatch text={option.label} query={query} />
        </span>
        {option.icon && <Icon name={option.icon} weight={200} />}
      </div>
    );
  }
}
