import { cva } from "class-variance-authority";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { Chip } from "../chip/chip";

// Figma `OpeningHours` (single layer, with `.OpeningHours.Row` Type Default / Today): a flat card
// (radius 16, padding 24, 1px border-default, gap 4) with the title (title-medium; Figma's 8px
// Spacer becomes margin, 16 in all to the first row), one row per weekday and the optional
// holiday note (`Show Note`, body-small text-tertiary). Rows are a description list: weekday (dt) → hours (dd). Default: padding
// 12 × 8, body-medium text-secondary. Today: surface-secondary, title-small text-primary and the
// "Today" chip (Chip Primary), so today is marked by text, not colour alone. Weekdays and 24h
// times are formatted with Intl; a day without hours reads "Closed" (Figma Do).

export type Weekday =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export const WEEKDAYS: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const openingHoursRowVariants = cva("flex items-center gap-8 rounded-8 px-12 py-8", {
  variants: {
    type: {
      default: "text-body-md text-text-secondary",
      today: "bg-surface-secondary text-title-sm text-text-primary",
    },
  },
});

export interface OpeningHoursLabels {
  title: string;
  today: string;
  closed: string;
  /** "09:00 – 20:00" (Figma Do: 24-hour times with an en dash). */
  range: (opens: string, closes: string) => string;
}

export const OPENING_HOURS_LABELS: OpeningHoursLabels = {
  title: "Opening hours",
  today: "Today",
  closed: "Closed",
  range: (opens, closes) => `${opens} – ${closes}`,
};

export const OPENING_HOURS_DEFAULTS = { headingLevel: 2, locale: "en-GB" } as const;

export interface OpeningHoursRowProps {
  /** Figma `Day Text`. */
  day: string;
  /** Figma `Hours Text`, e.g. "09:00 – 20:00" or "Closed". */
  hours: string;
  /** Figma `Type`. */
  type?: "default" | "today";
  /** Text of the Today chip. */
  todayLabel?: string;
}

/** Figma `.OpeningHours.Row`: one dt/dd pair; render it inside a `<dl>`. */
export function OpeningHoursRow({
  day,
  hours,
  type = "default",
  todayLabel = OPENING_HOURS_LABELS.today,
}: OpeningHoursRowProps) {
  return (
    <div className={openingHoursRowVariants({ type })}>
      <dt className="flex min-w-0 flex-1 items-center gap-8">
        <span className="min-w-0 flex-1">{day}</span>
        {type === "today" && <Chip color="primary">{todayLabel}</Chip>}
      </dt>
      <dd className="shrink-0 whitespace-nowrap">{hours}</dd>
    </div>
  );
}

export interface OpeningHoursDay {
  day: Weekday;
  /** "HH:MM" (24h). Leave out both for a closed day. */
  opens?: string;
  closes?: string;
}

// 1 January 2024 was a Monday: a fixed week to name weekdays with Intl.
const REFERENCE_MONDAY = { year: 2024, month: 0, date: 1 };

function weekdayName(day: Weekday, locale: string): string {
  const { year, month, date } = REFERENCE_MONDAY;
  const reference = new Date(year, month, date + WEEKDAYS.indexOf(day));
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(reference);
}

function formatTime(time: string, locale: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const { year, month, date } = REFERENCE_MONDAY;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(year, month, date, hours, minutes));
}

export interface OpeningHoursProps {
  /** The week, Monday first. */
  days: readonly OpeningHoursDay[];
  /** Figma `Row › Type=Today`: exactly one day (Figma Do). */
  today?: Weekday;
  /** Figma `Note Text` (`Show Note`): holiday exceptions. */
  note?: string;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  /** `title` is the Figma `Title Text`. */
  labels?: OpeningHoursLabels;
  className?: string;
}

export function OpeningHours({
  days,
  today,
  note,
  headingLevel = OPENING_HOURS_DEFAULTS.headingLevel,
  locale = OPENING_HOURS_DEFAULTS.locale,
  labels = OPENING_HOURS_LABELS,
  className,
}: OpeningHoursProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        "flex flex-col gap-4 rounded-surface p-24 inset-ring inset-ring-border-default",
        className,
      )}
    >
      <Heading id={`${id}-title`} className="mb-12 text-title-md text-text-primary">
        {labels.title}
      </Heading>
      <dl className="flex flex-col gap-4">
        {days.map(({ day, opens, closes }) => (
          <OpeningHoursRow
            key={day}
            day={weekdayName(day, locale)}
            hours={
              opens && closes
                ? labels.range(formatTime(opens, locale), formatTime(closes, locale))
                : labels.closed
            }
            type={day === today ? "today" : "default"}
            todayLabel={labels.today}
          />
        ))}
      </dl>
      {note && <p className="text-body-sm text-text-tertiary">{note}</p>}
    </section>
  );
}
