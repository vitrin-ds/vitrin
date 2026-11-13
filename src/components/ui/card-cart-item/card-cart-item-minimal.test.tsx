import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardCartItemMinimal } from "./card-cart-item-minimal";

const BASE = {
  name: "Rose Body Cream",
  href: "/p/rose-body-cream",
  price: { amount: 2800, currency: "EUR" as const },
  quantity: 1,
};

describe("CardCartItemMinimal", () => {
  it("links the name, shows the price and changes the quantity", async () => {
    const onQuantityChange = vi.fn();
    const { container } = render(
      <CardCartItemMinimal {...BASE} onQuantityChange={onQuantityChange} onRemove={vi.fn()} />,
    );
    expect(screen.getByRole("link", { name: "Rose Body Cream" })).toHaveAttribute(
      "href",
      "/p/rose-body-cream",
    );
    expect(screen.getByText("€28")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Increase/ }));
    expect(onQuantityChange).toHaveBeenCalledWith(2);
    await expectNoAxeViolations(container);
  });

  it("removes the line from the Remove link, named for the product", async () => {
    const onRemove = vi.fn();
    render(<CardCartItemMinimal {...BASE} onQuantityChange={vi.fn()} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Rose Body Cream" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("has no Remove link without onRemove (Figma Show Remove off)", () => {
    render(<CardCartItemMinimal {...BASE} onQuantityChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
  });
});
