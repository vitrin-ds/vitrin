"use client";

import NextImage from "next/image";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";
import { cn } from "@/lib/cn";
import { LinkButton } from "../link/link";
import { Stepper } from "../stepper/stepper";
import { CartItemName } from "./card-cart-item-parts";

// Figma `Card.CartItem.Minimal` (State=Default) on `.Base.Card.CartItem.Minimal` (31961:3425): the
// single-brand cart drawer line. A 120 × 150 packshot on surface-accent-subtle (the tinted area
// stays without an image, as on Card.Product.Minimal), gap 16, then a column that spreads top to
// bottom: name and price on one row (body-large, text-primary), and at
// the bottom the Small Stepper with the Remove link (Neutral, Small, Underline Hover) at the end.
// Figma has no other state yet. Remove shows when `onRemove` is given (Figma `Show Remove`).

export interface CardCartItemMinimalLabels {
  quantity: (name: string) => string;
  remove: string;
  removeItem: (name: string) => string;
}

export const CARD_CART_ITEM_MINIMAL_LABELS: CardCartItemMinimalLabels = {
  quantity: (name) => `Quantity, ${name}`,
  remove: "Remove",
  removeItem: (name) => `Remove ${name}`,
};

export const CARD_CART_ITEM_MINIMAL_DEFAULTS = { locale: "en" } as const;

export interface CardCartItemMinimalProps {
  /** Figma `Product Name Text`. */
  name: string;
  /** The product page. */
  href: string;
  image?: ImageAsset;
  /** Figma `Price Text`: the line price. */
  price: Money;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Most the customer can order (stock or a per-order limit). */
  maxQuantity?: number;
  /** Figma `Show Remove`: the Remove link shows when given. */
  onRemove?: () => void;
  locale?: string;
  labels?: CardCartItemMinimalLabels;
  className?: string;
}

export function CardCartItemMinimal({
  name,
  href,
  image,
  price,
  quantity,
  onQuantityChange,
  maxQuantity,
  onRemove,
  locale = CARD_CART_ITEM_MINIMAL_DEFAULTS.locale,
  labels = CARD_CART_ITEM_MINIMAL_LABELS,
  className,
}: CardCartItemMinimalProps) {
  return (
    <div data-card="cart-item-minimal" className={cn("flex gap-16", className)}>
      <span className="relative flex h-150 w-120 shrink-0 items-center justify-center overflow-hidden bg-surface-accent-subtle">
        {image && (
          <NextImage
            src={image.src}
            alt={image.alt}
            width={120}
            height={150}
            className="size-full object-contain"
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-8 text-body-lg text-text-primary">
          <h3 className="min-w-0">
            <CartItemName href={href} name={name} />
          </h3>
          <p className="shrink-0 tabular-nums">{formatMoney(price, locale)}</p>
        </div>
        <div className="flex items-center justify-between gap-8">
          <Stepper
            size="sm"
            label={labels.quantity(name)}
            value={quantity}
            min={1}
            max={maxQuantity}
            onValueChange={onQuantityChange}
          />
          {onRemove && (
            <LinkButton
              variant="neutral"
              size="sm"
              underline="hover"
              aria-label={labels.removeItem(name)}
              onClick={onRemove}
            >
              {labels.remove}
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
