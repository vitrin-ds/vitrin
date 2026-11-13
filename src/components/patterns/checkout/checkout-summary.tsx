"use client";

import type { ReactNode } from "react";
import { CouponField, type CouponFieldApplyResult } from "../coupon-field/coupon-field";
import { OrderSummary } from "@/components/patterns/order-summary/order-summary";
import type { OrderTotals } from "@/components/patterns/order-summary/order-totals";
import { Link } from "@/components/ui/link/link";
import { Text } from "@/components/ui/text/text";
import type { Cart } from "@/lib/api/types/cart";
import { CHECKOUT_LABELS as L } from "./checkout-labels";

// Figma Checkout › Order Detail (31321:6972): Order Summary (card) with the item thumbnails and
// "Edit cart", the applied code (CouponField), Subtotal / Promo / Shipping / Incl. VAT, the total,
// Pay and the legal sentence (Terms of Sale, Privacy Notice).

export interface CheckoutSummaryProps {
  cart: Cart;
  totals: OrderTotals;
  action: ReactNode;
  cartHref: string;
  onApplyCoupon: (code: string) => CouponFieldApplyResult | Promise<CouponFieldApplyResult>;
  onRemoveCoupon: (code: string) => void;
  className?: string;
}

export function CheckoutSummary({
  cart,
  totals,
  action,
  cartHref,
  onApplyCoupon,
  onRemoveCoupon,
  className,
}: CheckoutSummaryProps) {
  return (
    <OrderSummary
      className={className}
      totals={totals}
      items={cart.lines.map((line) => ({ name: line.name, image: line.image }))}
      editHref={cartHref}
      promo={
        <CouponField
          applied={cart.coupons.map((coupon) => coupon.code)}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
        />
      }
      action={action}
      info={
        <Text variant="body-sm" tone="secondary" className="text-center">
          {L.legal.before}
          <Link href="/legal/terms-of-sale" size="inline">
            {L.legal.terms}
          </Link>
          {L.legal.middle}
          <Link href="/legal/privacy-policy" size="inline">
            {L.legal.privacy}
          </Link>
          {L.legal.after}
        </Text>
      }
    />
  );
}
