import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { OrderStage } from "@/lib/api/types/orders";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";

// Figma `.Asset.OrderTracking.StatusIcon` (Status) and `.Asset.OrderTracking.Status` (State).
// StatusIcon: a 36px circle with a 1px inside border and a 20px glyph. Done = bg-success,
// border-success, check_circle in icon-success; In Process = surface-accent, border-default, the
// step's glyph in icon-on-accent; Waiting = surface-disabled, the step's glyph in icon-disabled;
// Failed = bg-error, border-error, deployed_code_alert in icon-error.
// Status: fills its container; five equal steps (flex-1, glyph over its centred label, which never
// breaks mid-word) on a 1px border-neutral line from the first to the last circle centre. Height
// follows the content. Figma spaces the steps 4 apart; here each step pads 2 on each side instead,
// so every centre sits at (n + ½) / 5 and the line runs from 1/10 to 9/10 of the width. The State is the current stage: earlier steps are Done; the current one is
// In Process (Done for the first and the last stage, as in Figma); later ones are Waiting.
// Semantics: an ordered list, the current step marked aria-current="step", and every step's status
// is spoken as text, not just colour.

export type OrderTrackingStepStatus = "done" | "in-process" | "waiting" | "failed";

export const orderTrackingStatusIconVariants = cva(
  "relative flex size-36 shrink-0 items-center justify-center rounded-full inset-ring",
  {
    variants: {
      status: {
        done: "bg-bg-success inset-ring-border-success",
        "in-process": "bg-surface-accent inset-ring-border-default",
        // Figma binds the border to icon-disabled (an icon token on a border).
        waiting: "bg-surface-disabled inset-ring-border-disabled",
        failed: "bg-bg-error inset-ring-border-error",
      },
    },
  },
);

const STATUS_ICON = {
  done: { tone: "success", fill: false },
  "in-process": { tone: "on-accent", fill: true },
  waiting: { tone: "disabled", fill: false },
  failed: { tone: "error", fill: true },
} as const;

export interface OrderTrackingStatusIconProps {
  /** Figma `Status`. */
  status: OrderTrackingStepStatus;
  /** The step's glyph, for In Process and Waiting (Done and Failed have their own). */
  icon?: IconName;
  className?: string;
}

/** Figma `.Asset.OrderTracking.StatusIcon`. Decorative: the step's text says its status. */
export function OrderTrackingStatusIcon({
  status,
  icon = "orders",
  className,
}: OrderTrackingStatusIconProps) {
  const glyph: IconName =
    status === "done" ? "check_circle" : status === "failed" ? "deployed_code_alert" : icon;
  return (
    <span aria-hidden className={cn(orderTrackingStatusIconVariants({ status }), className)}>
      <Icon name={glyph} tone={STATUS_ICON[status].tone} fill={STATUS_ICON[status].fill} />
    </span>
  );
}

/** The five stages in order, with Figma's glyph for each. */
export const ORDER_TRACKING_STAGES = [
  { stage: "confirmed", icon: "check_circle" },
  { stage: "processing", icon: "trolley" },
  { stage: "shipped", icon: "delivery_truck_speed" },
  { stage: "in-delivery", icon: "quick_reorder" },
  { stage: "delivered", icon: "check_circle" },
] as const satisfies readonly { stage: OrderStage; icon: IconName }[];

export interface OrderTrackingStatusLabels {
  list: string;
  stages: Record<OrderStage, string>;
  statuses: Record<OrderTrackingStepStatus, string>;
}

export const ORDER_TRACKING_STATUS_LABELS: OrderTrackingStatusLabels = {
  list: "Order progress",
  stages: {
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    "in-delivery": "In Delivery",
    delivered: "Delivered",
  },
  statuses: {
    done: "completed",
    "in-process": "in progress",
    waiting: "not started",
    failed: "problem",
  },
};

/** The status of each step for a current stage (Figma `.Asset.OrderTracking.Status` State). */
export function orderTrackingStepStatuses(
  stage: OrderStage,
  failed = false,
): OrderTrackingStepStatus[] {
  const current = ORDER_TRACKING_STAGES.findIndex((step) => step.stage === stage);
  const last = ORDER_TRACKING_STAGES.length - 1;
  return ORDER_TRACKING_STAGES.map((_, index) => {
    if (index < current) return "done";
    if (index > current) return "waiting";
    if (failed) return "failed";
    return index === 0 || index === last ? "done" : "in-process";
  });
}

export interface OrderTrackingStatusProps {
  /** Figma `State`: the current stage. Progress only moves forward (Figma Don't). */
  stage: OrderStage;
  /** Figma StatusIcon `Failed` on the current step: a delivery problem there. */
  failed?: boolean;
  /** Figma `Step 1–5 Text` (keep the standard five unless the flow differs). */
  labels?: OrderTrackingStatusLabels;
  className?: string;
}

/** Figma `.Asset.OrderTracking.Status`: the five-step progress display. */
export function OrderTrackingStatus({
  stage,
  failed = false,
  labels = ORDER_TRACKING_STATUS_LABELS,
  className,
}: OrderTrackingStatusProps) {
  const statuses = orderTrackingStepStatuses(stage, failed);
  return (
    <ol aria-label={labels.list} className={cn("relative flex w-full", className)}>
      {/* The line runs between the first and last circle centres (half a step in). */}
      <span aria-hidden className="absolute inset-x-1/10 top-18 h-px bg-border-neutral" />
      {ORDER_TRACKING_STAGES.map((step, index) => {
        const status = statuses[index] ?? "waiting";
        return (
          <li
            key={step.stage}
            aria-current={step.stage === stage ? "step" : undefined}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-4 px-2 text-center"
          >
            <OrderTrackingStatusIcon status={status} icon={step.icon} />
            <span className="text-label-sm break-normal hyphens-none text-text-primary">
              {labels.stages[step.stage]}
              <span className="sr-only">, {labels.statuses[status]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
