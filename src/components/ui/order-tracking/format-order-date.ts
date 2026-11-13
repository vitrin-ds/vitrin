// Order dates and times, formatted with Intl, never concatenated. Shared by
// Card.OrderHistory, OrderTimeline and ShipmentTracking. `timeZone` defaults to the runtime's;
// pass the store's zone on the server so server and client render the same text.

export type OrderDateValue = Date | string;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone ?? ""}|${JSON.stringify(options)}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, { ...options, timeZone });
    formatters.set(key, cached);
  }
  return cached;
}

const toDate = (value: OrderDateValue): Date =>
  typeof value === "string" ? new Date(value) : value;

/** ISO 8601 for `<time dateTime>`. */
export function toIsoString(value: OrderDateValue): string {
  return toDate(value).toISOString();
}

export const ORDER_DATE_STYLES = {
  /** "Oct 27, 2026". */
  date: { dateStyle: "medium" },
  /** "27.10.2026" (Card.OrderHistory, Figma 03.01): day, month, year joined with dots. */
  numeric: { day: "2-digit", month: "2-digit", year: "numeric" },
  /** "10/27/26, 9:14 AM" (OrderTimeline subtitle). */
  dateTime: { dateStyle: "short", timeStyle: "short" },
  /** "09:14" (ShipmentTracking time stamp: a 24-hour clock fits Figma's 32px column). */
  time: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export function formatOrderDate(
  value: OrderDateValue,
  style: keyof typeof ORDER_DATE_STYLES,
  locale = "en",
  timeZone?: string,
): string {
  const format = formatter(locale, ORDER_DATE_STYLES[style], timeZone);
  if (style !== "numeric") return format.format(toDate(value));
  const parts = format.formatToParts(toDate(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return [part("day"), part("month"), part("year")].join(".");
}
