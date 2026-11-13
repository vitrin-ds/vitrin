"use client";

import { useRef, useState, type ReactNode } from "react";
import { PageHeaderLeft } from "@/components/layout/page-header/page-header";
import { FreeShippingProgress } from "@/components/patterns/order-summary/free-shipping-progress";
import { OrderSummary } from "@/components/patterns/order-summary/order-summary";
import {
  computeOrderTotals,
  freeShippingRemaining,
} from "@/components/patterns/order-summary/order-totals";
import { SectionHeader } from "@/components/patterns/section-header/section-header";
import { BottomActionBar } from "@/components/ui/bottom-action-bar/bottom-action-bar";
import { ButtonLink } from "@/components/ui/button/button";
import { CardCartItemDetailed } from "@/components/ui/card-cart-item/card-cart-item-detailed";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import type { Cart as CartData, CartLine } from "@/lib/api/types/cart";
import { formatMoney } from "@/lib/format/money";
import { CouponField, type CouponFieldApplyResult } from "../coupon-field/coupon-field";

// Block `cart`: the cart page (Figma 09.02 Cart, WD 31321:6906 · WT 31398:18273 · WM 31325:8440;
// empty 31397:19401), driven by props. PageHeader.Left (breadcrumb, h1, item count); the lines as
// Card.CartItem.Detailed in columns 1–8; the order aside in 9–12: free-shipping progress, Order
// Summary with the CouponField, an optional note (e.g. loyalty points), Checkout and an optional
// info list. Below them the recommendations slot and Continue Shopping. Below 1024px the aside
// follows the list and a Bottom Action Bar keeps the total and Checkout in reach. Changes are
// announced in a polite live region; removing a line moves focus to the list.
// ConnectedCart puts it on a CommerceAdapter.

/** Below this many left, a line says "Only n left". */
const LOW_STOCK = 3;

export interface CartLabels {
  breadcrumb: string;
  current: string;
  title: string;
  count: (items: number) => string;
  loading: string;
  lines: string;
  inStock: string;
  onlyLeft: (count: number) => string;
  emptyTitle: string;
  emptyBody: string;
  startShopping: string;
  addToOrder: string;
  addToOrderBody: (amount: string) => string;
  popular: string;
  continueShopping: string;
  promoLabel: (code: string) => string;
  checkout: string;
  total: string;
  announce: {
    quantity: (name: string, quantity: number) => string;
    removed: (name: string) => string;
    saved: (name: string) => string;
  };
}

export const CART_LABELS: CartLabels = {
  breadcrumb: "Breadcrumb",
  current: "Cart",
  title: "Shopping Cart",
  count: (items) => `${items} ${items === 1 ? "item" : "items"}`,
  loading: "Loading your cart…",
  lines: "Items in your cart",
  inStock: "In stock",
  onlyLeft: (count) => `Only ${count} left`,
  emptyTitle: "Your cart is empty",
  emptyBody: "Once you add something, it'll show up here.",
  startShopping: "Start shopping",
  addToOrder: "Add to your order",
  addToOrderBody: (amount) => `Add ${amount} more to unlock free shipping`,
  popular: "Popular right now",
  continueShopping: "Continue Shopping",
  promoLabel: (code) => `Promo · ${code}`,
  checkout: "Checkout",
  total: "Order total",
  announce: {
    quantity: (name, quantity) => `${name}: quantity ${quantity}.`,
    removed: (name) => `${name} removed from your cart.`,
    saved: (name) => `${name} moved to your wishlist.`,
  },
};

export const CART_DEFAULTS = { checkoutHref: "/checkout", shopHref: "/" } as const;

export interface CartProps {
  /** The cart; null while it loads (the loading frame, nothing to interact with). */
  cart: CartData | null;
  onQuantityChange: (lineId: string, quantity: number) => void | Promise<void>;
  onRemove: (lineId: string) => void | Promise<void>;
  /** Shows Save for later on each line when given (e.g. move it to the wishlist). */
  onSaveForLater?: (line: CartLine) => void | Promise<void>;
  /** Validates and applies a promo code; answer with the message to show when it is refused. */
  onApplyCoupon: (code: string) => CouponFieldApplyResult | Promise<CouponFieldApplyResult>;
  onRemoveCoupon: (code: string) => void;
  /** Product cards under the cart ("Add to your order", or "Popular right now" when empty). */
  recommendations?: ReactNode;
  /** Above Checkout in the order aside, e.g. a loyalty points Alert. */
  summaryNote?: ReactNode;
  /** Below Checkout in the order aside, e.g. secure checkout and returns. */
  info?: ReactNode;
  checkoutHref?: string;
  shopHref?: string;
  /** Where a line links to. Defaults to `/p/{slug}`. */
  productHref?: (line: CartLine) => string;
  labels?: CartLabels;
}

const defaultProductHref = (line: CartLine) => `/p/${line.slug}`;

export function Cart({
  cart,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  onApplyCoupon,
  onRemoveCoupon,
  recommendations,
  summaryNote,
  info,
  checkoutHref = CART_DEFAULTS.checkoutHref,
  shopHref = CART_DEFAULTS.shopHref,
  productHref = defaultProductHref,
  labels: L = CART_LABELS,
}: CartProps) {
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef<HTMLHeadingElement>(null);

  const lines = cart?.lines ?? [];
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const empty = cart !== null && lines.length === 0;
  const totals = cart
    ? computeOrderTotals({
        lines: cart.lines,
        discounts: cart.coupons.map((coupon) => ({
          code: coupon.code,
          label: L.promoLabel(coupon.code),
          type: "fixed" as const,
          amount: coupon.amount,
        })),
        shipping: null,
      })
    : null;
  const remaining = cart ? freeShippingRemaining(cart.subtotal, cart.freeShippingThreshold) : null;

  async function changeQuantity(line: CartLine, quantity: number) {
    await onQuantityChange(line.id, quantity);
    setAnnouncement(L.announce.quantity(line.name, quantity));
  }

  async function remove(line: CartLine) {
    await onRemove(line.id);
    setAnnouncement(L.announce.removed(line.name));
    listRef.current?.focus();
  }

  async function saveForLater(line: CartLine) {
    await onSaveForLater?.(line);
    setAnnouncement(L.announce.saved(line.name));
    listRef.current?.focus();
  }

  return (
    <>
      <PageHeaderLeft
        breadcrumb={{ items: [], current: L.current, label: L.breadcrumb }}
        title={L.title}
        // A one-line placeholder keeps the count's line while the cart loads (no layout shift).
        subtitle={cart ? L.count(count) : <Skeleton shape="text" className="w-80" />}
      />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="page-grid gap-y-40 pb-60 desktop:gap-y-60">
        {cart === null && (
          <div className="col-span-full flex flex-col gap-12" aria-busy="true">
            <VisuallyHidden>{L.loading}</VisuallyHidden>
            <div className="h-156">
              <Skeleton shape="block" />
            </div>
            <div className="h-156">
              <Skeleton shape="block" />
            </div>
          </div>
        )}

        {empty && (
          <EmptyState
            className="col-span-full"
            icon="local_mall"
            title={L.emptyTitle}
            body={L.emptyBody}
            primaryAction={{ label: L.startShopping, href: shopHref }}
          />
        )}

        {lines.length > 0 && (
          <section
            aria-labelledby="cart-lines"
            className="col-span-full desktop:col-span-8 desktop:row-start-1"
          >
            <h2 id="cart-lines" ref={listRef} tabIndex={-1} className="sr-only">
              {L.lines}
            </h2>
            <ul>
              {lines.map((line) => (
                <li key={line.id}>
                  <CardCartItemDetailed
                    name={line.name}
                    href={productHref(line)}
                    overline={line.brandName}
                    image={line.image}
                    variantLabels={line.variantTitle ? line.variantTitle.split(" · ") : []}
                    price={line.lineTotal}
                    compareAt={
                      line.compareAtUnitPrice && {
                        amount: line.compareAtUnitPrice.amount * line.quantity,
                        currency: line.compareAtUnitPrice.currency,
                      }
                    }
                    quantity={line.quantity}
                    maxQuantity={line.maxQuantity}
                    onQuantityChange={(quantity) => void changeQuantity(line, quantity)}
                    disclaimer={
                      line.maxQuantity <= LOW_STOCK
                        ? { tone: "warning", text: L.onlyLeft(line.maxQuantity) }
                        : { tone: "success", text: L.inStock }
                    }
                    onSaveForLater={onSaveForLater ? () => void saveForLater(line) : undefined}
                    onRemove={() => void remove(line)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {cart && recommendations && (
          <section
            aria-labelledby="cart-recommendations"
            className="col-span-full flex flex-col gap-20 desktop:col-span-8"
          >
            <SectionHeader
              id="cart-recommendations"
              title={empty ? L.popular : L.addToOrder}
              description={
                !empty && remaining && remaining.amount > 0
                  ? L.addToOrderBody(formatMoney(remaining))
                  : undefined
              }
            />
            {recommendations}
            {!empty && (
              <ButtonLink
                href={shopHref}
                variant="ghost"
                leftIcon="arrow_back"
                className="self-start"
              >
                {L.continueShopping}
              </ButtonLink>
            )}
          </section>
        )}

        {cart && totals && lines.length > 0 && (
          <aside
            aria-label={L.total}
            className="col-span-full desktop:col-span-4 desktop:col-start-9 desktop:row-span-2 desktop:row-start-1"
          >
            <OrderSummary
              className="desktop:sticky desktop:top-24"
              totals={totals}
              lead={
                <FreeShippingProgress
                  subtotal={cart.subtotal}
                  threshold={cart.freeShippingThreshold}
                />
              }
              promo={
                <CouponField
                  applied={cart.coupons.map((coupon) => coupon.code)}
                  onApply={onApplyCoupon}
                  onRemove={onRemoveCoupon}
                />
              }
              action={
                <>
                  {summaryNote}
                  <ButtonLink href={checkoutHref} size="lg" className="w-full">
                    {L.checkout}
                  </ButtonLink>
                </>
              }
              info={info}
            />
          </aside>
        )}
      </div>

      {totals && lines.length > 0 && (
        <BottomActionBar
          className="desktop:hidden"
          label={L.total}
          price={totals.total}
          primaryAction={
            <ButtonLink href={checkoutHref} className="w-full">
              {L.checkout}
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
