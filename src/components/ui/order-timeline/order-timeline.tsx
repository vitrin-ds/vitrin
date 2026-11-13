import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label } from "../label/label";
import {
  formatOrderDate,
  toIsoString,
  type OrderDateValue,
} from "../order-tracking/format-order-date";

// Figma `Order Timeline` (Status = First · Mid · Last): the chronological order log. Each node:
// padding 12 × 4, gap 20; a 23px rail with the 20px status glyph (check_circle, icon-accent) and a
// 1px border-neutral connector below it (none on the Last node); then the title (label-large,
// text-primary) with an optional Label (Default, loyalty), the timestamp (label-small,
// text-tertiary) and the `More` slot. First / Mid / Last come from the item's position, so the
// connectors can't be wrong. Upcoming steps use radio_button_unchecked (Figma Do); the step's
// state is also spoken as text.

export interface OrderTimelineItem {
  id: string;
  /** Figma `Title Text`: what happened. */
  title: string;
  /** Figma `Subtitle Text`: when (Figma Don't: never omit it on completed steps). */
  date?: OrderDateValue;
  /** Figma `Label`, e.g. "Express". */
  label?: string;
  /** Completed (check_circle) or upcoming. */
  status?: "done" | "upcoming";
  /** Figma `Left Icon`: overrides the status glyph. */
  icon?: IconName;
  /** Figma `Show Badge`: a Light Badge (e.g. the step number) in place of the glyph. */
  badge?: number;
  /** Figma `More` slot: extra content under the step. */
  details?: ReactNode;
}

export interface OrderTimelineLabels {
  list: string;
  done: string;
  upcoming: string;
}

export const ORDER_TIMELINE_LABELS: OrderTimelineLabels = {
  list: "Order history",
  done: "completed",
  upcoming: "upcoming",
};

export const ORDER_TIMELINE_DEFAULTS = { locale: "en" } as const;

export interface OrderTimelineProps {
  /** Oldest first. */
  items: readonly OrderTimelineItem[];
  locale?: string;
  /** IANA zone for the timestamps; defaults to the runtime's. */
  timeZone?: string;
  labels?: OrderTimelineLabels;
  className?: string;
}

export function OrderTimeline({
  items,
  locale = ORDER_TIMELINE_DEFAULTS.locale,
  timeZone,
  labels = ORDER_TIMELINE_LABELS,
  className,
}: OrderTimelineProps) {
  return (
    <ol aria-label={labels.list} className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const done = (item.status ?? "done") === "done";
        const last = index === items.length - 1;
        return (
          <li key={item.id} className="flex gap-20 px-12 py-4">
            <span aria-hidden className="flex w-23 shrink-0 flex-col items-center px-1">
              {item.badge !== undefined ? (
                <Badge color="light" count={item.badge} />
              ) : (
                <Icon
                  name={item.icon ?? (done ? "check_circle" : "radio_button_unchecked")}
                  fill={done}
                />
              )}
              {!last && <span className="w-px flex-1 bg-border-neutral" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pb-8">
              <p className="flex flex-wrap items-center gap-8">
                <span className="text-label-lg text-text-primary">
                  {item.title}
                  <span className="sr-only">, {done ? labels.done : labels.upcoming}</span>
                </span>
                {item.label && <Label icon="loyalty">{item.label}</Label>}
              </p>
              {item.date && (
                <time
                  dateTime={toIsoString(item.date)}
                  className="text-label-sm text-text-tertiary"
                >
                  {formatOrderDate(item.date, "dateTime", locale, timeZone)}
                </time>
              )}
              {item.details}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
