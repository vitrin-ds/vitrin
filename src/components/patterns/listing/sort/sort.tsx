"use client";

import { useId, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { Button } from "@/components/ui/button/button";
import { Dropdown } from "@/components/ui/dropdown/dropdown";
import { Radio, RadioGroup } from "@/components/ui/radio/radio";
import { DEFAULT_SORT, SORT_KEYS, type SortKey } from "./sort-url";

// Sort (listing page part; not a DS component). Desktop (31511:13392): a text trigger in the list header
// ("Sort: Relevance" + keyboard_arrow_down, 31511:13429) with a menu of Dropdown Items below it
// (check_circle on the current one); here the Dropdown `variant="text"` (APG select-only
// combobox, named "Sort: Relevance"), which closes on selection.
// Mobile (31511:15164): an Outline button opens a Bottom Sheet (Half) of radio options with
// Reset (Outline) + Apply (Filled); the choice is a draft until Apply.

export interface SortLabels {
  /** Name of the menu and the mobile sheet title. */
  label: string;
  /** Desktop text trigger prefix, before the current sort ("Sort:" → "Sort: Relevance"). */
  prefix: string;
  /** Mobile trigger, e.g. "Sort: Relevance". */
  trigger: (current: string) => string;
  reset: string;
  apply: string;
  options: Record<SortKey, string>;
}

export const SORT_LABELS: SortLabels = {
  label: "Sort by",
  prefix: "Sort:",
  trigger: (current) => `Sort: ${current}`,
  reset: "Reset",
  apply: "Apply",
  options: {
    relevance: "Relevance",
    newest: "Newest",
    "best-sellers": "Best sellers",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    discount: "Discount",
    "top-rated": "Top rated",
  },
};

/** Figma Don't: "offer more than 7 options". */
export const SORT_MAX_OPTIONS = 7;

export const SORT_DEFAULTS = { options: SORT_KEYS } as const;

export interface SortProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
  /** The keys on offer, in menu order (at most 7). */
  options?: readonly SortKey[];
  labels?: SortLabels;
  className?: string;
}

export function Sort({
  value,
  onChange,
  options = SORT_DEFAULTS.options,
  labels = SORT_LABELS,
  className,
}: SortProps) {
  const [open, setOpen] = useState(false);
  const offered = options.slice(0, SORT_MAX_OPTIONS);

  return (
    <div className={className}>
      <Dropdown
        variant="text"
        label={labels.prefix}
        options={offered.map((key) => ({ value: key, label: labels.options[key] }))}
        value={value}
        onValueChange={(next) => onChange(next as SortKey)}
        className="hidden desktop:inline-flex"
      />
      <div className="desktop:hidden">
        <Button
          variant="outline"
          leftIcon="swap_vert"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          {labels.trigger(labels.options[value])}
        </Button>
        <SortSheet
          open={open}
          onClose={() => setOpen(false)}
          value={value}
          onApply={onChange}
          options={offered}
          labels={labels}
        />
      </div>
    </div>
  );
}

export interface SortSheetProps {
  open: boolean;
  onClose: () => void;
  value: SortKey;
  /** Apply: the chosen key; the sheet closes. */
  onApply: (value: SortKey) => void;
  options?: readonly SortKey[];
  labels?: SortLabels;
}

export function SortSheet({
  open,
  onClose,
  value,
  onApply,
  options = SORT_DEFAULTS.options,
  labels = SORT_LABELS,
}: SortSheetProps) {
  const name = useId();
  const [draft, setDraft] = useState(value);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={labels.label}
      footer={
        <div className="flex gap-8">
          <Button variant="outline" onClick={() => setDraft(DEFAULT_SORT)}>
            {labels.reset}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            {labels.apply}
          </Button>
        </div>
      }
    >
      <div className="px-16 py-16">
        <RadioGroup legend={<span className="sr-only">{labels.label}</span>}>
          {options.map((key) => (
            <Radio
              key={key}
              name={name}
              value={key}
              label={labels.options[key]}
              checked={draft === key}
              onChange={() => setDraft(key)}
            />
          ))}
        </RadioGroup>
      </div>
    </BottomSheet>
  );
}
