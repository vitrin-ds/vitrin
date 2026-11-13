import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Alert } from "../alert/alert";
import { OrderTracking, type OrderTrackingProps } from "./order-tracking";
import { OrderTrackingStatus, OrderTrackingStatusIcon } from "./order-tracking-status";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  showButton: boolean;
  showOrderId: boolean;
  orderIdText: string;
  showOrderTracking: boolean;
  showAlert: boolean;
  /** The nested `.Asset.OrderTracking.Status` State: not a property of OrderTracking. */
  stage: OrderTrackingProps["stage"];
  /** The nested StatusIcon `Failed` on the current step. */
  failed: boolean;
};

const noop = () => undefined;

const meta = {
  title: "Patterns/Order Management/Order Tracking/Order Tracking",
  // The defaults of Figma's `OrderTracking` (its nested Status is at Confirmed).
  args: {
    showButton: true,
    showOrderId: true,
    orderIdText: "2752618130577",
    showOrderTracking: true,
    showAlert: true,
    stage: "confirmed",
    failed: false,
  },
  render: ({
    showButton,
    showOrderId,
    orderIdText,
    showOrderTracking,
    showAlert,
    stage,
    failed,
  }) => (
    <OrderTracking
      orderNumber={showOrderId ? orderIdText : undefined}
      stage={showOrderTracking ? stage : undefined}
      failed={failed}
      alert={
        showAlert ? (
          <Alert usage="informative" width="card">
            Your payment is being verified. This can take up to one working day.
          </Alert>
        ) : undefined
      }
      onTrackShipment={showButton ? noop : undefined}
    />
  ),
  parameters: {
    controls: {
      include: ["showButton", "showOrderId", "orderIdText", "showOrderTracking", "showAlert"],
    },
    figma: {
      architecture: "Asset → Main Architecture",
      do: [
        "Set Usage to the correct current stage — completed steps should visually differ from upcoming ones",
        "Use the Failed status on StatusIcon to indicate delivery problems at a specific step",
        "Show Order ID for easy reference and customer support scenarios",
        "Use Alert to communicate delivery exceptions, delays, or special instructions",
      ],
      dont: [
        "Don't modify step labels unless the fulfillment flow genuinely differs from the standard 5-step process",
        "Don't hide Order Tracking — it's the core purpose of this component",
        "Don't show Alert for routine updates — reserve it for actionable or exceptional situations",
        "Don't skip stages in the Usage sequence — progress should always move forward linearly",
      ],
    },
    docs: {
      description: {
        component:
          "A step-based order tracking component that visualizes the delivery progress through sequential status stages, with optional order ID, alert messaging, and an action button.",
      },
    },
  },
  argTypes: {
    showButton: {
      description: "Figma `Show Button`. In code: pass `onTrackShipment` (or `action`).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showOrderId: {
      description: "Figma `Show Order ID`. In code: pass `orderNumber`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    orderIdText: {
      description: "Figma `Order ID Text`. In code: `orderNumber`.",
      control: "text",
      if: { arg: "showOrderId" },
      table: { type: { summary: "string" }, defaultValue: { summary: "2752618130577" } },
    },
    showOrderTracking: {
      description: "Figma `Show Order Tracking`. In code: pass `stage` (none: no progress).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showAlert: {
      description: "Figma `Show Alert`. In code: pass `alert`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `OrderTracking`: order number, progress and the Shipment Tracking button. */
export const Default: Story = {
  args: { stage: "shipped", showAlert: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getAllByRole("listitem").find((li) => li.ariaCurrent === "step");
    await expect(current).toHaveTextContent("Shipped, in progress");
  },
};

/** A problem at the current step: Failed status icon plus an Alert that explains it. */
export const WithAlert: Story = {
  args: { stage: "processing", failed: true, showAlert: true },
};

/** Figma Order Details: Shipment Tracking under the progress while the order is on its way. */
export const WithAction: Story = {
  args: { stage: "shipped", showAlert: false, showButton: true },
};

/** Figma `.Asset.OrderTracking.Status`: every State (current stage). */
export const Stages: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-20">
      {(["confirmed", "processing", "shipped", "in-delivery", "delivered"] as const).map(
        (stage) => (
          <OrderTrackingStatus key={stage} stage={stage} />
        ),
      )}
    </div>
  ),
};

/** Figma `.Asset.OrderTracking.StatusIcon`: Done · In Process · Waiting · Failed. */
export const StatusIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-16">
      <OrderTrackingStatusIcon status="done" />
      <OrderTrackingStatusIcon status="in-process" />
      <OrderTrackingStatusIcon status="waiting" icon="check_circle" />
      <OrderTrackingStatusIcon status="failed" />
    </div>
  ),
};
