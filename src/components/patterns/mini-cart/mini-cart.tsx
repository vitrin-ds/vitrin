"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { ButtonLink } from "@/components/ui/button/button";
import {
  CARD_CART_ITEM_COMPACT_LABELS,
  CardCartItemCompact,
  type CardCartItemCompactLabels,
} from "@/components/ui/card-cart-item/card-cart-item-compact";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import { RightSheet } from "@/components/ui/right-sheet/right-sheet";
import { Text } from "@/components/ui/text/text";
import { FreeShippingProgress } from "@/components/patterns/order-summary/free-shipping-progress";
import { TABLET_QUERY, useMediaQuery } from "@/lib/use-media-query";

// Figma pattern `Mini Cart` (30407:67260; Desktop 31510:1416, Mobile 31510:3734). Opened from the
// header cart action after every add-to-bag (Figma Do), without leaving the page. Tablet and up:
// RightSheet (560px, scrim, Esc / scrim / close). Mobile: BottomSheet (Full) with the same content.
// Toolbar: "Cart" + item count. Body: full-bleed Card.CartItem.Compact lines (Type List, last added
// first: pass them in that order) with the quantity pill and the card's icon-only Remove; then the
// sheet's fixed footer bar (gap 12): free-shipping progress (16px local_shipping + body-small,
// Progress 8x, divider below), the Subtotal row (label-small + headline-small, before delivery and
// discounts) and the actions, stacked full width: Checkout (Filled, primary, Figma Do) and View
// cart (Outline). The empty cart has no footer. Quantity and total changes are announced in a
// polite live region; removing a line moves focus to the list (or the body once it is empty).

export interface MiniCartLine {
  id: string;
  /** Figma `Product Name Text`. */
  name: string;
  href: string;
  /** Figma `Overline Text`: brand. */
  overline?: string;
  /** Figma `Product Subtitle Text`: the variant. */
  subtitle?: string;
  image?: ImageAsset;
  /** The line price (unit × quantity). */
  price: Money;
  compareAt?: Money;
  quantity: number;
  /** Stock or per-order limit. */
  maxQuantity?: number;
}

export interface MiniCartLabels {
  title: string;
  itemCount: (count: number) => string;
  items: string;
  freeShippingProgress: string;
  freeShippingRemaining: (amount: string) => string;
  freeShippingReached: string;
  freeShippingValue: (subtotal: string, threshold: string) => string;
  subtotal: string;
  checkout: (subtotal: string) => string;
  viewCart: string;
  emptyTitle: string;
  emptyBody: string;
  continueShopping: string;
  /** Live-region messages. */
  quantityChanged: (name: string, quantity: number) => string;
  removed: (name: string) => string;
  totals: (count: number, subtotal: string) => string;
  close: string;
  back: string;
  line: CardCartItemCompactLabels;
}

export const MINI_CART_LABELS: MiniCartLabels = {
  title: "Cart",
  itemCount: (count) => `${count} ${count === 1 ? "item" : "items"}`,
  items: "Items in your cart",
  freeShippingProgress: "Free shipping progress",
  freeShippingRemaining: (amount) => `Spend ${amount} more for free shipping`,
  freeShippingReached: "You've unlocked free shipping",
  freeShippingValue: (subtotal, threshold) => `${subtotal} of ${threshold}`,
  subtotal: "Subtotal",
  checkout: (subtotal) => `Checkout · ${subtotal}`,
  viewCart: "View cart",
  emptyTitle: "Your cart is empty",
  emptyBody: "Items you add to your cart will appear here.",
  continueShopping: "Continue shopping",
  quantityChanged: (name, quantity) => `${name}: quantity ${quantity}.`,
  removed: (name) => `${name} removed.`,
  totals: (count, subtotal) =>
    `${count} ${count === 1 ? "item" : "items"} in your cart, subtotal ${subtotal}.`,
  close: "Close",
  back: "Back",
  line: CARD_CART_ITEM_COMPACT_LABELS,
};

export const MINI_CART_DEFAULTS = { locale: "en" } as const;

export interface MiniCartProps {
  open: boolean;
  /** Escape, the scrim and the close button call this. */
  onClose: () => void;
  /** Last added first (Figma Do). */
  lines: readonly MiniCartLine[];
  /** Before delivery and discounts. */
  subtotal: Money;
  /** Shows the free-shipping progress when given. */
  freeShippingThreshold?: Money;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  checkoutHref: string;
  cartHref: string;
  /** Empty state's Continue shopping. */
  shopHref: string;
  locale?: string;
  labels?: MiniCartLabels;
}

export function MiniCart({
  open,
  onClose,
  lines,
  labels = MINI_CART_LABELS,
  ...content
}: MiniCartProps) {
  const wide = useMediaQuery(TABLET_QUERY);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtitle = labels.itemCount(count);
  // Following a link (a product, Checkout, View cart, Continue shopping) leaves the sheet: close it,
  // or it would stay open over the next page (client-side navigation keeps the layout mounted).
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a[href]")) onClose();
  };
  const body = (
    <div className="contents" onClickCapture={closeOnLink}>
      <MiniCartContent lines={lines} count={count} labels={labels} {...content} />
    </div>
  );
  const footer =
    lines.length > 0 ? (
      <div className="contents" onClickCapture={closeOnLink}>
        <MiniCartFooter labels={labels} {...content} />
      </div>
    ) : undefined;
  return wide ? (
    <RightSheet
      open={open}
      onClose={onClose}
      title={labels.title}
      subtitle={subtitle}
      footer={footer}
      labels={{ close: labels.close }}
    >
      {body}
    </RightSheet>
  ) : (
    <BottomSheet
      open={open}
      onClose={onClose}
      state="full"
      title={labels.title}
      subtitle={subtitle}
      footer={footer}
      labels={{ close: labels.close, back: labels.back }}
    >
      {body}
    </BottomSheet>
  );
}

type ContentProps = Omit<MiniCartProps, "open" | "onClose" | "labels"> & {
  count: number;
  labels: MiniCartLabels;
};

function MiniCartContent({
  lines,
  count,
  subtotal,
  onQuantityChange,
  onRemove,
  shopHref,
  locale = MINI_CART_DEFAULTS.locale,
  labels,
}: ContentProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastAction = useRef<string | null>(null);
  const focusAfterRemove = useRef(false);
  const [announcement, setAnnouncement] = useState("");
  const formattedSubtotal = formatMoney(subtotal, locale);

  // Announce once the parent has applied the change and the totals are new.
  useEffect(() => {
    const action = lastAction.current;
    if (action === null) return;
    lastAction.current = null;
    setAnnouncement(`${action} ${labels.totals(count, formattedSubtotal)}`);
  }, [count, formattedSubtotal, labels]);

  // The removed line took the focused button with it: continue from the list (or the body).
  useEffect(() => {
    if (!focusAfterRemove.current) return;
    focusAfterRemove.current = false;
    (listRef.current ?? bodyRef.current)?.focus();
  }, [lines.length]);

  function changeQuantity(line: MiniCartLine, quantity: number) {
    // "−" at quantity 1 goes to 0: the line is removed.
    if (quantity === 0) {
      remove(line);
      return;
    }
    lastAction.current = labels.quantityChanged(line.name, quantity);
    onQuantityChange(line.id, quantity);
  }

  function remove(line: MiniCartLine) {
    lastAction.current = labels.removed(line.name);
    focusAfterRemove.current = true;
    onRemove(line.id);
  }

  return (
    <div ref={bodyRef} tabIndex={-1}>
      {lines.length === 0 ? (
        <EmptyState
          icon="local_mall"
          title={labels.emptyTitle}
          body={labels.emptyBody}
          headingLevel={3}
          primaryAction={{ label: labels.continueShopping, href: shopHref }}
          className="m-16"
        />
      ) : (
        <ul ref={listRef} tabIndex={-1} aria-label={labels.items}>
          {lines.map((line) => (
            <li key={line.id}>
              <CardCartItemCompact
                name={line.name}
                href={line.href}
                overline={line.overline}
                subtitle={line.subtitle}
                image={line.image}
                price={line.price}
                compareAt={line.compareAt}
                quantity={line.quantity}
                maxQuantity={line.maxQuantity}
                onQuantityChange={(quantity) => changeQuantity(line, quantity)}
                minQuantity={0}
                locale={locale}
                labels={labels.line}
              />
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

type FooterProps = Pick<
  MiniCartProps,
  "subtotal" | "freeShippingThreshold" | "checkoutHref" | "cartHref" | "locale"
> & { labels: MiniCartLabels };

/** The sheet's fixed footer: free-shipping progress, Subtotal and the two actions. */
function MiniCartFooter({
  subtotal,
  freeShippingThreshold,
  checkoutHref,
  cartHref,
  locale = MINI_CART_DEFAULTS.locale,
  labels,
}: FooterProps) {
  const formattedSubtotal = formatMoney(subtotal, locale);
  return (
    <div className="flex flex-col gap-12">
      {freeShippingThreshold && (
        <FreeShippingProgress
          divided
          subtotal={subtotal}
          threshold={freeShippingThreshold}
          locale={locale}
          labels={{
            progress: labels.freeShippingProgress,
            remaining: labels.freeShippingRemaining,
            reached: labels.freeShippingReached,
            value: labels.freeShippingValue,
          }}
        />
      )}
      <dl className="flex items-center justify-between gap-12 px-8">
        <Text as="dt" variant="label-sm">
          {labels.subtotal}
        </Text>
        <Text as="dd" variant="headline-sm" numeric>
          {formattedSubtotal}
        </Text>
      </dl>
      <div className="flex flex-col gap-12">
        <ButtonLink href={checkoutHref} size="lg" className="w-full">
          {labels.checkout(formattedSubtotal)}
        </ButtonLink>
        <ButtonLink href={cartHref} variant="outline" size="lg" className="w-full">
          {labels.viewCart}
        </ButtonLink>
      </div>
    </div>
  );
}
