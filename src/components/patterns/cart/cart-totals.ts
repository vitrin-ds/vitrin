import {
  computeOrderTotals,
  type OrderDiscountInput,
  type OrderTotals,
} from "@/components/patterns/order-summary/order-totals";
import type { Cart } from "@/lib/api/types/cart";
import type { Money } from "@/lib/api/types/catalog";

// Order Summary totals from a cart, shared by the cart and checkout blocks.

/** VAT included in the EU prices (the checkout's "Incl. VAT" row). */
export const VAT_RATE = 0.2;

const defaultPromoLabel = (code: string) => `Promo · ${code}`;

/** The cart's applied codes as Order Summary discount lines ("Promo · WELCOME10"). */
export function cartDiscounts(
  cart: Pick<Cart, "coupons">,
  promoLabel: (code: string) => string = defaultPromoLabel,
): OrderDiscountInput[] {
  return cart.coupons.map((coupon) => ({
    code: coupon.code,
    label: promoLabel(coupon.code),
    type: "fixed",
    amount: coupon.amount,
  }));
}

/** Order Summary rows for the cart: shipping null until a method is chosen, VAT when asked. */
export function cartTotals(
  cart: Pick<Cart, "lines" | "coupons">,
  shipping: Money | null = null,
  taxRate?: number,
  promoLabel?: (code: string) => string,
): OrderTotals {
  return computeOrderTotals({
    lines: cart.lines,
    discounts: cartDiscounts(cart, promoLabel),
    shipping,
    taxRate,
  });
}
