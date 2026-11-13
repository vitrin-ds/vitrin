import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cart } from "@/lib/api/types/cart";
import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";
import { ConnectedMiniCart } from "./connected-mini-cart";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const CART: Cart = {
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
      maxQuantity: 5,
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

const hrefs = { checkoutHref: "/checkout", cartHref: "/cart", shopHref: "/" };

describe("ConnectedMiniCart", () => {
  it("renders the adapter's cart and links lines to the product", async () => {
    render(
      <ConnectedMiniCart
        adapter={createMockCartAdapter(CART)}
        onError={vi.fn()}
        open
        onClose={vi.fn()}
        {...hrefs}
      />,
    );
    const link = await screen.findByRole("link", { name: /Glow Serum/ });
    expect(link).toHaveAttribute("href", "/p/glow-serum");
    expect(screen.getAllByText("€70").length).toBeGreaterThan(0);
  });

  it("removes a line through the adapter and shows the empty state", async () => {
    const user = userEvent.setup();
    render(
      <ConnectedMiniCart
        adapter={createMockCartAdapter(CART)}
        onError={vi.fn()}
        open
        onClose={vi.fn()}
        {...hrefs}
      />,
    );
    await user.click(await screen.findByRole("button", { name: "Remove Glow Serum" }));
    await waitFor(() => expect(screen.getByText("Your cart is empty")).toBeInTheDocument());
  });

  it("shows nothing before the first read, not an empty cart", () => {
    const adapter = { ...createMockCartAdapter(CART), getCart: () => new Promise<Cart>(() => {}) };
    render(
      <ConnectedMiniCart adapter={adapter} onError={vi.fn()} open onClose={vi.fn()} {...hrefs} />,
    );
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
  });
});
