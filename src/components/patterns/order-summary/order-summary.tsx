import { useId, type ReactNode } from "react";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { CartItemThumb } from "@/components/ui/card-cart-item/card-cart-item-parts";
import { Link } from "@/components/ui/link/link";
import { Heading, Text } from "@/components/ui/text/text";
import type { OrderTotals } from "./order-totals";

// Figma pattern `Order Summary` (30407:67773; Desktop 31510:5279, Mobile 31510:6026): the totals
// block of cart, checkout and confirmation. Card: 1px border-neutral, radius 8, padding 16, gap
// 16. Inside (gap 8): the title (title-medium), the Card Summary (60px thumbs + "Edit cart",
// checkout only), the Promo Code slot (Coupon pattern) and the Price List (body-small, gap 4:
// labels text-secondary, amounts text-primary, the discount as a negative text-success line);
// then the TOTAL row (title-large, the strongest line, Figma Do), the primary action and the Info
// List. `plain` is the compact block of the Order Confirmation (31511:6058): no card, title-small
// heading and total. Rows are one <dl>; amounts come from computeOrderTotals (order-totals.ts).
// Desktop: the right 4-column aside, sticky (the page places it). Mobile: full-width after the
// main content.

export interface OrderSummaryLabels {
  title: string;
  /** "Subtotal (3 items)". Confirmation uses "Basket Total". */
  subtotal: (itemCount: number) => string;
  shipping: string;
  shippingFree: string;
  /** Shipping is null until a method is chosen. */
  shippingPending: string;
  tax: string;
  total: string;
  editCart: string;
  itemsPreview: string;
  /** Items the thumbnails don't show. */
  moreItems: (count: number) => string;
  moreItemsName: (count: number) => string;
}

export const ORDER_SUMMARY_LABELS: OrderSummaryLabels = {
  title: "Order Summary",
  subtotal: (count) => `Subtotal (${count} ${count === 1 ? "item" : "items"})`,
  shipping: "Shipping",
  shippingFree: "Free",
  shippingPending: "Calculated at checkout",
  tax: "Incl. VAT",
  total: "Total",
  editCart: "Edit cart",
  itemsPreview: "Items in your order",
  moreItems: (count) => `+${count}`,
  moreItemsName: (count) => `and ${count} more ${count === 1 ? "item" : "items"}`,
};

export const ORDER_SUMMARY_DEFAULTS = {
  variant: "card",
  headingLevel: 2,
  locale: "en",
  maxThumbnails: 3,
} as const;

export interface OrderSummaryItem {
  name: string;
  image?: ImageAsset;
}

export interface OrderSummaryProps {
  /** Every amount, from computeOrderTotals / orderTotalsFromOrder. */
  totals: OrderTotals;
  /** Figma `Free Shipping` (cart, WD.09.02.01): the free-shipping progress above the title. */
  lead?: ReactNode;
  /** Figma `Card Summary` (checkout only): the first three items as thumbnails. */
  items?: readonly OrderSummaryItem[];
  /** Figma "Edit cart" link next to the thumbnails. */
  editHref?: string;
  /** Figma `Promo Code` slot: the Coupon pattern. */
  promo?: ReactNode;
  /** Figma `Button` (Filled, Large): Checkout / Pay now. */
  action?: ReactNode;
  /** Figma `Info List`: returns, secure payment, terms. */
  info?: ReactNode;
  /** `card` in cart and checkout, `plain` inside the order confirmation. */
  variant?: "card" | "plain";
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  labels?: OrderSummaryLabels;
  className?: string;
}

export function OrderSummary({
  totals,
  lead,
  items,
  editHref,
  promo,
  action,
  info,
  variant = ORDER_SUMMARY_DEFAULTS.variant,
  headingLevel = ORDER_SUMMARY_DEFAULTS.headingLevel,
  locale = ORDER_SUMMARY_DEFAULTS.locale,
  labels = ORDER_SUMMARY_LABELS,
  className,
}: OrderSummaryProps) {
  const titleId = useId();
  const card = variant === "card";
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col",
        card
          ? "gap-16 rounded-card bg-surface-primary p-16 inset-ring inset-ring-border-neutral"
          : "gap-8",
        className,
      )}
    >
      {lead}
      <div className="flex flex-col gap-8">
        <Heading id={titleId} level={headingLevel} variant={card ? "title-md" : "title-sm"}>
          {labels.title}
        </Heading>
        {items && items.length > 0 && (
          <ItemsPreview items={items} editHref={editHref} labels={labels} />
        )}
        {promo}
        <dl className="flex flex-col gap-4">
          <Row label={labels.subtotal(totals.itemCount)}>
            {formatMoney(totals.subtotal, locale)}
          </Row>
          {totals.discounts.map((discount, index) => (
            <Row
              key={`${discount.code ?? discount.label}-${index}`}
              label={discount.label}
              tone="success"
              padded
            >
              {formatMoney({ ...discount.amount, amount: -discount.amount.amount }, locale)}
            </Row>
          ))}
          <Row label={labels.shipping} padded>
            {totals.shipping === null
              ? labels.shippingPending
              : totals.shipping.amount === 0
                ? labels.shippingFree
                : formatMoney(totals.shipping, locale)}
          </Row>
          {totals.tax && <Row label={labels.tax}>{formatMoney(totals.tax, locale)}</Row>}
          <div className={cn("flex items-center justify-between gap-12", card && "mt-12 py-2")}>
            <Text as="dt" variant={card ? "title-lg" : "title-sm"}>
              {labels.total}
            </Text>
            <Text as="dd" variant={card ? "title-lg" : "title-sm"} numeric>
              {formatMoney(totals.total, locale)}
            </Text>
          </div>
        </dl>
      </div>
      {action}
      {info}
    </section>
  );
}

function Row({
  label,
  tone = "primary",
  padded = false,
  children,
}: {
  label: string;
  tone?: "primary" | "success";
  /** Figma: the discount and shipping rows carry 2px vertical padding. */
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-12", padded && "py-2")}>
      <Text as="dt" variant="body-sm" tone="secondary">
        {label}
      </Text>
      <Text as="dd" variant="body-sm" tone={tone} numeric className="text-right">
        {children}
      </Text>
    </div>
  );
}

function ItemsPreview({
  items,
  editHref,
  labels,
}: {
  items: readonly OrderSummaryItem[];
  editHref?: string;
  labels: OrderSummaryLabels;
}) {
  const shown = items.slice(0, ORDER_SUMMARY_DEFAULTS.maxThumbnails);
  const hidden = items.length - shown.length;
  return (
    <div className="flex items-center justify-between gap-12">
      <ul aria-label={labels.itemsPreview} className="flex items-center gap-8">
        {shown.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex">
            <CartItemThumb
              image={item.image ? { ...item.image, alt: item.image.alt || item.name } : undefined}
              size={60}
            />
            {!item.image && <span className="sr-only">{item.name}</span>}
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <Text variant="label-md" tone="tertiary">
              <span aria-hidden>{labels.moreItems(hidden)}</span>
              <span className="sr-only">{labels.moreItemsName(hidden)}</span>
            </Text>
          </li>
        )}
      </ul>
      {editHref && <Link href={editHref}>{labels.editCart}</Link>}
    </div>
  );
}
