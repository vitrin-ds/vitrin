"use client";

import { cva } from "class-variance-authority";
import { isoToLocalDate, useToday } from "@/lib/use-today";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { RadioCardControl, useRadioCardChecked } from "@/components/base/radio-card/radio-card";
import { ButtonLink } from "../../button/button";
import { Chip } from "../../chip/chip";
import { Skeleton } from "../../skeleton/skeleton";
import { StatusDot } from "../../status-dot/status-dot";

// Figma `Card.Feature.Store` (State × Status) on `.Base.Card.Store`: a flat card (radius 16, padding 20,
// gap 12, 1px border-default) with the title row (24px number badge on surface-accent matching
// the map pin, the store name in title-small, the distance in label-small text-secondary), the
// address (body-small text-secondary), the opening status (8px Status Dot + label-small text in
// the status colour, so it never relies on colour alone), up to three service chips (Chip Light)
// and the actions: Store details (Outline) and Directions (Ghost). Figma `Show Number` / `Show
// Distance` / `Show Services` / `Show Actions` are the optional props. Selected (the map pin is
// active) only exists inside a RadioCardGroup: surface-secondary, a 2px border-accent on ::after
// (no layout shift), Store details turns Filled and Directions Outline; no corner badge (Figma
// draws none). The status text is built from `nextChange` with Intl (24h times, "tomorrow").
// Pending status (`status` left out): a text Skeleton in the status row, for pages that only know
// "now" in the browser (Store Finder), so the card keeps its height until the status arrives.

export const cardFeatureStoreVariants = cva(
  "relative flex flex-col gap-12 rounded-surface p-20 after:pointer-events-none after:absolute after:inset-0 after:rounded-surface",
  {
    variants: {
      selected: {
        true: "bg-surface-secondary after:border-2 after:border-border-accent",
        false: "bg-surface-primary after:border after:border-border-default",
      },
    },
  },
);

export type CardFeatureStoreStatus = "open" | "closing-soon" | "closed";

const STATUS = {
  open: { dot: "success", text: "text-text-success" },
  "closing-soon": { dot: "warning", text: "text-text-warning" },
  closed: { dot: "error", text: "text-text-error" },
} as const;

export interface CardFeatureStoreLabels {
  open: string;
  closingSoon: string;
  closed: string;
  /** "Open · until 20:00". */
  openUntil: (time: string) => string;
  /** "Closes soon · 18:30". */
  closesAt: (time: string) => string;
  /** "Closed · opens 10:00 tomorrow"; `day` is empty when it opens later today. */
  opensAt: (time: string, day: string) => string;
  services: string;
  details: string;
  directions: string;
  detailsFor: (name: string) => string;
  directionsFor: (name: string) => string;
}

export const CARD_FEATURE_STORE_LABELS: CardFeatureStoreLabels = {
  open: "Open",
  closingSoon: "Closes soon",
  closed: "Closed",
  openUntil: (time) => `Open · until ${time}`,
  closesAt: (time) => `Closes soon · ${time}`,
  opensAt: (time, day) => (day ? `Closed · opens ${time} ${day}` : `Closed · opens ${time}`),
  services: "Services",
  details: "Store details",
  directions: "Directions",
  detailsFor: (name) => `Store details, ${name}`,
  directionsFor: (name) => `Directions to ${name}`,
};

export const CARD_FEATURE_STORE_DEFAULTS = {
  distanceUnit: "kilometer",
  headingLevel: 3,
  locale: "en-GB",
} as const;

/** Figma Don't: more than three service chips. */
export const CARD_FEATURE_STORE_MAX_SERVICES = 3;

const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * "", "tomorrow" or the weekday, relative to `now` (Intl, so it follows the locale). Without
 * `now` (rendering on the server), the weekday.
 */
function relativeDay(next: Date, now: Date | undefined, locale: string): string {
  if (!now) return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(next);
  const days = Math.round((startOfDay(next) - startOfDay(now)) / DAY_MS);
  if (days <= 0) return "";
  if (days === 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(1, "day");
  }
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(next);
}

export function formatStoreStatus(
  status: CardFeatureStoreStatus,
  labels: CardFeatureStoreLabels,
  locale: string,
  nextChange?: Date,
  now?: Date,
): string {
  if (!nextChange) {
    return { open: labels.open, "closing-soon": labels.closingSoon, closed: labels.closed }[status];
  }
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(nextChange);
  if (status === "open") return labels.openUntil(time);
  if (status === "closing-soon") return labels.closesAt(time);
  return labels.opensAt(time, relativeDay(nextChange, now, locale));
}

export interface CardFeatureStoreProps {
  /** Value in a RadioCardGroup (Store Finder list synced with the map pins). */
  value?: string;
  /** Figma `Number Text`: the map pin label. Leave out to hide the badge (`Show Number`). */
  number?: number;
  /** Figma `Name Text`. */
  name: string;
  /** Figma `Distance Text`, as a number in `distanceUnit` (formatted with Intl). */
  distance?: number;
  distanceUnit?: "kilometer" | "mile";
  /** Figma `Address Text`: the full street address. */
  address: string;
  /** Figma `Status`. Leave out while it is still being computed: a skeleton holds the row. */
  status?: CardFeatureStoreStatus;
  /** When the status next changes (closing or opening time): becomes the Figma `Status Text`. */
  nextChange?: Date;
  /** Reference time for "tomorrow"; defaults to the viewer's date, read in the browser. */
  now?: Date;
  /** Figma `Services` chips; at most three are shown. */
  services?: readonly string[];
  /** Figma `Store details` button (a link to the store page). */
  detailsHref?: string;
  /** Figma `Directions` button (a link to a maps provider). */
  directionsHref?: string;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  labels?: CardFeatureStoreLabels;
  className?: string;
}

export function CardFeatureStore({
  value,
  number,
  name,
  distance,
  distanceUnit = CARD_FEATURE_STORE_DEFAULTS.distanceUnit,
  address,
  status,
  nextChange,
  now,
  services = [],
  detailsHref,
  directionsHref,
  headingLevel = CARD_FEATURE_STORE_DEFAULTS.headingLevel,
  locale = CARD_FEATURE_STORE_DEFAULTS.locale,
  labels = CARD_FEATURE_STORE_LABELS,
  className,
}: CardFeatureStoreProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const selected = useRadioCardChecked(value);
  const shownServices = services.slice(0, CARD_FEATURE_STORE_MAX_SERVICES);
  // Today comes from the browser (useToday): the server render reads no clock.
  const today = useToday();
  const reference = now ?? (today ? isoToLocalDate(today) : undefined);
  const statusText = status && formatStoreStatus(status, labels, locale, nextChange, reference);

  return (
    <article
      aria-labelledby={`${id}-name`}
      className={cn(cardFeatureStoreVariants({ selected }), className)}
    >
      <RadioCardControl
        value={value}
        labelledBy={`${id}-name`}
        badge={false}
        className="rounded-surface"
      />

      <div className="flex items-center gap-8">
        {number !== undefined && (
          <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-surface-accent text-label-sm text-text-on-accent">
            {number}
          </span>
        )}
        <Heading id={`${id}-name`} className="min-w-0 flex-1 text-title-sm text-text-primary">
          {name}
        </Heading>
        {distance !== undefined && (
          <p className="shrink-0 text-label-sm text-text-secondary">
            {new Intl.NumberFormat(locale, {
              style: "unit",
              unit: distanceUnit,
              maximumFractionDigits: 1,
            }).format(distance)}
          </p>
        )}
      </div>

      <address className="text-body-sm text-text-secondary not-italic">{address}</address>

      {status ? (
        <p className={cn("flex items-center gap-8 text-label-sm", STATUS[status].text)}>
          <StatusDot status={STATUS[status].dot} size="md" label={null} />
          {statusText}
        </p>
      ) : (
        <p className="flex text-label-sm">
          <Skeleton shape="text" className="w-120" />
        </p>
      )}

      {shownServices.length > 0 && (
        <ul aria-label={labels.services} className="flex flex-wrap gap-4">
          {shownServices.map((service) => (
            <li key={service} className="flex">
              <Chip color="light">{service}</Chip>
            </li>
          ))}
        </ul>
      )}

      {(detailsHref || directionsHref) && (
        <div className="flex flex-wrap gap-8">
          {detailsHref && (
            <ButtonLink
              href={detailsHref}
              aria-label={labels.detailsFor(name)}
              variant={selected ? "filled" : "outline"}
            >
              {labels.details}
            </ButtonLink>
          )}
          {directionsHref && (
            <ButtonLink
              href={directionsHref}
              aria-label={labels.directionsFor(name)}
              variant={selected ? "outline" : "ghost"}
            >
              {labels.directions}
            </ButtonLink>
          )}
        </div>
      )}
    </article>
  );
}
