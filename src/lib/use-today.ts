import { useSyncExternalStore } from "react";

// The viewer's date, read in the browser only. A component that reads the clock while it renders
// gives a prerendered page a date that goes stale, and Next (cacheComponents) refuses to build it.
// So the server render and the render that hydrates it see null, and the next render the date.
// Days don't roll over while a page is open: there is nothing to subscribe to.

const pad = (value: number) => String(value).padStart(2, "0");

/** Today in the viewer's time zone, `YYYY-MM-DD`. A string, so React can compare snapshots. */
export function localToday(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const subscribe = () => () => {};
const onServer = () => null;

/** Today, `YYYY-MM-DD`; null on the server and while hydrating. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => localToday(), onServer);
}

/** `YYYY-MM-DD` as local midnight, for day counts in the viewer's calendar. */
export const isoToLocalDate = (iso: string): Date => {
  const [year = 1970, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** `YYYY-MM-DD` as midnight UTC, for date maths that works in UTC (card expiry months). */
export const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00Z`);
