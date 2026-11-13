import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { OrderStage } from "@/lib/api/types/orders";
import { Button } from "../button/button";
import {
  ORDER_TRACKING_STATUS_LABELS,
  OrderTrackingStatus,
  type OrderTrackingStatusLabels,
} from "./order-tracking-status";

// Figma `OrderTracking` (Main): card (surface-primary, 1px border-neutral, radius 8, padding 20,
// gap 20, centred). Order ID: a pill (surface-secondary, 1px border-default, radius 8, padding
// 12 × 4, gap 8, label-large) with "Order No" in text-accent and the number in text-primary;
// the Alert slot (Card width, for exceptions only); the `.Asset.OrderTracking.Status` progress;
// the Button (Outline, Small, 180 wide) "Shipment Tracking". Figma `Show Order ID` / `Show
// Alert` / `Show Button` are optional slots. The progress shows whenever the order has a stage;
// a cancelled order has none (Figma 03.01.01 P0O8: the Order No and the Alert only). The Button
// is `onTrackShipment` (a button) or `action`, any element in its place (a ButtonLink to the
// tracking page, "Make Payment").

export interface OrderTrackingLabels extends OrderTrackingStatusLabels {
  region: string;
  orderNumber: string;
  trackShipment: string;
}

export const ORDER_TRACKING_LABELS: OrderTrackingLabels = {
  ...ORDER_TRACKING_STATUS_LABELS,
  region: "Order tracking",
  orderNumber: "Order No",
  trackShipment: "Shipment Tracking",
};

export interface OrderTrackingProps {
  /** Figma `Order ID Text`. */
  orderNumber?: string;
  /** Figma `Usage`: the current stage. None: no progress (a cancelled order). */
  stage?: OrderStage;
  /** Figma StatusIcon `Failed` on the current step. Explain it in `alert`. */
  failed?: boolean;
  /** Figma `Alert`: an `<Alert width="card">` for delays or problems, not routine updates. */
  alert?: ReactNode;
  /** Figma `Button`: opens the carrier's tracking (e.g. the Shipment Tracking sheet). */
  onTrackShipment?: () => void;
  /** Figma `Button` as any element, e.g. `<ButtonLink variant="outline" size="sm">`. */
  action?: ReactNode;
  labels?: OrderTrackingLabels;
  className?: string;
}

export function OrderTracking({
  orderNumber,
  stage,
  failed = false,
  alert,
  onTrackShipment,
  action,
  labels = ORDER_TRACKING_LABELS,
  className,
}: OrderTrackingProps) {
  return (
    <section
      aria-label={labels.region}
      className={cn(
        "flex flex-col items-center gap-20 rounded-card bg-surface-primary p-20",
        "inset-ring inset-ring-border-neutral",
        className,
      )}
    >
      {orderNumber && (
        <p className="flex items-center gap-8 rounded-8 bg-surface-secondary px-12 py-4 text-label-lg inset-ring inset-ring-border-default">
          <span className="text-text-accent">{labels.orderNumber}</span>
          <span className="text-text-primary tabular-nums">{orderNumber}</span>
        </p>
      )}
      {alert && <div className="w-full">{alert}</div>}
      {stage && <OrderTrackingStatus stage={stage} failed={failed} labels={labels} />}
      {onTrackShipment && (
        <Button variant="outline" size="sm" onClick={onTrackShipment} className="w-180">
          {labels.trackShipment}
        </Button>
      )}
      {action}
    </section>
  );
}
