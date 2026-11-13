import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CARD_REWARDS_DEFAULTS, CardRewards } from "./card-rewards";

describe("CardRewards", () => {
  it("shows a gift card's balance, progress, label and name", async () => {
    const { container } = render(
      <CardRewards
        label={{ text: "Default", color: "info", icon: "circle" }}
        overline="Balance"
        value="€42.50"
        caption="of €50"
        progress={{ value: 4250, max: 5000, label: "Balance left", valueText: "€42.50 of €50" }}
        title="Birthday from Mum"
        details="Gift card · •••• 7K2M"
      />,
    );
    expect(CARD_REWARDS_DEFAULTS).toEqual({ state: "default", icon: "redeem", headingLevel: 3 });
    expect(container.firstChild).toHaveClass("inset-ring-border-neutral", "rounded-card", "h-254");
    expect(screen.getByRole("heading", { level: 3, name: "Birthday from Mum" })).toBeVisible();
    expect(screen.getByText("€42.50")).toHaveClass("text-headline-lg");
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Balance left" })).toHaveAttribute(
      "aria-valuetext",
      "€42.50 of €50",
    );
    await expectNoAxeViolations(container);
  });

  it("marks an expiring reward with the warning state and no progress", async () => {
    const { container } = render(
      <CardRewards
        state="warning"
        icon="sell"
        label={{ text: "13 days", color: "warning", icon: "schedule" }}
        overline="Save"
        value="-25%"
        caption="make-up · min €40"
        title="WELCOME20"
        details="Coupon · Expires 14 Nov"
        headingLevel={4}
      />,
    );
    expect(container.firstChild).toHaveClass("inset-ring-border-warning");
    expect(screen.getByText("make-up · min €40")).toHaveClass("text-text-warning");
    expect(screen.getByText("Coupon · Expires 14 Nov")).toHaveClass("text-text-warning");
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByRole("heading", { level: 4, name: "WELCOME20" })).toBeVisible();
    await expectNoAxeViolations(container);
  });

  it("is greyed out with no hover when disabled", () => {
    const { container } = render(
      <CardRewards state="disabled" overline="Balance" value="€42.50" title="Birthday from Mum" />,
    );
    expect(container.firstChild).toHaveClass("bg-surface-disabled", "inset-ring-border-disabled");
    expect(container.firstChild).not.toHaveClass("hover:bg-interactive-subtle-hover");
    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });
});
