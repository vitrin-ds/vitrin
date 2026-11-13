import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ShipmentTracking } from "./shipment-tracking";

describe("ShipmentTracking", () => {
  it("lists the scans with 24-hour time stamps, titles and locations", async () => {
    const { container } = render(
      <ShipmentTracking
        timeZone="UTC"
        events={[
          { id: "1", title: "Picked up", occurredAt: "2026-10-28T17:40:00Z", location: "Leipzig" },
          {
            id: "2",
            title: "Out for delivery",
            occurredAt: "2026-10-29T07:47:00Z",
            icon: "delivery_truck_speed",
          },
        ]}
      />,
    );
    const scans = within(screen.getByRole("list", { name: "Shipment tracking" })).getAllByRole(
      "listitem",
    );
    expect(scans[0]).toHaveTextContent("17:40Picked upLeipzig");
    expect(scans[1]!.querySelector("time")).toHaveTextContent("07:47");
    expect(scans[1]!.querySelector('[data-icon="delivery_truck_speed"]')).not.toBeNull();
    expect(container.querySelectorAll(".bg-border-neutral")).toHaveLength(1);
    await expectNoAxeViolations(container);
  });
});
