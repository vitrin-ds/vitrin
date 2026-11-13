import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Button } from "@/components/ui/button/button";
import { FreeShippingProgress } from "./free-shipping-progress";
import { ORDER_SUMMARY_LABELS, OrderSummary } from "./order-summary";
import {
  eur,
  CART_TOTALS,
  FREE_SHIPPING_TOTALS,
  SUMMARY_LINES,
  SUMMARY_TOTALS,
} from "./order-summary.fixtures";

/** dt text → dd text, read from the description list. */
function rows(): Record<string, string | undefined> {
  const list = screen.getByRole("region", { name: "Order Summary" }).querySelector("dl");
  if (!list) throw new Error("No <dl>");
  return Object.fromEntries(
    Array.from(list.querySelectorAll("dt")).map((dt) => [
      dt.textContent,
      dt.nextElementSibling?.textContent,
    ]),
  );
}

describe("OrderSummary", () => {
  it("renders every cost as a description list with the total last", async () => {
    const { container } = render(
      <OrderSummary
        totals={SUMMARY_TOTALS}
        items={SUMMARY_LINES}
        editHref="/cart"
        action={<Button size="lg">Pay €129.15</Button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Order Summary" })).toBeInTheDocument();
    expect(rows()).toEqual({
      "Subtotal (3 items)": "€138",
      "Promo · WELCOME10 (10%)": "-€13.80",
      Shipping: "€4.95",
      "Incl. VAT": "€21.53",
      Total: "€129.15",
    });
    const dts = container.querySelectorAll("dt");
    expect(dts[dts.length - 1]).toHaveClass("text-title-lg");
    expect(screen.getByRole("link", { name: "Edit cart" })).toHaveAttribute("href", "/cart");
    expect(
      within(screen.getByRole("list", { name: "Items in your order" })).getAllByRole("img"),
    ).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it("says when shipping is pending or free", () => {
    const { rerender } = render(<OrderSummary totals={CART_TOTALS} />);
    expect(rows().Shipping).toBe("Calculated at checkout");
    expect(rows()["Incl. VAT"]).toBeUndefined();
    rerender(<OrderSummary totals={FREE_SHIPPING_TOTALS} />);
    expect(rows().Shipping).toBe("Free");
  });

  it("shows three thumbnails and counts the rest", () => {
    render(
      <OrderSummary
        totals={SUMMARY_TOTALS}
        items={[...SUMMARY_LINES, { name: "Lip Oil" }, { name: "Hand Balm" }]}
      />,
    );
    const list = screen.getByRole("list", { name: "Items in your order" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(within(list).getByText("and 2 more items")).toHaveClass("sr-only");
  });

  it("renders the plain confirmation block with its own heading level and labels", async () => {
    const { container } = render(
      <OrderSummary
        totals={SUMMARY_TOTALS}
        variant="plain"
        headingLevel={3}
        labels={{
          ...ORDER_SUMMARY_LABELS,
          subtotal: () => "Basket Total",
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Order Summary" })).toHaveClass(
      "text-title-sm",
    );
    expect(rows()["Basket Total"]).toBe("€138");
    expect(container.querySelector("section")).not.toHaveClass("p-16");
  });

  it("leads with the free-shipping progress on the cart page", async () => {
    const { container } = render(
      <OrderSummary
        totals={CART_TOTALS}
        lead={<FreeShippingProgress subtotal={eur(13800)} threshold={eur(15000)} />}
      />,
    );
    const region = screen.getByRole("region", { name: "Order Summary" });
    expect(region.firstElementChild).toHaveTextContent("Spend €12 more for free shipping");
    expect(screen.getByRole("progressbar", { name: "Free shipping progress" })).toHaveAttribute(
      "aria-valuetext",
      "€138 of €150",
    );
    await expectNoAxeViolations(container);
  });
});

describe("FreeShippingProgress", () => {
  it("says when free shipping is reached, with a rule when divided", () => {
    const { container } = render(
      <FreeShippingProgress divided subtotal={eur(16000)} threshold={eur(15000)} />,
    );
    expect(screen.getByText("You've unlocked free shipping")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("border-b", "pb-16");
    // Reached: the glyph and the bar turn success.
    expect(container.querySelector('[data-icon="local_shipping"]')).toHaveClass(
      "text-icon-success",
    );
    expect(container.querySelectorAll('[role="progressbar"] rect')[1]).toHaveClass(
      "fill-icon-success",
    );
  });

  it("keeps the accent bar and primary glyph until the threshold", () => {
    const { container } = render(
      <FreeShippingProgress subtotal={eur(13800)} threshold={eur(15000)} />,
    );
    expect(container.querySelector('[data-icon="local_shipping"]')).toHaveClass(
      "text-icon-primary",
    );
    expect(container.querySelectorAll('[role="progressbar"] rect')[1]).toHaveClass(
      "fill-surface-accent",
    );
  });
});
