import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Alert } from "../alert/alert";
import { formatOrderDate } from "./format-order-date";
import { OrderTracking } from "./order-tracking";
import { orderTrackingStepStatuses } from "./order-tracking-status";

describe("orderTrackingStepStatuses", () => {
  it("follows Figma's States: done before, in process at, waiting after the stage", () => {
    expect(orderTrackingStepStatuses("confirmed")).toEqual([
      "done",
      "waiting",
      "waiting",
      "waiting",
      "waiting",
    ]);
    expect(orderTrackingStepStatuses("shipped")).toEqual([
      "done",
      "done",
      "in-process",
      "waiting",
      "waiting",
    ]);
    expect(orderTrackingStepStatuses("delivered")).toEqual(Array(5).fill("done"));
    expect(orderTrackingStepStatuses("processing", true)[1]).toBe("failed");
  });
});

describe("OrderTracking", () => {
  it("is an ordered list with the current step marked and statuses as text", async () => {
    const onTrackShipment = vi.fn();
    const { container } = render(
      <OrderTracking
        orderNumber="2752618130577"
        stage="in-delivery"
        onTrackShipment={onTrackShipment}
      />,
    );
    expect(screen.getByRole("region", { name: "Order tracking" })).toHaveTextContent(
      "Order No2752618130577",
    );
    const list = screen.getByRole("list", { name: "Order progress" });
    expect(list.tagName).toBe("OL");
    const steps = within(list).getAllByRole("listitem");
    expect(steps).toHaveLength(5);
    expect(steps[3]).toHaveAttribute("aria-current", "step");
    expect(steps[3]).toHaveTextContent("In Delivery, in progress");
    expect(steps[0]).toHaveTextContent("Confirmed, completed");
    expect(steps[4]).toHaveTextContent("Delivered, not started");
    expect(steps.filter((step) => step.hasAttribute("aria-current"))).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Shipment Tracking" }));
    expect(onTrackShipment).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("shows a failed step with the alert, and hides the optional slots", async () => {
    const { container } = render(
      <OrderTracking
        stage="processing"
        failed
        alert={
          <Alert usage="informative" width="card">
            Payment check pending.
          </Alert>
        }
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Payment check pending.");
    expect(screen.getByText("Processing")).toHaveTextContent("Processing, problem");
    expect(container.querySelector('[data-icon="deployed_code_alert"]')).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("Order No")).toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe("formatOrderDate", () => {
  it("formats with Intl per locale and zone", () => {
    const iso = "2026-10-27T19:47:00Z";
    expect(formatOrderDate(iso, "date", "en", "UTC")).toBe("Oct 27, 2026");
    expect(formatOrderDate(iso, "time", "en", "UTC")).toBe("19:47");
    expect(formatOrderDate(iso, "date", "de", "UTC")).toBe("27.10.2026");
  });

  it("shows no progress without a stage (a cancelled order) and takes an action slot", () => {
    render(
      <OrderTracking
        orderNumber="TH-47518"
        alert={
          <Alert usage="notice" width="card">
            Your order has been cancelled at your request.
          </Alert>
        }
        action={<a href="/x">Make Payment</a>}
      />,
    );
    expect(screen.queryByText("Confirmed")).toBeNull();
    expect(screen.getByRole("link", { name: "Make Payment" })).toBeVisible();
  });
});
