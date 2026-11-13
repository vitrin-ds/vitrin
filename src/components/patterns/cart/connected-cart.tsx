"use client";

import type { SessionErrorCode } from "@/lib/api/types/errors";
import type { CommerceCartAdapter } from "@/lib/commerce/cart-adapter";
import { CommerceError } from "@/lib/commerce/commerce-error";
import { useCart } from "@/lib/commerce/use-cart";
import { Cart, type CartProps } from "./cart";

// The cart block on a data contract: give it the cart part of a CommerceAdapter (mock, Shopify …)
// and it reads and changes the cart by itself. Quantity and remove are optimistic and roll back
// when the adapter refuses; a refused promo code is shown under the code field.

export interface ConnectedCartProps extends Omit<
  CartProps,
  "cart" | "onQuantityChange" | "onRemove" | "onApplyCoupon" | "onRemoveCoupon"
> {
  adapter: CommerceCartAdapter;
  /** A read or a change failed and the cart rolled back: tell the customer (e.g. a Toast). */
  onError: (error: unknown) => void;
  /** The message under the code field when a code is refused. */
  couponError?: (code: SessionErrorCode) => string;
}

const COUPON_ERRORS: Partial<Record<SessionErrorCode, string>> = {
  "invalid-coupon": "This code isn't valid. Check it and try again.",
  "coupon-not-eligible": "Your order doesn't meet this code's conditions yet.",
  "coupon-limit": "Only one code can be used per order.",
};

const defaultCouponError = (code: SessionErrorCode) =>
  COUPON_ERRORS[code] ?? "Something went wrong. Please try again in a moment.";

export function ConnectedCart({
  adapter,
  onError,
  couponError = defaultCouponError,
  ...props
}: ConnectedCartProps) {
  const { cart, setLineQuantity, removeLine, apply } = useCart(adapter, { onError });

  return (
    <Cart
      {...props}
      cart={cart}
      onQuantityChange={setLineQuantity}
      onRemove={removeLine}
      onApplyCoupon={async (code) => {
        try {
          await apply(() => adapter.applyCoupon(code));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: couponError(error instanceof CommerceError ? error.code : "unavailable"),
          };
        }
      }}
      onRemoveCoupon={(code) => {
        apply(() => adapter.removeCoupon(code)).catch(onError);
      }}
    />
  );
}
