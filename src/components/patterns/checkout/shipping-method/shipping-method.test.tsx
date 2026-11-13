import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { formatDeliveryEstimate } from "./delivery-estimate";
import { ShippingMethod, type ShippingMethodProps } from "./shipping-method";
import { SHIPPING_OPTIONS, SHIPPING_OPTIONS_FREE } from "./shipping-method.fixtures";

function Controlled(props: Partial<ShippingMethodProps> & { initial?: string }) {
  const [value, setValue] = useState(props.initial);
  return (
    <ShippingMethod
      options={SHIPPING_OPTIONS}
      {...props}
      value={value}
      onValueChange={(id) => {
        setValue(id);
        props.onValueChange?.(id);
      }}
    />
  );
}

describe("formatDeliveryEstimate", () => {
  it("formats one day or a range with Intl, in UTC", () => {
    expect(formatDeliveryEstimate({ earliest: "2026-11-03" }, "en-GB")).toBe("Tue 3 Nov");
    expect(
      formatDeliveryEstimate({ earliest: "2026-11-05", latest: "2026-11-09" }, "en-GB"),
    ).toMatch(/^Thu 5( Nov)?\s–\sMon 9 Nov$/);
    expect(formatDeliveryEstimate({ earliest: "2026-11-05", latest: "2026-11-05" }, "en-GB")).toBe(
      "Thu 5 Nov",
    );
  });

  it("orders a reversed range and rejects malformed dates", () => {
    expect(
      formatDeliveryEstimate({ earliest: "2026-11-09", latest: "2026-11-05" }, "en-GB"),
    ).toMatch(/^Thu 5( Nov)?\s–\sMon 9 Nov$/);
    expect(() => formatDeliveryEstimate({ earliest: "05/11/2026" })).toThrow(RangeError);
    expect(() => formatDeliveryEstimate({ earliest: "2026-13-45" })).toThrow(RangeError);
  });
});

describe("ShippingMethod", () => {
  it("is a radio group named by its title; each radio reads name, price and estimate", async () => {
    const { container } = render(<Controlled title="Delivery method" initial="standard" />);
    expect(screen.getByRole("heading", { level: 2, name: "Delivery method" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Delivery method" })).toBeInTheDocument();
    const standard = screen.getByRole("radio", { name: /^Standard €4\.95 Arrives/ });
    expect(standard).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: /^Next day €6\.90 .*Order before 2pm$/ }),
    ).toHaveAttribute("aria-checked", "false");
    await expectNoAxeViolations(container);
  });

  it("names the group from the labels when there is no title", () => {
    render(<Controlled />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Delivery method" })).toBeInTheDocument();
  });

  it("selects by click and arrow keys, skipping unavailable options", async () => {
    const onValueChange = vi.fn();
    render(
      <Controlled
        options={SHIPPING_OPTIONS_FREE}
        initial="standard"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /^Next day/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("next-day");

    const nextDay = screen.getByRole("radio", { name: /^Next day/ });
    nextDay.focus();
    await userEvent.keyboard("{ArrowDown}");
    // Same day is unavailable: focus wraps to Standard.
    expect(screen.getByRole("radio", { name: /^Standard/ })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("standard");

    const sameDay = screen.getByRole("radio", { name: /^Same day/ });
    expect(sameDay).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(sameDay);
    expect(onValueChange).not.toHaveBeenCalledWith("same-day");
  });

  it("shows Free for a zero price and explains unavailable options", () => {
    render(<Controlled options={SHIPPING_OPTIONS_FREE} />);
    expect(screen.getByRole("radio", { name: /^Standard Free/ })).toBeInTheDocument();
    expect(screen.getByText("Not available for your postcode")).toBeInTheDocument();
  });

  it("formats prices for the locale", () => {
    render(<Controlled locale="de" />);
    expect(screen.getByText(/^4,95\s€$/)).toBeInTheDocument();
  });
});
