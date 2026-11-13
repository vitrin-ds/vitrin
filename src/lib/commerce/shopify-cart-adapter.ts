import type { Cart, CartLine } from "@/lib/api/types/cart";
import type { Money } from "@/lib/api/types/catalog";
import type { SessionErrorCode } from "@/lib/api/types/errors";
import type { CommerceCartAdapter } from "./cart-adapter";
import { CommerceError } from "./commerce-error";

// The Shopify Storefront API behind CommerceCartAdapter: read the cart, add, change and remove
// lines, apply and remove discount codes. Shipping is not known before Shopify's checkout, so the
// cart's `shipping` stays null. A refused change (Shopify `userErrors`, a code that doesn't
// apply) rejects with a CommerceError; a failed request with a plain Error.

/** Shown when the API gives no stock figure: the line has no known limit. */
const UNKNOWN_STOCK_LIMIT = 99;
/** Shopify's name for the variant of a product that has no options. */
const NO_OPTIONS_TITLE = "Default Title";

const CART_FIELDS = `
  id
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText width height }
            product { id title handle vendor }
          }
        }
        discountAllocations { ...Allocation }
      }
    }
  }
  discountCodes { code applicable }
  discountAllocations { ...Allocation }
  cost { subtotalAmount { amount currencyCode } }
`;

const ALLOCATION = `fragment Allocation on CartDiscountAllocation {
  discountedAmount { amount currencyCode }
  ... on CartCodeDiscountAllocation { code }
}`;

const PAYLOAD = `cart { ${CART_FIELDS} } userErrors { code message }`;

const GET_CART = `query ($cartId: ID!) { cart(id: $cartId) { ${CART_FIELDS} } } ${ALLOCATION}`;
const ADD_LINES = `mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) { ${PAYLOAD} }
} ${ALLOCATION}`;
const UPDATE_LINES = `mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) { ${PAYLOAD} }
} ${ALLOCATION}`;
const REMOVE_LINES = `mutation ($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${PAYLOAD} }
} ${ALLOCATION}`;
const UPDATE_CODES = `mutation ($cartId: ID!, $discountCodes: [String!]!) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { ${PAYLOAD} }
} ${ALLOCATION}`;

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyAllocation {
  discountedAmount: ShopifyMoney;
  /** Set on allocations that come from a discount code. */
  code?: string;
}

interface ShopifyLine {
  id: string;
  quantity: number;
  discountAllocations?: ShopifyAllocation[];
  merchandise: {
    id: string;
    title: string;
    quantityAvailable: number | null;
    price: ShopifyMoney;
    compareAtPrice: ShopifyMoney | null;
    image: { url: string; altText: string | null; width: number; height: number } | null;
    product: { id: string; title: string; handle: string; vendor: string };
  };
}

interface ShopifyCart {
  id: string;
  lines: { edges: { node: ShopifyLine }[] };
  discountCodes?: { code: string; applicable: boolean }[];
  discountAllocations?: ShopifyAllocation[];
  cost: { subtotalAmount: ShopifyMoney };
}

interface ShopifyUserError {
  code?: string | null;
  message: string;
}

interface CartPayload {
  cart: ShopifyCart | null;
  userErrors: ShopifyUserError[];
}

export interface ShopifyCartAdapterConfig {
  /** The shop's Storefront GraphQL endpoint. */
  endpoint: string;
  cartId: string;
  /** Public Storefront access token. */
  storefrontToken?: string;
  /** The shop's free-shipping threshold; Shopify's cart does not carry one. */
  freeShippingThreshold?: Money;
  fetch?: typeof globalThis.fetch;
}

/** "19.99" → 1999: our Money is in minor units, with the currency's own fraction digits. */
export function toMinorUnits({ amount, currencyCode }: ShopifyMoney): Money {
  const digits =
    new Intl.NumberFormat("en", { style: "currency", currency: currencyCode }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  return { amount: Math.round(Number(amount) * 10 ** digits), currency: currencyCode };
}

function toCartLine({ id, quantity, merchandise }: ShopifyLine): CartLine {
  const { product, image, price, compareAtPrice } = merchandise;
  const unitPrice = toMinorUnits(price);
  return {
    id,
    productId: product.id,
    variantId: merchandise.id,
    name: product.title,
    slug: product.handle,
    brandName: product.vendor,
    variantTitle: merchandise.title === NO_OPTIONS_TITLE ? undefined : merchandise.title,
    image: image
      ? {
          src: image.url,
          alt: image.altText ?? product.title,
          width: image.width,
          height: image.height,
        }
      : undefined,
    quantity,
    maxQuantity: merchandise.quantityAvailable ?? UNKNOWN_STOCK_LIMIT,
    unitPrice,
    compareAtUnitPrice: compareAtPrice ? toMinorUnits(compareAtPrice) : undefined,
    lineTotal: { amount: unitPrice.amount * quantity, currency: unitPrice.currency },
  };
}

/** The applied codes with what each takes off (cart-level and line-level allocations). */
function toCoupons(cart: ShopifyCart, currency: string) {
  const allocations = [
    ...(cart.discountAllocations ?? []),
    ...cart.lines.edges.flatMap(({ node }) => node.discountAllocations ?? []),
  ];
  return (cart.discountCodes ?? [])
    .filter((discount) => discount.applicable)
    .map(({ code }) => ({
      code: code.toUpperCase(),
      label: code.toUpperCase(),
      amount: {
        amount: allocations
          .filter((allocation) => allocation.code?.toUpperCase() === code.toUpperCase())
          .reduce((sum, allocation) => sum + toMinorUnits(allocation.discountedAmount).amount, 0),
        currency,
      },
    }));
}

function toCart(cart: ShopifyCart, threshold: Money | undefined): Cart {
  const subtotal = toMinorUnits(cart.cost.subtotalAmount);
  const zero: Money = { amount: 0, currency: subtotal.currency };
  const coupons = toCoupons(cart, subtotal.currency);
  const discounts = coupons.reduce((sum, coupon) => sum + coupon.amount.amount, 0);
  return {
    id: cart.id,
    lines: cart.lines.edges.map(({ node }) => toCartLine(node)),
    subtotal,
    coupons,
    discounts: { amount: discounts, currency: subtotal.currency },
    shipping: null,
    total: { amount: Math.max(0, subtotal.amount - discounts), currency: subtotal.currency },
    freeShippingThreshold: threshold ?? zero,
  };
}

/** Shopify's CartErrorCode → ours, so blocks show the same copy on every backend. */
export function toErrorCode(code: string | null | undefined): SessionErrorCode {
  const value = (code ?? "").toUpperCase();
  if (value.includes("OUT_OF_STOCK")) return "out-of-stock";
  if (value.includes("NOT_ENOUGH_STOCK") || value.includes("MAXIMUM")) return "quantity-limit";
  if (value.includes("MERCHANDISE")) return "unknown-variant";
  if (value.includes("LINE")) return "unknown-line";
  if (value.includes("QUANTITY") || value.includes("LESS_THAN") || value.includes("GREATER_THAN")) {
    return "invalid-quantity";
  }
  if (value.includes("DISCOUNT")) return "invalid-coupon";
  return "unavailable";
}

export function createShopifyCartAdapter({
  endpoint,
  cartId,
  storefrontToken,
  freeShippingThreshold,
  fetch: request = globalThis.fetch,
}: ShopifyCartAdapterConfig): CommerceCartAdapter {
  async function send<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(storefrontToken ? { "X-Shopify-Storefront-Access-Token": storefrontToken } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new Error(`Shopify request failed: ${response.status}`);
    const { data, errors } = (await response.json()) as {
      data?: T;
      errors?: { message: string }[];
    };
    if (errors?.length) throw new Error(errors.map((error) => error.message).join("; "));
    if (!data) throw new Error("Shopify returned no data");
    return data;
  }

  function fromMutation(payload: CartPayload): Cart {
    const [error] = payload.userErrors;
    if (error) throw new CommerceError(toErrorCode(error.code));
    if (!payload.cart) throw new Error("Shopify returned no cart");
    return toCart(payload.cart, freeShippingThreshold);
  }

  return {
    getCart,
    async addLine(variantId, quantity = 1) {
      const data = await send<{ cartLinesAdd: CartPayload }>(ADD_LINES, {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      });
      return fromMutation(data.cartLinesAdd);
    },
    async setLineQuantity(lineId, quantity) {
      const data = await send<{ cartLinesUpdate: CartPayload }>(UPDATE_LINES, {
        cartId,
        lines: [{ id: lineId, quantity }],
      });
      return fromMutation(data.cartLinesUpdate);
    },
    async removeLine(lineId) {
      const data = await send<{ cartLinesRemove: CartPayload }>(REMOVE_LINES, {
        cartId,
        lineIds: [lineId],
      });
      return fromMutation(data.cartLinesRemove);
    },
    async applyCoupon(code) {
      const current = await getCart();
      const wanted = code.trim().toUpperCase();
      if (current.coupons.some((coupon) => coupon.code === wanted)) return current;
      // One code per order, as in the mock: the cart blocks show one field.
      if (current.coupons.length > 0) throw new CommerceError("coupon-limit");
      const cart = await setCodes([wanted]);
      if (cart.coupons.some((coupon) => coupon.code === wanted)) return cart;
      // Shopify keeps a code that doesn't apply on the cart; take it off again.
      await setCodes([]);
      throw new CommerceError("invalid-coupon");
    },
    async removeCoupon(code) {
      const current = await getCart();
      const wanted = code.trim().toUpperCase();
      return setCodes(current.coupons.map((c) => c.code).filter((c) => c !== wanted));
    },
  };

  async function getCart(): Promise<Cart> {
    const { cart } = await send<{ cart: ShopifyCart | null }>(GET_CART, { cartId });
    if (!cart) throw new Error(`Cart not found: ${cartId}`);
    return toCart(cart, freeShippingThreshold);
  }

  async function setCodes(discountCodes: string[]): Promise<Cart> {
    const data = await send<{ cartDiscountCodesUpdate: CartPayload }>(UPDATE_CODES, {
      cartId,
      discountCodes,
    });
    return fromMutation(data.cartDiscountCodesUpdate);
  }
}
