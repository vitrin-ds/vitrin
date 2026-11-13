import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { tokenContrast } from "@/test/token-contrast";
import { CardCartItemCompact } from "./card-cart-item-compact";
import { CardCartItemDetailed } from "./card-cart-item-detailed";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const BASE = {
  name: "Glow Serum",
  href: "/p/glow-serum",
  overline: "Serein",
  variantLabels: ["30 ml", "Rosewood"],
  price: eur(3920),
  compareAt: eur(5600),
  quantity: 2,
};

describe("CardCartItemCompact", () => {
  it("takes the Return Items states: a toned overline, a leading slot and a done border", () => {
    const { container } = render(
      <CardCartItemCompact
        {...BASE}
        type="card"
        overline="FINAL SALE"
        overlineTone="error"
        leading={<span data-testid="step">1</span>}
        done
      />,
    );
    expect(screen.getByText("FINAL SALE")).toHaveClass("text-text-error");
    expect(screen.getByTestId("step")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("inset-ring-border-success");
  });

  it("shows the line with a quantity pill that stops at the max", async () => {
    const onQuantityChange = vi.fn();
    const { container } = render(
      <CardCartItemCompact
        {...BASE}
        subtitle="30 ml"
        maxQuantity={2}
        onQuantityChange={onQuantityChange}
      />,
    );
    expect(screen.getByRole("link", { name: "Glow Serum" })).toHaveAttribute(
      "href",
      "/p/glow-serum",
    );
    expect(screen.getByRole("spinbutton", { name: "Quantity, Glow Serum" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    expect(screen.getByRole("button", { name: /Increase/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Decrease/ }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
    await expectNoAxeViolations(container);
  });

  it("shows a read-only quantity, a selection checkbox and the disabled state", async () => {
    const onCheckedChange = vi.fn();
    const { container, rerender } = render(
      <CardCartItemCompact {...BASE} selection={{ checked: false, onCheckedChange }} />,
    );
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.getByText("Quantity: 2")).toHaveClass("sr-only");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Glow Serum" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    rerender(<CardCartItemCompact {...BASE} disabled type="card" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-disabled", "rounded-card");
  });

  it("has no Remove button and no quantity badge", () => {
    render(<CardCartItemCompact {...BASE} quantity={2} onQuantityChange={() => undefined} />);
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    expect(document.querySelector('[data-icon="delete"]')).toBeNull();
  });

  it('removes with "−" at quantity 1 when minQuantity is 0, named Remove {name}', async () => {
    const onQuantityChange = vi.fn();
    const { container } = render(
      <CardCartItemCompact
        {...BASE}
        quantity={1}
        minQuantity={0}
        onQuantityChange={onQuantityChange}
      />,
    );
    const minus = screen.getByRole("button", { name: "Remove Glow Serum" });
    expect(minus).toBeEnabled();
    await userEvent.click(minus);
    expect(onQuantityChange).toHaveBeenCalledWith(0);
    await expectNoAxeViolations(container);
  });

  it('keeps "−" as Decrease above 1 and at the default minimum of 1', () => {
    const { rerender } = render(
      <CardCartItemCompact
        {...BASE}
        quantity={2}
        minQuantity={0}
        onQuantityChange={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: /^Decrease/ })).toBeInTheDocument();
    rerender(<CardCartItemCompact {...BASE} quantity={1} onQuantityChange={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Remove Glow Serum" })).toBeNull();
  });
});

describe("CardCartItemDetailed", () => {
  it("shows the stock disclaimer, inline quantity and named line actions", async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <CardCartItemDetailed
        {...BASE}
        disclaimer={{ tone: "warning", text: "Only 2 left" }}
        onQuantityChange={() => undefined}
        onSaveForLater={() => undefined}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByText("Only 2 left").parentElement).toHaveClass("text-text-warning");
    expect(container.querySelector('[data-icon="warning"]')).not.toBeNull();
    expect(screen.getByRole("spinbutton")).toHaveClass("text-title-md");
    await userEvent.click(screen.getByRole("button", { name: "Remove Glow Serum" }));
    expect(onRemove).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save for later: Glow Serum" })).toHaveTextContent(
      "Save for later",
    );
    await expectNoAxeViolations(container);
  });
});

// Hover & Tap fill: text-tertiary drops to 4.28:1 on it, so the subtitle turns text-secondary.
describe("hover text", () => {
  it("raises the subtitle to text-secondary on the hover fill", () => {
    render(<CardCartItemCompact {...BASE} subtitle="Hydrating" />);
    expect(screen.getByText("Hydrating")).toHaveClass(
      "text-text-tertiary",
      "group-hover/card:text-text-secondary",
    );
  });

  it.each(["light", "dark"] as const)("keeps text-secondary at 4.5:1 there (%s)", (theme) => {
    expect(
      tokenContrast("text-secondary", "interactive-subtle-hover", theme),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
