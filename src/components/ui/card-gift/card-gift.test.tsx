import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Accordion } from "../accordion/accordion";
import { CardGift } from "./card-gift";

const BASE = {
  title: "Birthday from Mum",
  label: { text: "ACTIVE", color: "info" as const },
  overline: "AVAILABLE BALANCE",
  value: "€42.50",
  caption: "of €50",
  progress: { value: 4250, max: 5000, label: "Balance left", valueText: "€42.50 of €50" },
  last4: "7K2M",
  details: "Expires Dec 2028",
};

describe("CardGift", () => {
  it("is a titled section with the balance, the code and its copy button", async () => {
    const onCopy = vi.fn();
    const { container } = render(
      <CardGift {...BASE} copy={{ label: "Copy code", onClick: onCopy }} />,
    );
    expect(screen.getByRole("region", { name: "Birthday from Mum" })).toHaveTextContent("€42.50");
    expect(screen.getByRole("progressbar", { name: "Balance left" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(onCopy).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });

  it("keeps the expiry text-secondary on a warning, and an expired card has nothing to copy", () => {
    const { container, rerender } = render(<CardGift {...BASE} state="warning" />);
    expect(screen.getByText("Expires Dec 2028")).toHaveClass("text-text-secondary");
    expect(container.firstChild).toHaveClass("after:border-border-warning", "after:border-b");
    rerender(<CardGift {...BASE} state="expired" copy={{ label: "Copy", onClick: vi.fn() }} />);
    expect(screen.queryByRole("button", { name: "Copy" })).toBeNull();
    expect(screen.getByText("€42.50")).toHaveClass("text-text-disabled");
  });

  it("opens its terms as the last section", async () => {
    render(
      <CardGift
        {...BASE}
        terms={
          <Accordion title="Terms & restrictions" usage="inset" indicator="chevron">
            <p className="pt-16 text-body-sm text-text-primary">
              Minimum spend €25. Not redeemable for cash.
            </p>
          </Accordion>
        }
      />,
    );
    const toggle = screen.getByRole("button", { name: "Terms & restrictions" });
    const terms = screen.getByText("Minimum spend €25. Not redeemable for cash.");
    expect(terms).not.toBeVisible();
    await userEvent.click(toggle);
    expect(terms).toBeVisible();
  });

  it("is a List Item by default and a Card with type card; every Show slot is optional", () => {
    const { container, rerender } = render(
      <CardGift overline="AVAILABLE BALANCE" value="€42.50" />,
    );
    expect(container.firstChild).toHaveClass("after:border-b");
    expect(container.firstChild).not.toHaveClass("rounded-card");
    expect(screen.queryByRole("progressbar")).toBeNull();
    rerender(<CardGift overline="AVAILABLE BALANCE" value="€42.50" type="card" />);
    expect(container.firstChild).toHaveClass("rounded-card", "after:border");
  });
});
