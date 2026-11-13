import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardCoupon } from "./card-coupon";

const BASE = {
  code: "SUMMER25",
  label: { text: "READY TO USE", color: "success" as const },
  value: "-€25",
  caption: "off your order",
  description: "Summer sale promotion.",
  tags: [{ text: "SINGLE USE" }],
  disclaimer: { text: "Expires 31 Aug 2027", icon: "schedule" as const },
  copy: { label: "Copy SUMMER25", onClick: vi.fn() },
};

describe("CardCoupon", () => {
  it("shows the value, its conditions and the expiry", async () => {
    const { container } = render(<CardCoupon {...BASE} />);
    expect(screen.getByRole("region", { name: "SUMMER25" })).toHaveTextContent("-€25");
    expect(screen.getByText("SINGLE USE")).toBeInTheDocument();
    expect(screen.getByText("Expires 31 Aug 2027")).toHaveClass("bg-surface-neutral");
    await expectNoAxeViolations(container);
  });

  it("keeps the disclaimer neutral on a warning and marks only the border", () => {
    const { container } = render(<CardCoupon {...BASE} state="warning" />);
    expect(screen.getByText("Expires 31 Aug 2027")).toHaveClass("bg-surface-neutral");
    expect(container.firstChild).toHaveClass("after:border-border-warning");
  });

  it("is a List Item by default and a Card with type card; Expired List Item is border-error", () => {
    const { container, rerender } = render(<CardCoupon {...BASE} state="expired" />);
    expect(container.firstChild).toHaveClass("after:border-b", "after:border-border-error");
    rerender(<CardCoupon {...BASE} state="expired" type="card" />);
    expect(container.firstChild).toHaveClass("rounded-card", "after:border-border-neutral");
  });
});
