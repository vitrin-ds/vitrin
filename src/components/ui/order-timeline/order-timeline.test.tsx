import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { OrderTimeline } from "./order-timeline";

describe("OrderTimeline", () => {
  it("lists the steps in order with times, labels and spoken status", async () => {
    const { container } = render(
      <OrderTimeline
        timeZone="UTC"
        items={[
          { id: "1", title: "Order placed", date: "2026-10-27T09:14:00Z", label: "Express" },
          { id: "2", title: "Packed", date: "2026-10-28T13:02:00Z" },
          { id: "3", title: "Delivered", status: "upcoming" },
        ]}
      />,
    );
    const steps = within(screen.getByRole("list", { name: "Order history" })).getAllByRole(
      "listitem",
    );
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("Order placed, completed");
    expect(within(steps[0]!).getByText("Express")).toBeInTheDocument();
    expect(steps[0]!.querySelector("time")).toHaveAttribute("dateTime", "2026-10-27T09:14:00.000Z");
    expect(steps[2]).toHaveTextContent("Delivered, upcoming");
    expect(steps[2]!.querySelector('[data-icon="radio_button_unchecked"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("draws a connector under every node except the last", () => {
    const { container } = render(
      <OrderTimeline
        items={[
          { id: "1", title: "A" },
          { id: "2", title: "B" },
        ]}
      />,
    );
    expect(container.querySelectorAll(".bg-border-neutral")).toHaveLength(1);
  });
});
