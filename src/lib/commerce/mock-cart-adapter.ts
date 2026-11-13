import type { Cart, CartCoupon, CartLine } from "@/lib/api/types/cart";
import type { Money } from "@/lib/api/types/catalog";
import { optimisticCart } from "@/lib/shop/optimistic-cart";
import type { CartLinePreview, CommerceCartAdapter } from "./cart-adapter";
import { CommerceError } from "./commerce-error";

export interface MockCartOptions {
  /** Codes the mock accepts (upper case) and what each takes off; any other code is refused. */
  coupons?: Readonly<Record<string, Omit<CartCoupon, "code">>>;
  /**
   * Variants the mock can add when a block sends no preview, by variant id. Blocks that know the
   * product (Product List, Product Detail) send a preview, so most projects never need this.
   */
  catalog?: Readonly<Record<string, CartLinePreview>>;
  /** The currency of an empty cart. */
  currency?: string;
}

/** Most of one line the mock lets a customer order when the preview doesn't say. */
const MOCK_MAX_QUANTITY = 10;

/** An empty cart: what the mock starts with when it is given none. */
export function emptyCart(currency = "EUR"): Cart {
  const zero = { amount: 0, currency };
  return {
    id: "mock-cart",
    lines: [],
    subtotal: zero,
    coupons: [],
    discounts: zero,
    shipping: null,
    total: zero,
    freeShippingThreshold: { amount: 5000, currency },
  };
}

const times = (price: Money, quantity: number): Money => ({
  amount: price.amount * quantity,
  currency: price.currency,
});

/** The cart with `quantity` more of a variant: a new line from the preview, or a bigger one. */
function withLine(cart: Cart, variantId: string, quantity: number, preview: CartLinePreview): Cart {
  const existing = cart.lines.find((line) => line.variantId === variantId);
  const max = existing?.maxQuantity ?? preview.maxQuantity ?? MOCK_MAX_QUANTITY;
  const next = (existing?.quantity ?? 0) + quantity;
  if (next > max) throw new CommerceError("quantity-limit", max);
  const line: CartLine = {
    id: existing?.id ?? `line-${variantId}`,
    productId: preview.productId,
    variantId,
    name: preview.name,
    slug: preview.slug,
    brandName: preview.brandName,
    variantTitle: preview.variantTitle,
    image: preview.image,
    quantity: next,
    maxQuantity: max,
    unitPrice: existing?.unitPrice ?? preview.unitPrice,
    compareAtUnitPrice: existing?.compareAtUnitPrice ?? preview.compareAtUnitPrice,
    lineTotal: times(existing?.unitPrice ?? preview.unitPrice, next),
  };
  // Last added first, as the Mini Cart lists them.
  const lines = [line, ...cart.lines.filter((item) => item.variantId !== variantId)];
  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal.amount, 0);
  return { ...cart, lines, subtotal: { amount: subtotal, currency: cart.subtotal.currency } };
}

/** The cart's totals after its coupons: one code at a time, as in the demo store. */
function withCoupons(cart: Cart, coupons: CartCoupon[]): Cart {
  const discount = coupons.reduce((sum, coupon) => sum + coupon.amount.amount, 0);
  const currency = cart.subtotal.currency;
  return {
    ...cart,
    coupons,
    discounts: { amount: discount, currency },
    total: {
      amount: Math.max(cart.subtotal.amount - discount, 0) + (cart.shipping?.amount ?? 0),
      currency,
    },
  };
}

/**
 * An in-memory cart for stories, tests and a first install, before a backend is connected. It
 * changes quantities and lines, takes the coupons it is given, and adds a line from the preview a
 * block sends (or from `catalog`). The mock has no catalogue of its own, so it is the one adapter
 * that builds a line from a preview's price.
 */
export function createMockCartAdapter(
  seed: Cart = emptyCart(),
  { coupons = {}, catalog = {} }: MockCartOptions = {},
): CommerceCartAdapter {
  let cart = seed;
  const apply = async (next: Cart): Promise<Cart> => {
    cart = withCoupons(next, next.coupons);
    return cart;
  };
  return {
    getCart: async () => cart,
    setLineQuantity: (lineId, quantity) =>
      apply(optimisticCart(cart, { type: "quantity", lineId, quantity })),
    removeLine: (lineId) => apply(optimisticCart(cart, { type: "remove", lineId })),
    addLine: async (variantId, quantity = 1, options) => {
      const preview = options?.preview ?? catalog[variantId];
      if (!preview) {
        throw new CommerceError(
          "unknown-variant",
          undefined,
          `The mock cart can't add ${variantId}: give addLine a preview, or give createMockCartAdapter a catalog.`,
        );
      }
      return apply(withLine(cart, variantId, quantity, preview));
    },
    applyCoupon: async (code) => {
      const coupon = coupons[code.trim().toUpperCase()];
      if (!coupon) throw new CommerceError("invalid-coupon");
      if (cart.coupons.length > 0) throw new CommerceError("coupon-limit");
      return apply({ ...cart, coupons: [{ code: code.trim().toUpperCase(), ...coupon }] });
    },
    removeCoupon: (code) =>
      apply({ ...cart, coupons: cart.coupons.filter((coupon) => coupon.code !== code) }),
  };
}
