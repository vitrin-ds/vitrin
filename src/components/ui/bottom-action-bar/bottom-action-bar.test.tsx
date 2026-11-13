import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Button } from "@/components/ui/button/button";
import { BottomActionBar } from "./bottom-action-bar";

describe("BottomActionBar", () => {
  it("is a named region with the price and the primary action, fixed by default", async () => {
    const { container } = render(
      <BottomActionBar
        label="Order total"
        price={{ amount: 12915, currency: "EUR" }}
        primaryAction={<Button>Pay €129.15</Button>}
      />,
    );
    const region = screen.getByRole("region", { name: "Order total" });
    expect(region).toHaveClass("fixed", "bottom-0", "bg-surface-primary", "pb-12");
    expect(region).not.toHaveClass("shadow-up");
    expect(region).toHaveTextContent("€129.15");
    expect(screen.getByRole("button", { name: "Pay €129.15" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows every Figma slot, in the flow when static", async () => {
    const { container } = render(
      <BottomActionBar
        label="Cart total"
        position="static"
        thumbnail={<span />}
        overline="3 items"
        price={{ amount: 12420, currency: "EUR" }}
        secondaryText="Incl. VAT"
        secondaryAction={<Button variant="outline">View cart</Button>}
        primaryAction={<Button>Checkout</Button>}
        spacer={false}
      />,
    );
    const region = screen.getByRole("region", { name: "Cart total" });
    expect(region).not.toHaveClass("fixed", "pb-12");
    expect(region).toHaveTextContent("3 items");
    expect(region).toHaveTextContent("Incl. VAT");
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "View cart",
      "Checkout",
    ]);
    await expectNoAxeViolations(container);
  });

  it("toggles the expanded state with the chevron", async () => {
    const onToggle = vi.fn();
    const { container, rerender } = render(
      <BottomActionBar
        label="Order total"
        price={{ amount: 100, currency: "EUR" }}
        toggle={{ expanded: false, onToggle, label: "More options" }}
      />,
    );
    const toggle = screen.getByRole("button", { name: "More options" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(
      <BottomActionBar
        label="Order total"
        price={{ amount: 100, currency: "EUR" }}
        toggle={{ expanded: true, onToggle, label: "More options" }}
      />,
    );
    expect(screen.getByRole("region")).toHaveClass("bg-surface-secondary");
    expect(screen.getByRole("button", { name: "More options" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expectNoAxeViolations(container);
  });
});
