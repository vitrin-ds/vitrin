import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConnectedCart } from "@/components/patterns/cart/connected-cart";
import { ConnectedMiniCart } from "@/components/patterns/mini-cart/connected-mini-cart";
import { createShopifyCartAdapter } from "./shopify-cart-adapter";

// Mini Cart and Cart run unchanged on the Shopify adapter. The
// Storefront API is answered by a fake fetch, in the shape Shopify answers.

const line = (quantity: number) => ({
  node: {
    id: "gid://shopify/CartLine/1",
    quantity,
    merchandise: {
      id: "gid://shopify/ProductVariant/1",
      title: "50 ml",
      quantityAvailable: 5,
      price: { amount: "70.0", currencyCode: "EUR" },
      compareAtPrice: null,
      image: null,
      product: {
        id: "gid://shopify/Product/1",
        title: "Glow Serum",
        handle: "glow-serum",
        vendor: "Serein",
      },
    },
    discountAllocations: [],
  },
});

const cart = (quantity: number, codes: { code: string; applicable: boolean }[] = []) => ({
  id: "gid://shopify/Cart/1",
  lines: { edges: quantity > 0 ? [line(quantity)] : [] },
  discountCodes: codes,
  discountAllocations: codes
    .filter((c) => c.applicable)
    .map((c) => ({ code: c.code, discountedAmount: { amount: "7.0", currencyCode: "EUR" } })),
  cost: { subtotalAmount: { amount: String(70 * quantity), currencyCode: "EUR" } },
});

/** A Storefront endpoint over one cart: queries read it, mutations change it. */
function storefront() {
  let state = cart(1);
  const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const { query, variables } = JSON.parse(String(init?.body));
    const payload = (name: string) => ({ data: { [name]: { cart: state, userErrors: [] } } });
    let body: unknown = { data: { cart: state } };
    if (query.includes("cartLinesUpdate")) {
      state = cart(variables.lines[0].quantity);
      body = payload("cartLinesUpdate");
    } else if (query.includes("cartLinesRemove")) {
      state = cart(0);
      body = payload("cartLinesRemove");
    } else if (query.includes("cartDiscountCodesUpdate")) {
      const codes = (variables.discountCodes as string[]).map((code) => ({
        code,
        applicable: code === "WELCOME10",
      }));
      state = cart(state.lines.edges[0]?.node.quantity ?? 0, codes);
      body = payload("cartDiscountCodesUpdate");
    }
    return { ok: true, status: 200, json: async () => body } as Response;
  });
  return {
    fetch,
    adapter: createShopifyCartAdapter({
      endpoint: "https://shop.example/api/graphql.json",
      cartId: "gid://shopify/Cart/1",
      fetch: fetch as unknown as typeof globalThis.fetch,
    }),
  };
}

describe("cart blocks on the Shopify adapter", () => {
  it("Mini Cart reads the cart and removes a line", async () => {
    const { adapter } = storefront();
    render(
      <ConnectedMiniCart
        adapter={adapter}
        onError={vi.fn()}
        open
        onClose={vi.fn()}
        checkoutHref="/checkout"
        cartHref="/cart"
        shopHref="/"
      />,
    );
    expect(await screen.findByRole("link", { name: /Glow Serum/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove Glow Serum" }));
    await waitFor(() => expect(screen.getByText("Your cart is empty")).toBeInTheDocument());
  });

  it("Cart applies a promo code and refuses one that doesn't apply", async () => {
    const { adapter } = storefront();
    const onError = vi.fn();
    render(<ConnectedCart adapter={adapter} onError={onError} />);
    const aside = await screen.findByRole("complementary", { name: "Order total" });

    await userEvent.click(within(aside).getByRole("button", { name: /promo code/i }));
    await userEvent.type(within(aside).getByRole("textbox"), "nope");
    await userEvent.click(within(aside).getByRole("button", { name: /apply/i }));
    expect(
      await within(aside).findByText("This code isn't valid. Check it and try again."),
    ).toBeInTheDocument();

    await userEvent.clear(within(aside).getByRole("textbox"));
    await userEvent.type(within(aside).getByRole("textbox"), "welcome10");
    await userEvent.click(within(aside).getByRole("button", { name: /apply/i }));
    expect((await within(aside).findAllByText(/WELCOME10/)).length).toBeGreaterThan(0);
    expect(onError).not.toHaveBeenCalled();
  });
});
