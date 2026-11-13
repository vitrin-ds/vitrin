"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { useToday } from "@/lib/use-today";
import { Dropdown } from "../dropdown/dropdown";

// Figma `Date Picker` (30506:799): a monthly grid for one date, 280 wide, padding 16, gap 4, radius
// 8, raised. `Year & Month` (32, Dropdown Item lists), `Day Labels` (48, text-accent), `Day Table`
// (212: always six rows, so the panel keeps its height), `Actions` (top padding 6, gap 20,
// text-accent). Day cell 32, radius 8, label-large. Figma `Day Selection State`: Default is the
// selected day (interactive-active, text-inverse); Hover a 1px interactive-hover ring; Active the
// pressed day (surface-secondary + interactive-active ring); Disabled text-disabled. Today carries
// the Hover ring (Figma Do: "Highlight today's date"), keyboard focus looks like Hover.
//
// Dates are `YYYY-MM-DD` strings, what <input type="date"> gives, so no time zone can shift a day.
// APG date grid: one Tab stop in the grid, arrows move by day / week, Home / End to the week's
// edges, PageUp / PageDown by month (+ Shift by year). Disabled days stay reachable by keyboard but
// can't be chosen.
//
// Today is the viewer's date, read in the browser (useToday): a prerendered page never carries a
// stale one. Until it is known, and with no value to show, the panel keeps its size and draws no
// days.

export interface DatePickerLabels {
  year: string;
  month: string;
  /** Figma `Left Action Text`. */
  cancel: string;
  /** Figma `Right Action Text`. */
  ok: string;
}

export const DATE_PICKER_LABELS: DatePickerLabels = {
  year: "Year",
  month: "Month",
  cancel: "Cancel",
  ok: "OK",
};

export const DATE_PICKER_DEFAULTS = {
  showYear: true,
  showMonth: true,
  locale: "en",
} as const;

export interface DatePickerProps {
  /** Selected date, `YYYY-MM-DD`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Earliest day that can be chosen; also the first year in the list. */
  min?: string;
  /** Latest day that can be chosen; also the last year in the list. */
  max?: string;
  /** Any other day that can't be chosen. */
  isDateDisabled?: (date: string) => boolean;
  /** Figma `Show Year`. */
  showYear?: boolean;
  /** Figma `Show Month`. */
  showMonth?: boolean;
  /** Figma `Show Left Action`: shown when given. */
  onCancel?: () => void;
  /** Figma `Show Right Action`: shown when given. */
  onConfirm?: (value: string | null) => void;
  /** Today, `YYYY-MM-DD`; defaults to the viewer's date. */
  today?: string;
  /** Names the grid for screen readers. */
  "aria-label"?: string;
  locale?: string;
  labels?: DatePickerLabels;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};
const parts = (iso: string) => {
  const [year = 1970, month = 1, day = 1] = iso.split("-").map(Number);
  return { year, month: month - 1, day };
};
const addDays = (iso: string, days: number) => {
  const { year, month, day } = parts(iso);
  return toIso(year, month, day + days);
};
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
/** The same day `months` away, or that month's last day. */
const addMonths = (iso: string, months: number) => {
  const { year, month, day } = parts(iso);
  const first = parts(toIso(year, month + months, 1));
  return toIso(first.year, first.month, Math.min(day, daysIn(first.year, first.month)));
};
const utc = (iso: string) => {
  const { year, month, day } = parts(iso);
  return new Date(Date.UTC(year, month, day));
};

/** Years offered around today when `min` / `max` don't say. */
const YEARS_BACK = 100;
const YEARS_AHEAD = 10;
const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];
const ROWS = [0, 1, 2, 3, 4, 5];
/** 4 January 1970 was a Sunday: the Figma week starts on Sunday. */
const weekDay = (index: number) => new Date(Date.UTC(1970, 0, 4 + index));

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateDisabled,
  showYear = DATE_PICKER_DEFAULTS.showYear,
  showMonth = DATE_PICKER_DEFAULTS.showMonth,
  onCancel,
  onConfirm,
  today: todayProp,
  "aria-label": ariaLabel,
  locale = DATE_PICKER_DEFAULTS.locale,
  labels = DATE_PICKER_LABELS,
  className,
}: DatePickerProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : uncontrolled;
  const viewerToday = useToday();
  const today = todayProp ?? viewerToday;
  // The one day in the Tab order; its month is the month on show (Figma Do: current month first).
  // Until the user moves it, it follows the value, then today.
  const [movedCursor, setCursor] = useState<string | null>(null);
  const cursor = movedCursor ?? value ?? today;
  const moveFocus = useRef(false);
  const cursorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    cursorRef.current?.focus();
  }, [cursor]);

  if (cursor === null) return <DatePickerFrame className={className} />;

  const { year, month } = parts(cursor);
  const disabledDay = (date: string) =>
    (min !== undefined && date < min) ||
    (max !== undefined && date > max) ||
    (isDateDisabled?.(date) ?? false);

  const clamp = (date: string) => {
    if (min !== undefined && date < min) return min;
    if (max !== undefined && date > max) return max;
    return date;
  };

  const choose = (date: string) => {
    if (disabledDay(date)) return;
    setCursor(date);
    if (valueProp === undefined) setUncontrolled(date);
    onValueChange?.(date);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const weekIndex = utc(cursor).getUTCDay();
    const next = {
      ArrowLeft: addDays(cursor, -1),
      ArrowRight: addDays(cursor, 1),
      ArrowUp: addDays(cursor, -7),
      ArrowDown: addDays(cursor, 7),
      Home: addDays(cursor, -weekIndex),
      End: addDays(cursor, 6 - weekIndex),
      PageUp: addMonths(cursor, event.shiftKey ? -12 : -1),
      PageDown: addMonths(cursor, event.shiftKey ? 12 : 1),
    }[event.key];
    if (!next) return;
    event.preventDefault();
    moveFocus.current = true;
    setCursor(clamp(next));
  };

  const around = parts(today ?? cursor).year;
  const firstYear = min ? parts(min).year : around - YEARS_BACK;
  const lastYear = max ? parts(max).year : around + YEARS_AHEAD;
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => String(lastYear - i));
  const monthName = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: monthName.format(new Date(Date.UTC(2026, i, 1))),
  }));
  const narrowDay = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
  const longDay = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" });
  const monthYear = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const total = daysIn(year, month);
  const dayAt = (row: number, column: number) => {
    const day = row * 7 + column - offset + 1;
    return day >= 1 && day <= total ? toIso(year, month, day) : null;
  };

  const actionClass =
    "relative cursor-pointer rounded-4 text-label-lg text-text-accent before:absolute before:-inset-12";

  return (
    <div
      data-date-picker
      className={cn(
        "flex w-280 flex-col gap-4 rounded-overlay bg-surface-raised p-16 shadow-md",
        className,
      )}
    >
      {(showYear || showMonth) && (
        <div className="flex h-32 items-center justify-between gap-20">
          {showYear && (
            <Dropdown
              variant="plain"
              menuAlign="start"
              label={labels.year}
              options={years.map((item) => ({ value: item, label: item }))}
              value={String(year)}
              onValueChange={(item) => setCursor(clamp(toIso(Number(item), month, 1)))}
            />
          )}
          {showMonth && (
            <Dropdown
              variant="plain"
              label={labels.month}
              className="ml-auto"
              options={months}
              value={String(month)}
              onValueChange={(item) => setCursor(clamp(toIso(year, Number(item), 1)))}
            />
          )}
        </div>
      )}

      <div
        role="grid"
        aria-label={ariaLabel ?? monthYear.format(new Date(Date.UTC(year, month, 1)))}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-4"
      >
        <div role="row" className="flex gap-4 py-8">
          {WEEK_DAYS.map((index) => (
            <span
              key={index}
              role="columnheader"
              aria-label={longDay.format(weekDay(index))}
              className="flex size-32 items-center justify-center text-label-lg text-text-accent"
            >
              {narrowDay.format(weekDay(index))}
            </span>
          ))}
        </div>
        <div role="rowgroup" className="flex h-212 flex-col gap-4">
          {ROWS.map((row) => (
            <div key={row} role="row" className="flex gap-4">
              {WEEK_DAYS.map((column) => {
                const date = dayAt(row, column);
                if (!date) return <span key={column} role="gridcell" className="size-32" />;
                const selected = date === value;
                const disabled = disabledDay(date);
                return (
                  <span key={column} role="gridcell" aria-selected={selected}>
                    <button
                      ref={date === cursor ? cursorRef : undefined}
                      type="button"
                      tabIndex={date === cursor ? 0 : -1}
                      aria-label={fullDate.format(utc(date))}
                      aria-current={date === today ? "date" : undefined}
                      aria-disabled={disabled || undefined}
                      onClick={() => choose(date)}
                      className={cn(
                        "flex size-32 items-center justify-center rounded-control text-label-lg outline-none",
                        disabled
                          ? "cursor-not-allowed text-text-disabled"
                          : selected
                            ? "cursor-pointer bg-interactive-active text-text-inverse"
                            : [
                                "cursor-pointer text-text-primary",
                                "hover:inset-ring hover:inset-ring-interactive-hover",
                                "focus-visible:inset-ring focus-visible:inset-ring-interactive-hover",
                                "active:bg-surface-secondary active:inset-ring active:inset-ring-interactive-active",
                                date === today && "inset-ring inset-ring-interactive-hover",
                              ],
                      )}
                    >
                      {parts(date).day}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {(onCancel || onConfirm) && (
        <div className="flex items-center justify-end gap-20 pt-6">
          {onCancel && (
            <button type="button" onClick={onCancel} className={actionClass}>
              {labels.cancel}
            </button>
          )}
          {onConfirm && (
            <button type="button" onClick={() => onConfirm(value)} className={actionClass}>
              {labels.ok}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** The panel at its full size, with no days: what renders before today is known. */
function DatePickerFrame({ className }: { className?: string }) {
  return (
    <div
      data-date-picker
      aria-busy="true"
      className={cn(
        "flex w-280 flex-col gap-4 rounded-overlay bg-surface-raised p-16 shadow-md",
        className,
      )}
    >
      <div className="h-32" />
      <div className="h-48" />
      <div className="h-212" />
    </div>
  );
}
