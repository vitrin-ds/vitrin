import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cart as CartData } from "@/lib/api/types/cart";
import { CommerceError, type CommerceCartAdapter } from "@/lib/commerce/commerce-adapter";
import { expectNoAxeViolations } from "@/test/axe";
import { Cart } from "./cart";
import { ConnectedCart } from "./connected-cart";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const CART: CartData = {
  id: "cart-1",
  lines: [
    {
      id: "l1",
      productId: "p1",
      variantId: "v1",
      name: "Glow Serum",
      slug: "glow-serum",
      brandName: "Serein",
      quantity: 1,
      maxQuantity: 2,
      unitPrice: eur(7000),
      lineTotal: eur(7000),
    },
  ],
  subtotal: eur(7000),
  coupons: [],
  discounts: eur(0),
  shipping: null,
  total: eur(7000),
  freeShippingThreshold: eur(15000),
};

const EMPTY: CartData = { ...CART, lines: [], subtotal: eur(0), total: eur(0) };

function adapter(overrides: Partial<CommerceCartAdapter> = {}): CommerceCartAdapter {
  return {
    getCart: vi.fn(async () => CART),
    addLine: vi.fn(async () => CART),
    setLineQuantity: vi.fn(async () => CART),
    removeLine: vi.fn(async () => EMPTY),
    applyCoupon: vi.fn(async () => CART),
    removeCoupon: vi.fn(async () => CART),
    ...overrides,
  };
}

const noop = () => {};
const handlers = {
  onQuantityChange: noop,
  onRemove: noop,
  onApplyCoupon: () => ({ ok: true as const }),
  onRemoveCoupon: noop,
};

describe("Cart", () => {
  it("shows the loading frame while the cart is null", () => {
    render(<Cart cart={null} {...handlers} />);
    expect(screen.getByText("Loading your cart…")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Checkout" })).not.toBeInTheDocument();
  });

  it("shows the empty state for an empty cart", () => {
    render(<Cart cart={EMPTY} {...handlers} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("lists the lines with a low-stock note and links to checkout", async () => {
    const { container } = render(<Cart cart={CART} {...handlers} />);
    expect(screen.getByRole("heading", { level: 1, name: "Shopping Cart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Glow Serum" })).toHaveAttribute(
      "href",
      "/p/glow-serum",
    );
    expect(screen.getByText("Only 2 left")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Checkout" })[0]).toHaveAttribute(
      "href",
      "/checkout",
    );
    await expectNoAxeViolations(container);
  });

  it("offers Save for later only when the store handles it", () => {
    const { rerender } = render(<Cart cart={CART} {...handlers} />);
    expect(screen.queryByRole("button", { name: /save for later/i })).not.toBeInTheDocument();
    rerender(<Cart cart={CART} {...handlers} onSaveForLater={noop} />);
    expect(screen.getByRole("button", { name: /save for later/i })).toBeInTheDocument();
  });
});

describe("ConnectedCart", () => {
  it("reads the cart from the adapter", async () => {
    render(<ConnectedCart adapter={adapter()} onError={noop} />);
    expect(await screen.findByRole("link", { name: "Glow Serum" })).toBeInTheDocument();
  });

  it("removes a line through the adapter", async () => {
    const cart = adapter();
    render(<ConnectedCart adapter={cart} onError={noop} />);
    await userEvent.click(await screen.findByRole("button", { name: /remove/i }));
    await waitFor(() => expect(cart.removeLine).toHaveBeenCalledWith("l1"));
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });

  it("shows a refused promo code under the field", async () => {
    const cart = adapter({
      applyCoupon: vi.fn(async () => {
        throw new CommerceError("invalid-coupon");
      }),
    });
    render(<ConnectedCart adapter={cart} onError={noop} />);
    const aside = await screen.findByRole("complementary", { name: "Order total" });
    await userEvent.click(within(aside).getByRole("button", { name: /promo code/i }));
    await userEvent.type(within(aside).getByRole("textbox"), "nope");
    await userEvent.click(within(aside).getByRole("button", { name: /apply/i }));
    expect(
      await within(aside).findByText("This code isn't valid. Check it and try again."),
    ).toBeInTheDocument();
    expect(cart.applyCoupon).toHaveBeenCalledWith("NOPE");
  });
});

describe("ConnectedCart on the mock adapter", () => {
  it("applies a known code and takes it off the total", async () => {
    const { createMockCartAdapter } = await import("@/lib/commerce/mock-cart-adapter");
    const cart = createMockCartAdapter(CART, {
      coupons: { WELCOME10: { label: "10% off", amount: eur(700) } },
    });
    render(<ConnectedCart adapter={cart} onError={noop} />);
    const aside = await screen.findByRole("complementary", { name: "Order total" });
    await userEvent.click(within(aside).getByRole("button", { name: /promo code/i }));
    await userEvent.type(within(aside).getByRole("textbox"), "welcome10");
    await userEvent.click(within(aside).getByRole("button", { name: /apply/i }));
    expect(await within(aside).findByText("Promo · WELCOME10")).toBeInTheDocument();
    await expect(cart.getCart()).resolves.toMatchObject({ total: eur(6300) });
  });
});
