import { describe, expect, it, vi } from "vitest";
import { createShopifyCartAdapter, toMinorUnits } from "./shopify-cart-adapter";

const CART = {
  id: "gid://shopify/Cart/1",
  lines: {
    edges: [
      {
        node: {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Small",
            quantityAvailable: 48,
            price: { amount: "25.0", currencyCode: "CAD" },
            compareAtPrice: { amount: "30.0", currencyCode: "CAD" },
            image: { url: "https://cdn.example/a.jpg", altText: null, width: 400, height: 400 },
            product: {
              id: "gid://shopify/Product/1",
              title: "Slides",
              handle: "slides",
              vendor: "Acme",
            },
          },
        },
      },
    ],
  },
  cost: { subtotalAmount: { amount: "50.0", currencyCode: "CAD" } },
};

function respond(body: unknown, ok = true) {
  return vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => body }) as Response);
}

const config = { endpoint: "https://shop.example/api", cartId: CART.id };

describe("createShopifyCartAdapter", () => {
  it("maps a Storefront cart to our Cart, in minor units", async () => {
    const fetch = respond({ data: { cart: CART } });
    const cart = await createShopifyCartAdapter({ ...config, fetch }).getCart();
    expect(cart.subtotal).toEqual({ amount: 5000, currency: "CAD" });
    expect(cart.lines[0]).toMatchObject({
      id: "gid://shopify/CartLine/1",
      name: "Slides",
      slug: "slides",
      brandName: "Acme",
      variantTitle: "Small",
      quantity: 2,
      maxQuantity: 48,
      unitPrice: { amount: 2500, currency: "CAD" },
      compareAtUnitPrice: { amount: 3000, currency: "CAD" },
      lineTotal: { amount: 5000, currency: "CAD" },
      image: { src: "https://cdn.example/a.jpg", alt: "Slides", width: 400, height: 400 },
    });
  });

  it("hides Shopify's placeholder variant title", async () => {
    const line = CART.lines.edges[0].node;
    const single = {
      ...CART,
      lines: {
        edges: [
          { node: { ...line, merchandise: { ...line.merchandise, title: "Default Title" } } },
        ],
      },
    };
    const cart = await createShopifyCartAdapter({
      ...config,
      fetch: respond({ data: { cart: single } }),
    }).getCart();
    expect(cart.lines[0].variantTitle).toBeUndefined();
  });

  it("sends the quantity change and returns the new cart", async () => {
    const fetch = respond({ data: { cartLinesUpdate: { cart: CART, userErrors: [] } } });
    await createShopifyCartAdapter({ ...config, fetch }).setLineQuantity("line-1", 3);
    const body = JSON.parse(
      (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(body.variables).toEqual({ cartId: CART.id, lines: [{ id: "line-1", quantity: 3 }] });
  });

  it("sends the storefront token only when it is given", async () => {
    const fetch = respond({ data: { cart: CART } });
    await createShopifyCartAdapter({ ...config, storefrontToken: "public", fetch }).getCart();
    const init = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.headers).toMatchObject({ "X-Shopify-Storefront-Access-Token": "public" });
  });

  it.each([
    ["a failed request", respond({}, false), /500/],
    ["GraphQL errors", respond({ errors: [{ message: "Bad query" }] }), /Bad query/],
    ["a missing cart", respond({ data: { cart: null } }), /not found/],
  ])("throws on %s", async (_, fetch, message) => {
    await expect(createShopifyCartAdapter({ ...config, fetch }).getCart()).rejects.toThrow(message);
  });

  it("refuses a mutation's user errors with our error code", async () => {
    const fetch = respond({
      data: {
        cartLinesRemove: {
          cart: null,
          userErrors: [{ code: "INVALID_MERCHANDISE_LINE", message: "Line is gone" }],
        },
      },
    });
    await expect(
      createShopifyCartAdapter({ ...config, fetch }).removeLine("x"),
    ).rejects.toMatchObject({ code: "unknown-variant" });
  });

  it("adds a line by variant id", async () => {
    const fetch = respond({ data: { cartLinesAdd: { cart: CART, userErrors: [] } } });
    const cart = await createShopifyCartAdapter({ ...config, fetch }).addLine("gid://v/2", 2);
    const body = JSON.parse(
      (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(body.variables.lines).toEqual([{ merchandiseId: "gid://v/2", quantity: 2 }]);
    expect(cart.lines).toHaveLength(1);
  });

  it("ignores a preview: nothing from it reaches Shopify, and the price is Shopify's", async () => {
    const fetch = respond({ data: { cartLinesAdd: { cart: CART, userErrors: [] } } });
    const preview = {
      productId: "PREVIEW-PRODUCT",
      name: "PREVIEW-NAME",
      slug: "preview-slug",
      brandName: "PREVIEW-BRAND",
      variantTitle: "PREVIEW-VARIANT",
      image: { src: "https://preview.example/x.jpg", alt: "PREVIEW-ALT", width: 1, height: 1 },
      unitPrice: { amount: 1, currency: "EUR" },
      compareAtUnitPrice: { amount: 2, currency: "EUR" },
      maxQuantity: 999,
    };
    const cart = await createShopifyCartAdapter({ ...config, fetch }).addLine("gid://v/2", 2, {
      preview,
    });
    const raw = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string;
    expect(JSON.parse(raw).variables.lines).toEqual([{ merchandiseId: "gid://v/2", quantity: 2 }]);
    for (const value of ["PREVIEW", "preview-slug", "preview.example", '"EUR"', "999"]) {
      expect(raw).not.toContain(value);
    }
    expect(cart.lines[0].unitPrice).toEqual({ amount: 2500, currency: "CAD" });
    expect(cart.lines[0].name).toBe("Slides");
  });

  it("refuses an out-of-stock add", async () => {
    const fetch = respond({
      data: {
        cartLinesAdd: {
          cart: null,
          userErrors: [{ code: "MERCHANDISE_OUT_OF_STOCK", message: "Sold out" }],
        },
      },
    });
    await expect(
      createShopifyCartAdapter({ ...config, fetch }).addLine("gid://v/2"),
    ).rejects.toMatchObject({ code: "out-of-stock" });
  });
});

const WITH_CODE = {
  ...CART,
  discountCodes: [{ code: "welcome10", applicable: true }],
  discountAllocations: [
    { code: "welcome10", discountedAmount: { amount: "5.0", currencyCode: "CAD" } },
  ],
};

/** Answers each request in turn. */
function sequence(...bodies: unknown[]) {
  const queue = [...bodies];
  return vi.fn(
    async () => ({ ok: true, status: 200, json: async () => queue.shift() }) as Response,
  );
}

describe("createShopifyCartAdapter coupons", () => {
  it("applies a code and shows what it takes off", async () => {
    const fetch = sequence(
      { data: { cart: CART } },
      { data: { cartDiscountCodesUpdate: { cart: WITH_CODE, userErrors: [] } } },
    );
    const cart = await createShopifyCartAdapter({ ...config, fetch }).applyCoupon("welcome10");
    expect(cart.coupons).toEqual([
      { code: "WELCOME10", label: "WELCOME10", amount: { amount: 500, currency: "CAD" } },
    ]);
    expect(cart.discounts).toEqual({ amount: 500, currency: "CAD" });
    expect(cart.total).toEqual({ amount: 4500, currency: "CAD" });
  });

  it("takes a code that doesn't apply off again and refuses it", async () => {
    const notApplicable = { ...CART, discountCodes: [{ code: "NOPE", applicable: false }] };
    const fetch = sequence(
      { data: { cart: CART } },
      { data: { cartDiscountCodesUpdate: { cart: notApplicable, userErrors: [] } } },
      { data: { cartDiscountCodesUpdate: { cart: CART, userErrors: [] } } },
    );
    await expect(
      createShopifyCartAdapter({ ...config, fetch }).applyCoupon("nope"),
    ).rejects.toMatchObject({ code: "invalid-coupon" });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("allows one code at a time", async () => {
    const fetch = sequence({ data: { cart: WITH_CODE } });
    await expect(
      createShopifyCartAdapter({ ...config, fetch }).applyCoupon("SPRING"),
    ).rejects.toMatchObject({ code: "coupon-limit" });
  });

  it("removes a code", async () => {
    const fetch = sequence(
      { data: { cart: WITH_CODE } },
      { data: { cartDiscountCodesUpdate: { cart: CART, userErrors: [] } } },
    );
    const cart = await createShopifyCartAdapter({ ...config, fetch }).removeCoupon("WELCOME10");
    const body = JSON.parse(
      (fetch.mock.calls[1] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(body.variables.discountCodes).toEqual([]);
    expect(cart.coupons).toEqual([]);
  });
});

describe("toMinorUnits", () => {
  it("follows the currency's own fraction digits", () => {
    expect(toMinorUnits({ amount: "19.99", currencyCode: "EUR" })).toEqual({
      amount: 1999,
      currency: "EUR",
    });
    expect(toMinorUnits({ amount: "1500.0", currencyCode: "JPY" })).toEqual({
      amount: 1500,
      currency: "JPY",
    });
  });
});
