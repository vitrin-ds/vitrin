"use client";

import { useId } from "react";
import type { Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import {
  RadioCardControl,
  RadioCardGroup,
  useRadioCardChecked,
} from "@/components/base/radio-card/radio-card";
import { Icon } from "@/components/ui/icon/icon";
import { formatDeliveryEstimate, type DeliveryEstimate } from "./delivery-estimate";

// Shipping Method: a checkout page part, not a DS component (removed from the DS on 9 Nov 2026;
// Figma frame 31510:7920, used in
// WD/WT/WM.09.03.* Checkout): a title (headline-large) over the delivery options, gap 12. Each
// option is a Figma `List` (Card variant, 5504:9291): radius 8, 1px border-neutral, padding 16,
// gap 12 — the 20px radio glyph (icon-accent), name (title-small) over the estimate (body-small,
// text-tertiary), gap 2, and the price on the right (label-small, text-accent). Selected draws
// the border in interactive-subtle-active (as in Figma); the glyph carries the state. The list
// is a RadioCardGroup (APG radio group, roving tabindex, the whole row is the radio), so the
// row's name, price and estimate are read as the radio's name.

export interface ShippingOption {
  id: string;
  /** Figma List `Title Text`, e.g. "Standard". */
  name: string;
  /** Figma List `Right Value Text`. An amount of 0 shows the `free` label. */
  price: Money;
  /** Delivery days, formatted with Intl ("Thu 5 – Mon 9 Nov"). */
  estimate?: DeliveryEstimate;
  /** Figma List `Body Text` when there is no estimate or it needs a condition ("Order before 2pm"). */
  description?: string;
  /** Unavailable option: greyed out and not selectable. Figma Don't: never without a reason. */
  unavailableReason?: string;
}

export interface ShippingMethodLabels {
  title: string;
  free: string;
  /** Delivery estimate sentence around the formatted dates. */
  estimate: (dates: string) => string;
}

export const SHIPPING_METHOD_LABELS: ShippingMethodLabels = {
  title: "Delivery method",
  free: "Free",
  estimate: (dates) => `Arrives ${dates}`,
};

export const SHIPPING_METHOD_DEFAULTS = { headingLevel: 2, locale: "en" } as const;

export interface ShippingMethodProps {
  options: readonly ShippingOption[];
  /** The selected option's id. Figma Do: preselect the cheapest or most common option. */
  value: string | undefined;
  onValueChange: (id: string) => void;
  /**
   * Figma `Title`. Leave it out when the surrounding section already has the heading (Checkout
   * Steps); the group is then named by `labels.title`.
   */
  title?: string;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  labels?: ShippingMethodLabels;
  className?: string;
}

export function ShippingMethod({
  options,
  value,
  onValueChange,
  title,
  headingLevel = SHIPPING_METHOD_DEFAULTS.headingLevel,
  locale = SHIPPING_METHOD_DEFAULTS.locale,
  labels = SHIPPING_METHOD_LABELS,
  className,
}: ShippingMethodProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {title && (
        <Heading id={`${id}-title`} className="text-headline-lg text-text-primary">
          {title}
        </Heading>
      )}
      <RadioCardGroup
        value={value}
        onValueChange={onValueChange}
        labelledBy={title ? `${id}-title` : undefined}
        label={title ? undefined : labels.title}
        className="flex flex-col gap-12"
      >
        {options.map((option) => (
          <ShippingOptionRow key={option.id} option={option} locale={locale} labels={labels} />
        ))}
      </RadioCardGroup>
    </div>
  );
}

interface ShippingOptionRowProps {
  option: ShippingOption;
  locale: string;
  labels: ShippingMethodLabels;
}

function ShippingOptionRow({ option, locale, labels }: ShippingOptionRowProps) {
  const id = useId();
  const checked = useRadioCardChecked(option.id);
  const disabled = option.unavailableReason !== undefined;
  const price = option.price.amount === 0 ? labels.free : formatMoney(option.price, locale);
  const details = [
    option.estimate && labels.estimate(formatDeliveryEstimate(option.estimate, locale)),
    option.description,
    option.unavailableReason,
  ].filter((line): line is string => Boolean(line));

  return (
    <div
      className={cn(
        "relative flex items-center gap-12 rounded-card border p-16",
        disabled
          ? "border-border-disabled bg-surface-disabled"
          : checked
            ? "border-interactive-subtle-active bg-surface-primary"
            : "border-border-neutral bg-surface-primary",
      )}
    >
      <RadioCardControl
        value={option.id}
        labelledBy={cn(`${id}-name ${id}-price`, details.length > 0 && `${id}-details`)}
        disabled={disabled}
        badge={false}
        className="rounded-card"
      />
      {/* The row's text is greyed out with the option; aria-disabled exempts it from contrast. */}
      <div className="contents" aria-disabled={disabled || undefined}>
        <Icon
          name={checked ? "radio_button_checked" : "radio_button_unchecked"}
          tone={disabled ? "disabled" : "accent"}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p
            id={`${id}-name`}
            className={cn("text-title-sm", disabled ? "text-text-disabled" : "text-text-primary")}
          >
            {option.name}
          </p>
          {details.length > 0 && (
            <p
              id={`${id}-details`}
              className={cn(
                "flex flex-col text-body-sm",
                disabled ? "text-text-disabled" : "text-text-tertiary",
              )}
            >
              {details.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          )}
        </div>
        <p
          id={`${id}-price`}
          className={cn(
            "shrink-0 text-label-sm tabular-nums",
            disabled ? "text-text-disabled" : "text-text-accent",
          )}
        >
          {price}
        </p>
      </div>
    </div>
  );
}
