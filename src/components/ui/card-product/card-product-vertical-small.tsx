"use client";

import { cn } from "@/lib/cn";
import { Label } from "../label/label";
import { Price } from "../price/price";
import {
  AddToCartOverlay,
  CARD_COLOR_CLASS,
  ProductImage,
  ProductLink,
  type CardProductBaseProps,
} from "./card-product-parts";

// Figma `Card.Product.Vertical.Small` (State × Color): the light card for carousels, mega menus and
// recommendations. Radius 8, at least 300 tall, a 4:3 image area (covered by the image) with the promo Label, then padding 16 · 12
// · 20 with category (body-small, text-accent) + name (title-small) and the Price at the bottom.
// No variants, rating or wishlist (Figma Don't: switch to Card.Product.Vertical for those). Hover
// as in Card.Product.Vertical. Brand (surface-secondary) by default, White on request.

export interface CardProductVerticalSmallLabels {
  addToCart: string;
  addToCartFor: (name: string) => string;
}

export const CARD_PRODUCT_VERTICAL_SMALL_LABELS: CardProductVerticalSmallLabels = {
  addToCart: "Add to cart",
  addToCartFor: (name) => `Add to cart: ${name}`,
};

export const CARD_PRODUCT_VERTICAL_SMALL_DEFAULTS = { color: "brand", locale: "en" } as const;

export interface CardProductVerticalSmallProps extends CardProductBaseProps {
  /** Figma `Label`, e.g. "New". */
  label?: string;
  /** Shows "Add to cart" on hover and keyboard focus. */
  onAddToCart?: () => void;
  labels?: CardProductVerticalSmallLabels;
}

export function CardProductVerticalSmall({
  name,
  href,
  category,
  image,
  price,
  compareAt,
  color = CARD_PRODUCT_VERTICAL_SMALL_DEFAULTS.color,
  locale = CARD_PRODUCT_VERTICAL_SMALL_DEFAULTS.locale,
  label,
  onAddToCart,
  labels = CARD_PRODUCT_VERTICAL_SMALL_LABELS,
  className,
}: CardProductVerticalSmallProps) {
  const fade = onAddToCart && "group-hover/card:opacity-20";
  return (
    <article
      data-card="product-vertical-small"
      data-color={color}
      className={cn(
        "group/card relative flex min-h-300 flex-col overflow-hidden rounded-card",
        CARD_COLOR_CLASS[color],
        "hover:bg-surface-accent-subtle hover:inset-ring hover:inset-ring-border-default",
        className,
      )}
    >
      <div className={cn("relative", fade)}>
        <ProductImage image={image} ratio="4/3" sizes="(min-width: 1024px) 240px, 50vw" />
        {label && <Label className="absolute top-12 left-12">{label}</Label>}
      </div>
      <div className={cn("flex flex-1 flex-col justify-between gap-12 px-12 pt-16 pb-20", fade)}>
        <div className="flex flex-col gap-4">
          {category && <p className="text-body-sm text-text-accent">{category}</p>}
          <h3 className="text-title-sm">
            <ProductLink href={href} name={name} />
          </h3>
        </div>
        <Price price={price} compareAt={compareAt} locale={locale} />
      </div>
      {onAddToCart && (
        <AddToCartOverlay
          label={labels.addToCart}
          name={labels.addToCartFor(name)}
          onClick={onAddToCart}
        />
      )}
    </article>
  );
}
