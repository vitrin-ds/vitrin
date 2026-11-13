"use client";

import { useState, type FormEvent } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { RangeSlider, type RangeValue } from "@/components/ui/range-slider/range-slider";
import { TextInput } from "@/components/ui/text-input/text-input";
import type {
  CheckboxFacet,
  FilterFacet,
  FilterOption,
  FilterSwatch,
  FilterValue,
  PriceFacet,
  SwatchFacet,
} from "./filter-types";
import { formatWholeAmount } from "./filter-format";
import { parseWhole, setFlag, toggleOption } from "./filter-url";

// The controls of one facet, shared by the desktop sidebar and the mobile sheet. On / off facets
// (Only in stock) are a Checkbox, as in Figma. Figma `.Asset.Filter Item` rows (36 tall on
// desktop, 44 on touch below 1024px): Checkbox + optional ColorBox (28px, radius 4, 1px border-neutral)
// + label (label-large) + count (body-medium, text-accent). Options with no results stay visible
// but disabled, with their (0) (Figma Don't: "show options that return zero results without
// marking them"). Price (Figma Filter Section [Price], 31511:9594): the Range Slider (30503:1530)
// over two Small Text Inputs (Min / Max) and a Filled button (Figma DONE), padding 16, gap 16. Slider and inputs edit
// the same draft; nothing applies until the button (or Enter). A thumb at a catalogue bound
// leaves that side open (empty input), so dragging back to the end doesn't add a "From €0" chip.

export interface FilterFacetLabels {
  /** Count after the option label, e.g. "(2,300)". */
  count: (count: number, locale: string) => string;
  priceMin: string;
  priceMax: string;
  /** Range Slider thumb names. */
  priceSliderMin: string;
  priceSliderMax: string;
  priceApply: string;
  priceInvalid: string;
}

export const FILTER_FACET_LABELS: FilterFacetLabels = {
  count: (count, locale) => `(${new Intl.NumberFormat(locale).format(count)})`,
  priceMin: "Min",
  priceMax: "Max",
  priceSliderMin: "Minimum price",
  priceSliderMax: "Maximum price",
  priceApply: "Apply price",
  priceInvalid: "Enter whole amounts, the minimum no higher than the maximum.",
};

export interface FilterFacetProps {
  facet: FilterFacet;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  locale: string;
  labels?: FilterFacetLabels;
}

export function FilterFacetControls({
  facet,
  value,
  onChange,
  locale,
  labels = FILTER_FACET_LABELS,
}: FilterFacetProps) {
  switch (facet.kind) {
    case "toggle":
      return (
        <Checkbox
          name={facet.id}
          label={facet.label}
          checked={value.flags.includes(facet.id)}
          onChange={(event) => onChange(setFlag(value, facet.id, event.currentTarget.checked))}
        />
      );
    case "price":
      return (
        <PriceControls
          // Remount when the applied range changes from outside (chip removed, Clear all).
          key={`${value.price.min}-${value.price.max}`}
          facet={facet}
          value={value}
          onChange={onChange}
          locale={locale}
          labels={labels}
        />
      );
    default:
      return (
        <OptionList
          facet={facet}
          value={value}
          onChange={onChange}
          locale={locale}
          labels={labels}
        />
      );
  }
}

function OptionList({
  facet,
  value,
  onChange,
  locale,
  labels,
}: {
  facet: CheckboxFacet | SwatchFacet;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  locale: string;
  labels: FilterFacetLabels;
}) {
  const chosen = value.selected[facet.id] ?? [];
  return (
    <fieldset>
      <legend className="sr-only">{facet.label}</legend>
      <ul className="flex flex-col">
        {facet.options.map((option) => {
          const checked = chosen.includes(option.value);
          return (
            <li key={option.value} className="flex min-h-44 items-center desktop:min-h-36">
              <Checkbox
                name={facet.id}
                value={option.value}
                checked={checked}
                disabled={option.count === 0 && !checked}
                onChange={() => onChange(toggleOption(value, facet.id, option.value))}
                label={<OptionLabel option={option} locale={locale} labels={labels} />}
              />
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function OptionLabel({
  option,
  locale,
  labels,
}: {
  option: FilterOption;
  locale: string;
  labels: FilterFacetLabels;
}) {
  return (
    <span className="flex items-center gap-8">
      {option.swatch && <Swatch swatch={option.swatch} />}
      <span>{option.label}</span>
      {/* A space for the accessible name ("Aurell (2,300)"); the flex gap does the spacing. */}{" "}
      {option.count !== undefined && (
        <span className="text-body-md text-text-accent">{labels.count(option.count, locale)}</span>
      )}
    </span>
  );
}

/**
 * Figma ColorBox: 28px, radius 4, a 1px border-neutral ring over the swatch. Shade swatches are
 * images (a crop of the product in that shade); a colour swatch is catalogue data, not a design
 * token, so it is drawn as an SVG fill. Decorative: the option's label names it.
 */
function Swatch({ swatch }: { swatch: FilterSwatch }) {
  return (
    <span aria-hidden className="relative flex size-28 shrink-0 overflow-hidden rounded-4">
      {typeof swatch === "string" ? (
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="size-full">
          <rect width="1" height="1" fill={swatch} />
        </svg>
      ) : (
        <NextImage
          src={swatch.src}
          alt=""
          width={swatch.width}
          height={swatch.height}
          sizes="28px"
          className="size-full object-cover"
        />
      )}
      {/* The ring sits above the image, so light shades keep their edge. */}
      <span className="absolute inset-0 rounded-4 inset-ring inset-ring-border-neutral" />
    </span>
  );
}

function PriceControls({
  facet,
  value,
  onChange,
  locale,
  labels,
}: {
  facet: PriceFacet;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  locale: string;
  labels: FilterFacetLabels;
}) {
  const [min, setMin] = useState(value.price.min === null ? "" : String(value.price.min));
  const [max, setMax] = useState(value.price.max === null ? "" : String(value.price.max));
  const [invalid, setInvalid] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMin = parseWhole(min);
    const nextMax = parseWhole(max);
    const bad =
      (min.trim() !== "" && nextMin === null) ||
      (max.trim() !== "" && nextMax === null) ||
      (nextMin !== null && nextMax !== null && nextMin > nextMax);
    setInvalid(bad);
    if (!bad) onChange({ ...value, price: { min: nextMin, max: nextMax } });
  }

  // The slider shows the typed draft; an empty or unreadable side sits at its bound.
  const sliderValue: RangeValue = [parseWhole(min) ?? facet.min, parseWhole(max) ?? facet.max];

  function slide([lo, hi]: RangeValue) {
    setMin(lo <= facet.min ? "" : String(lo));
    setMax(hi >= facet.max ? "" : String(hi));
    setInvalid(false);
  }

  const inputProps = {
    type: "number",
    inputMode: "numeric",
    min: facet.min,
    max: facet.max,
  } as const;

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={facet.label}
      className="flex flex-col gap-16 p-16"
    >
      <RangeSlider
        min={facet.min}
        max={facet.max}
        value={sliderValue}
        onChange={slide}
        formatValue={(amount) => formatWholeAmount(amount, facet.currency, locale)}
        // Figma Filter Section [Price] draws no bound labels: the Min / Max inputs show them.
        showBounds={false}
        density="compact"
        labels={{ min: labels.priceSliderMin, max: labels.priceSliderMax }}
      />
      <div className="grid grid-cols-2 items-start gap-8">
        <TextInput
          {...inputProps}
          size="sm"
          label={labels.priceMin}
          placeholder={String(facet.min)}
          value={min}
          onChange={(event) => setMin(event.currentTarget.value)}
        />
        <TextInput
          {...inputProps}
          size="sm"
          label={labels.priceMax}
          placeholder={String(facet.max)}
          value={max}
          onChange={(event) => setMax(event.currentTarget.value)}
          // One message for the pair, on the field it most often concerns.
          errorText={invalid ? labels.priceInvalid : undefined}
        />
      </div>
      <Button type="submit" className="w-full">
        {labels.priceApply}
      </Button>
    </form>
  );
}
