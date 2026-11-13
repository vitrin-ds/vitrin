import { cn } from "@/lib/cn";
import type { ShipmentEvent } from "@/lib/api/types/orders";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { formatOrderDate, toIsoString } from "../order-tracking/format-order-date";

// Figma `Shipment (Cargo) Tracking` (`.Asset Shipment Tracking`, stacked): the carrier's scan log.
// Each node: padding 12 on the sides, gap 16; the time stamp (label-small, text-tertiary, 32
// wide, right-aligned), a 23px rail with the 20px glyph (check_circle, icon-accent) and a 1px
// border-neutral connector (none after the last scan), then the title (label-large, text-primary)
// and the details / location (label-small, text-tertiary), padding-bottom 8. Figma Don't: keep
// the time stamp or the details with every title.

export interface ShipmentTrackingItem extends ShipmentEvent {
  /** Figma `Icon`: check_circle for completed scans, another glyph for the one in progress. */
  icon?: IconName;
}

export const SHIPMENT_TRACKING_LABELS = { list: "Shipment tracking" };

export const SHIPMENT_TRACKING_DEFAULTS = { icon: "check_circle", locale: "en" } as const;

export interface ShipmentTrackingProps {
  /** The scans, in the order to show them. */
  events: readonly ShipmentTrackingItem[];
  locale?: string;
  /** IANA zone for the time stamps; defaults to the runtime's. */
  timeZone?: string;
  labels?: typeof SHIPMENT_TRACKING_LABELS;
  /** Figma `Show Time Stamp`. */
  showTimeStamp?: boolean;
  className?: string;
}

export function ShipmentTracking({
  events,
  locale = SHIPMENT_TRACKING_DEFAULTS.locale,
  timeZone,
  labels = SHIPMENT_TRACKING_LABELS,
  showTimeStamp = true,
  className,
}: ShipmentTrackingProps) {
  return (
    <ol aria-label={labels.list} className={cn("flex flex-col", className)}>
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-16 px-12">
          {showTimeStamp && (
            <time
              dateTime={toIsoString(event.occurredAt)}
              className="w-32 shrink-0 text-right text-label-sm text-text-tertiary tabular-nums"
            >
              {formatOrderDate(event.occurredAt, "time", locale, timeZone)}
            </time>
          )}
          <span aria-hidden className="flex w-23 shrink-0 flex-col items-center px-1">
            <Icon name={event.icon ?? SHIPMENT_TRACKING_DEFAULTS.icon} />
            {index < events.length - 1 && <span className="w-px flex-1 bg-border-neutral" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 pb-8">
            <p className="text-label-lg text-text-primary">{event.title}</p>
            {event.location && <p className="text-label-sm text-text-tertiary">{event.location}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
