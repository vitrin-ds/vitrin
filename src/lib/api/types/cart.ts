import type { ImageAsset, Money } from "./catalog";

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  /** Product details at read time, so the cart can render without a catalogue lookup. */
  name: string;
  slug: string;
  brandName?: string;
  /** The variant's option values, e.g. "Rosewood" or "30 ml". */
  variantTitle?: string;
  image?: ImageAsset;
  quantity: number;
  /** Stock or per-line limit, whichever is lower. */
  maxQuantity: number;
  /** Unit price at the time it was added. */
  unitPrice: Money;
  compareAtUnitPrice?: Money;
  /** unitPrice × quantity. */
  lineTotal: Money;
}

/** A promo code on the cart and what it takes off the subtotal. */
export interface CartCoupon {
  /** Upper case, e.g. "WELCOME10". */
  code: string;
  /** "10% off your order" … */
  label: string;
  /** Positive: the amount taken off. */
  amount: Money;
}

export interface Cart {
  id: string;
  /** Last added first (Mini Cart order). */
  lines: CartLine[];
  /** Sum of the line totals (sale prices, before coupons). */
  subtotal: Money;
  /** Applied promo codes; at most one in the mock. */
  coupons: CartCoupon[];
  /** Sum of the coupon amounts, taken off the total. */
  discounts: Money;
  /** Null until a shipping method is known. */
  shipping: Money | null;
  /** subtotal − discounts + shipping (0 until known). */
  total: Money;
  freeShippingThreshold: Money;
}

/** Saved products, newest first. */
export interface Wishlist {
  productIds: string[];
}
