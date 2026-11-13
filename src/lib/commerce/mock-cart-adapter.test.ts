import { describe, expect, it } from "vitest";
import type { CartLinePreview } from "./cart-adapter";
import { CommerceError } from "./commerce-error";
import { createMockCartAdapter, emptyCart } from "./mock-cart-adapter";

const PREVIEW: CartLinePreview = {
  productId: "p-1",
  name: "Night Cream",
  slug: "night-cream",
  variantTitle: "50 ml",
  unitPrice: { amount: 2800, currency: "EUR" },
  maxQuantity: 3,
};

describe("createMockCartAdapter", () => {
  it("starts from an empty cart when it is given none", async () => {
    expect(await createMockCartAdapter().getCart()).toEqual(emptyCart());
  });

  it("adds a line from the block's preview, then grows it", async () => {
    const adapter = createMockCartAdapter();
    await adapter.addLine("v-1", 1, { preview: PREVIEW });
    const cart = await adapter.addLine("v-1", 2, { preview: PREVIEW });
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({
      variantId: "v-1",
      name: "Night Cream",
      variantTitle: "50 ml",
      quantity: 3,
      lineTotal: { amount: 8400, currency: "EUR" },
    });
    expect(cart.subtotal).toEqual({ amount: 8400, currency: "EUR" });
  });

  it("refuses more than the preview's limit", async () => {
    const adapter = createMockCartAdapter();
    await adapter.addLine("v-1", 3, { preview: PREVIEW });
    await expect(adapter.addLine("v-1", 1, { preview: PREVIEW })).rejects.toMatchObject({
      code: "quantity-limit",
      max: 3,
    });
  });

  it("adds from its catalog when no preview comes", async () => {
    const adapter = createMockCartAdapter(undefined, { catalog: { "v-1": PREVIEW } });
    const cart = await adapter.addLine("v-1");
    expect(cart.lines[0].name).toBe("Night Cream");
  });

  it("says what to do when it has neither a preview nor a catalog entry", async () => {
    const error = await createMockCartAdapter()
      .addLine("v-9")
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(CommerceError);
    expect((error as CommerceError).code).toBe("unknown-variant");
    expect((error as Error).message).toMatch(/preview.*catalog/);
  });
});
