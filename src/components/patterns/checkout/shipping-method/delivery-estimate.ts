// Delivery estimates are dates, formatted with Intl (never concatenated): one day
// ("Thu 5 Nov") or a range ("Thu 5 – Mon 9 Nov"). Dates are ISO calendar dates (YYYY-MM-DD)
// and are read and formatted in UTC, so the day never shifts with the reader's time zone.

export interface DeliveryEstimate {
  /** ISO date of the earliest delivery day, e.g. "2026-11-05". */
  earliest: string;
  /** ISO date of the latest delivery day; leave it out for a single day. */
  latest?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string): Intl.DateTimeFormat {
  let cached = formatters.get(locale);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
    formatters.set(locale, cached);
  }
  return cached;
}

function parseIsoDate(value: string): Date {
  if (!ISO_DATE.test(value)) throw new RangeError(`Expected an ISO date (YYYY-MM-DD): ${value}`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid date: ${value}`);
  return date;
}

/** `{ earliest: "2026-11-05", latest: "2026-11-09" }` → "Thu 5 – Mon 9 Nov" (en-GB). */
export function formatDeliveryEstimate(estimate: DeliveryEstimate, locale = "en"): string {
  const start = parseIsoDate(estimate.earliest);
  const f = formatter(locale);
  if (!estimate.latest || estimate.latest === estimate.earliest) return f.format(start);
  const end = parseIsoDate(estimate.latest);
  return end < start ? f.formatRange(end, start) : f.formatRange(start, end);
}
