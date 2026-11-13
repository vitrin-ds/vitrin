import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import {
  CARD_FEATURE_STORE_LABELS,
  CardFeatureStore,
  formatStoreStatus,
} from "./card-feature-store";

const NOW = new Date(2026, 2, 12, 17, 45);
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes);

const BASE = {
  name: "Things Camden",
  address: "42 Camden High Street, London NW1 0LT",
  now: NOW,
} as const;

describe("CardFeatureStore", () => {
  it("is a titled article with number, distance, address, status text, services and links", async () => {
    const { container } = render(
      <CardFeatureStore
        {...BASE}
        number={1}
        distance={0.4}
        status="open"
        nextChange={at(12, 20)}
        services={["Click & Collect", "Consultations", "Returns", "Repairs"]}
        detailsHref="/stores/northgate-camden"
        directionsHref="https://maps.example.com/?q=camden"
      />,
    );
    expect(screen.getByRole("article", { name: "Things Camden" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Things Camden" })).toBeInTheDocument();
    expect(screen.getByText("1")).toHaveClass("bg-surface-accent");
    expect(screen.getByText("0.4 km")).toBeInTheDocument();
    expect(container.querySelector("address")).toHaveTextContent("42 Camden High Street");
    expect(screen.getByText("Open · until 20:00")).toHaveClass("text-text-success");
    // Figma Don't: more than three service chips.
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText("Repairs")).toBeNull();
    expect(screen.getByRole("link", { name: "Store details, Things Camden" })).toHaveAttribute(
      "href",
      "/stores/northgate-camden",
    );
    expect(screen.getByRole("link", { name: "Directions to Things Camden" })).toBeInTheDocument();
    // Not inside a RadioCardGroup: no radio.
    expect(screen.queryByRole("radio")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("writes every status as text next to the dot", () => {
    const { rerender } = render(
      <CardFeatureStore {...BASE} status="closing-soon" nextChange={at(12, 18, 30)} />,
    );
    expect(screen.getByText("Closes soon · 18:30")).toHaveClass("text-text-warning");
    rerender(<CardFeatureStore {...BASE} status="closed" nextChange={at(13, 10)} />);
    expect(screen.getByText("Closed · opens 10:00 tomorrow")).toHaveClass("text-text-error");
    rerender(<CardFeatureStore {...BASE} status="closed" />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("formats later-today and later-in-the-week openings", () => {
    const status = (next: Date) =>
      formatStoreStatus("closed", CARD_FEATURE_STORE_LABELS, "en-GB", next, at(12, 7));
    expect(status(at(12, 9))).toBe("Closed · opens 09:00");
    expect(status(at(15, 10))).toBe("Closed · opens 10:00 Sunday");
  });

  it("hides the optional slots when they are not given", () => {
    render(<CardFeatureStore {...BASE} status="open" />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/km/)).toBeNull();
  });

  it("is selectable in a RadioCardGroup and promotes Store details when selected", async () => {
    function Group() {
      const [value, setValue] = useState<string | undefined>("a");
      return (
        <RadioCardGroup label="Stores" value={value} onValueChange={setValue}>
          <CardFeatureStore {...BASE} value="a" status="open" detailsHref="/stores/a" />
          <CardFeatureStore
            {...BASE}
            value="b"
            name="Northgate Soho"
            status="closed"
            detailsHref="/b"
          />
        </RadioCardGroup>
      );
    }
    const { container } = render(<Group />);
    const camden = screen.getByRole("radio", { name: "Things Camden" });
    expect(camden).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("article", { name: "Things Camden" })).toHaveClass(
      "bg-surface-secondary",
      "after:border-border-accent",
    );
    expect(screen.getByRole("link", { name: "Store details, Things Camden" })).toHaveClass(
      "bg-(--th-button-accent-solid-bg)",
    );
    await userEvent.click(screen.getByRole("radio", { name: "Northgate Soho" }));
    expect(screen.getByRole("radio", { name: "Northgate Soho" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(camden).toHaveAttribute("aria-checked", "false");
    await expectNoAxeViolations(container);
  });
  it("holds the status row with a skeleton while the status is pending", () => {
    const { container } = render(<CardFeatureStore {...BASE} />);
    expect(screen.queryByText(/Open|Closed/)).toBeNull();
    expect(container.querySelector('[aria-hidden="true"].bg-surface-skeleton')).not.toBeNull();
  });
});
