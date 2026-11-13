"use client";

import NextImage from "next/image";
import { cn } from "@/lib/cn";
import type { DropdownOption } from "../dropdown/dropdown";
import { Dropdown } from "../dropdown/dropdown";
import { Icon } from "../icon/icon";
import { Label } from "../label/label";
import { Price } from "../price/price";
import { Rating } from "../rating/rating";
import {
  AddToCartOverlay,
  CARD_COLOR_CLASS,
  ProductImage,
  ProductLink,
  type CardProductBaseProps,
} from "./card-product-parts";

// Figma `Card.Product.Vertical` (State × Color) on `.Base.Card.Product.Vertical`: radius 8, at
// least 382 tall. `Top` is a 200-tall image area (the image covers it) with the promo Label (top
// left), the wishlist button (top right) and the variants summary (bottom left, raised:
// surface-raised + shadow-md). `Bottom` (padding 12 · 16, gap 8) fills the rest: `Details` (gap 4)
// holds the touching 16px stars with the review count (gap 4, 8 below; no average), the category
// (body-small, text-accent) and the name (title-small); Price and the variant Dropdown
// sit at the bottom. Brand (surface-secondary, the default) or White background. Hover: surface-accent-subtle
// with a border-default ring, the content fades to 20% and "Add to cart" appears. The whole card
// links to the product; the wishlist, Dropdown and Add to cart sit above that link. Figma Do:
// choose one variant display (swatches for colour, a count for sizes, the Dropdown for complex
// options).

/** Shown before "+N" (Figma: 5 overlapping 12px swatches). */
const MAX_SWATCHES = 5;

export interface CardProductVerticalLabels {
  addToCart: string;
  addToCartFor: (name: string) => string;
  /** The toggle's fixed name; aria-pressed carries saved / not saved. */
  wishlist: (name: string) => string;
  savedCount: (count: number) => string;
  reviews: (count: number) => string;
  moreSwatches: (count: number) => string;
}

export const CARD_PRODUCT_VERTICAL_LABELS: CardProductVerticalLabels = {
  addToCart: "Add to cart",
  addToCartFor: (name) => `Add to cart: ${name}`,
  wishlist: (name) => `Save ${name} to wishlist`,
  savedCount: (count) => `Saved by ${count}`,
  reviews: (count) => `${count} reviews`,
  moreSwatches: (count) => `${count} more`,
};

export const CARD_PRODUCT_VERTICAL_DEFAULTS = {
  color: "brand",
  locale: "en",
  priority: false,
} as const;

export interface CardProductVerticalProps extends CardProductBaseProps {
  /** Figma `Label`: a promotional label, e.g. "New". */
  label?: string;
  /** Figma `Evaluation`: shown only when there are ratings (Figma Do). */
  rating?: { value: number; reviewCount: number };
  /** Figma `Like Button`. `count` is how many people saved it. */
  wishlist?: { saved: boolean; count?: number; onToggle: () => void };
  /** Figma `Variant is Image`: colour swatches (first five, then "+N"). */
  swatches?: { src: string; name: string }[];
  /** Figma `Variant is Pill`: a short summary, e.g. "4 sizes". */
  variantSummary?: string;
  /** Figma `Dropdown [Variant Selector]`. */
  variantSelect?: {
    label: string;
    options: readonly DropdownOption[];
    value?: string | null;
    onValueChange?: (value: string) => void;
  };
  /** Shows "Add to cart" on hover and keyboard focus. */
  onAddToCart?: () => void;
  labels?: CardProductVerticalLabels;
}

export function CardProductVertical({
  name,
  href,
  category,
  image,
  price,
  compareAt,
  color = CARD_PRODUCT_VERTICAL_DEFAULTS.color,
  locale = CARD_PRODUCT_VERTICAL_DEFAULTS.locale,
  priority = CARD_PRODUCT_VERTICAL_DEFAULTS.priority,
  label,
  rating,
  wishlist,
  swatches,
  variantSummary,
  variantSelect,
  onAddToCart,
  labels = CARD_PRODUCT_VERTICAL_LABELS,
  className,
}: CardProductVerticalProps) {
  const compact = new Intl.NumberFormat(locale, { notation: "compact" });
  const shownSwatches = swatches?.slice(0, MAX_SWATCHES) ?? [];
  const moreSwatches = (swatches?.length ?? 0) - shownSwatches.length;
  const fade = onAddToCart && "group-hover/card:opacity-20";

  return (
    <article
      data-card="product-vertical"
      data-color={color}
      className={cn(
        "group/card relative flex min-h-382 flex-col overflow-hidden rounded-card",
        CARD_COLOR_CLASS[color],
        "hover:bg-surface-accent-subtle hover:inset-ring hover:inset-ring-border-default",
        className,
      )}
    >
      <div className={cn("relative", fade)}>
        <ProductImage
          image={image}
          ratio="card"
          sizes="(min-width: 1024px) 240px, 50vw"
          priority={priority}
        />
        {label && <Label className="absolute top-12 left-12">{label}</Label>}
        {(shownSwatches.length > 0 || variantSummary) && (
          <p
            className={cn(
              "absolute bottom-24 left-12 flex h-24 items-center gap-6 rounded-8 px-6",
              "bg-surface-raised text-label-sm text-text-primary shadow-md",
            )}
          >
            {shownSwatches.length > 0 && (
              <span className="flex items-center gap-4">
                <span className="flex">
                  {shownSwatches.map((swatch, i) => (
                    <NextImage
                      key={swatch.name}
                      src={swatch.src}
                      alt={swatch.name}
                      width={12}
                      height={12}
                      className={cn("size-12 rounded-full object-cover", i > 0 && "-ml-4")}
                    />
                  ))}
                </span>
                {moreSwatches > 0 && (
                  <>
                    <span aria-hidden>+{moreSwatches}</span>
                    <span className="sr-only">{labels.moreSwatches(moreSwatches)}</span>
                  </>
                )}
              </span>
            )}
            {variantSummary && <span>{variantSummary}</span>}
          </p>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-8 px-12 py-16", fade)}>
        <div className="flex flex-1 flex-col gap-4">
          {rating && (
            <p className="flex flex-wrap items-center gap-4 pb-8">
              <Rating value={rating.value} size="sm" display="stars" locale={locale} />
              <span className="text-label-sm text-text-primary">
                <span aria-hidden>({compact.format(rating.reviewCount)})</span>
                <span className="sr-only">{labels.reviews(rating.reviewCount)}</span>
              </span>
            </p>
          )}
          {category && <p className="text-body-sm text-text-accent">{category}</p>}
          <h3 className="text-title-sm">
            <ProductLink href={href} name={name} />
          </h3>
        </div>
        <Price price={price} compareAt={compareAt} locale={locale} />
        {variantSelect && (
          <Dropdown
            label={variantSelect.label}
            hideLabel
            size="sm"
            options={variantSelect.options}
            value={variantSelect.value}
            onValueChange={variantSelect.onValueChange}
            className="relative z-10"
          />
        )}
      </div>

      {/* Outside the faded layers: the hover fade (opacity) makes a stacking context that
          would put the product link's ::after above the button. Above the Add to cart overlay. */}
      {wishlist && (
        <span
          className={cn(
            "absolute top-12 right-8 z-30 flex items-center gap-2 text-label-sm text-text-primary",
            fade,
          )}
        >
          {wishlist.count !== undefined && (
            <span>
              <span aria-hidden>{compact.format(wishlist.count)}</span>
              <span className="sr-only">{labels.savedCount(wishlist.count)}</span>
            </span>
          )}
          <button
            type="button"
            aria-pressed={wishlist.saved}
            aria-label={labels.wishlist(name)}
            onClick={wishlist.onToggle}
            className="relative flex cursor-pointer rounded-4 before:absolute before:-inset-14"
          >
            <Icon name="favorite" size="16" fill={wishlist.saved} tone="accent" />
          </button>
        </span>
      )}

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
