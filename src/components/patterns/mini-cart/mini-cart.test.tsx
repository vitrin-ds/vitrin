import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { MiniCart } from "./mini-cart";
import { FREE_SHIPPING_THRESHOLD, MINI_CART_LINES, eur, withTotals } from "./mini-cart.fixtures";

function Harness({ initial = MINI_CART_LINES, onClose = () => undefined }) {
  const [lines, setLines] = useState(initial);
  const priced = withTotals(lines);
  return (
    <MiniCart
      open
      onClose={onClose}
      lines={priced.lines}
      subtotal={priced.subtotal}
      freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
      onQuantityChange={(id, quantity) =>
        setLines((current) => current.map((l) => (l.id === id ? { ...l, quantity } : l)))
      }
      onRemove={(id) => setLines((current) => current.filter((l) => l.id !== id))}
      checkoutHref="/checkout"
      cartHref="/cart"
      shopHref="/"
    />
  );
}

function mockViewport(wide: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: wide,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("MiniCart", () => {
  it("lists the lines, the free-shipping progress, the subtotal and both actions", async () => {
    mockViewport(true);
    render(<Harness />);
    const dialog = screen.getByRole("dialog", { name: "Cart" });
    expect(within(dialog).getByText("2 items")).toBeInTheDocument();
    const list = within(dialog).getByRole("list", { name: "Items in your cart" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(dialog).getByText("Spend €42 more for free shipping")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("progressbar", { name: "Free shipping progress" }),
    ).toHaveAttribute("aria-valuetext", "€108 of €150");
    expect(within(dialog).getByText("Subtotal").nextElementSibling).toHaveTextContent("€108");
    expect(within(dialog).getByRole("link", { name: "Checkout · €108" })).toHaveAttribute(
      "href",
      "/checkout",
    );
    expect(within(dialog).getByRole("link", { name: "View cart" })).toHaveAttribute(
      "href",
      "/cart",
    );
    // Full-bleed List lines; the totals and actions live in the sheet's fixed footer bar.
    expect(list.firstElementChild!.firstElementChild).toHaveClass("border-b");
    const footer = dialog.lastElementChild!;
    expect(footer).toHaveClass("shadow-up", "bg-surface-raised");
    expect(within(footer as HTMLElement).getByRole("link", { name: /Checkout/ })).toBeVisible();
    expect(footer).not.toContainElement(list);
    await expectNoAxeViolations(dialog);
  });

  it("changes quantities from the keyboard and announces the new totals", async () => {
    mockViewport(true);
    const user = userEvent.setup();
    render(<Harness />);
    const quantity = screen.getByRole("spinbutton", { name: "Quantity, Glow Serum" });
    quantity.focus();
    await user.keyboard("{ArrowUp}");
    expect(quantity).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("link", { name: "Checkout · €178" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Glow Serum: quantity 2. 3 items in your cart, subtotal €178.",
    );
    expect(screen.getByText("You've unlocked free shipping")).toBeInTheDocument();
  });

  it("removes a line, moves focus to the list and shows the empty state at the end", async () => {
    mockViewport(true);
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Remove Glow Serum" }));
    const list = screen.getByRole("list", { name: "Items in your cart" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    await waitFor(() => expect(list).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent(
      "Glow Serum removed. 1 item in your cart, subtotal €38.",
    );
    await user.click(screen.getByRole("button", { name: "Remove Cloud Cream" }));
    expect(screen.getByRole("heading", { level: 3, name: "Your cart is empty" })).toBeVisible();
    expect(screen.queryByRole("link", { name: /Checkout/ })).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("dialog").querySelector("[tabindex='-1']:not([role])")).toHaveFocus(),
    );
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  });

  it("closes with Escape and uses the bottom sheet below the tablet breakpoint", async () => {
    mockViewport(false);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: "Cart" });
    expect(dialog).toHaveClass("rounded-t-24");
    expect(dialog.lastElementChild).toHaveClass("shadow-up");
    await expectNoAxeViolations(dialog);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when one of its links is followed (the layout stays mounted)", async () => {
    mockViewport(true);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    const viewCart = screen.getByRole("link", { name: "View cart" });
    viewCart.addEventListener("click", (event) => event.preventDefault());
    await user.click(viewCart);
    expect(onClose).toHaveBeenCalledOnce();
    await user.click(screen.getAllByRole("button", { name: /^Increase/ })[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("hides the progress without a threshold", () => {
    render(
      <MiniCart
        open
        onClose={() => undefined}
        lines={MINI_CART_LINES}
        subtotal={eur(10800)}
        onQuantityChange={() => undefined}
        onRemove={() => undefined}
        checkoutHref="/checkout"
        cartHref="/cart"
        shopHref="/"
      />,
    );
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
