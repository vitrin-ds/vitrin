"use client";

import { useState, type ReactNode } from "react";
import { ProductGallery } from "@/components/patterns/product-gallery/product-gallery";
import { Icon } from "@/components/ui/icon/icon";
import { Label } from "@/components/ui/label/label";
import { Link } from "@/components/ui/link/link";
import { Rating } from "@/components/ui/rating/rating";
import type { Money, Product, ProductVariant } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { formatDiscount } from "@/lib/format/discount";
import { discountPercent, variantTitle } from "./product-detail-helpers";
import { PRODUCT_DETAIL_LABELS, type ProductDetailLabels } from "./product-detail-labels";
import { PurchasePanel } from "./purchase-panel";

// 06.01 Product Detail, the "main product" section (Figma 31215:29030): the Product Gallery
// (676 on desktop) next to the "Right" column (676, gap 24): brand, wishlist count, name and
// review score; the purchase panel (prices, variant, stock, quantity, Add to Cart, Buy Now); the
// trust row; Key Benefits; then `children` (the site's delivery / payment accordions …). The
// selected variant is state here: the gallery shows a shade's own images, the prices and stock
// follow, and `onVariantChange` (default: `?variant=` with replaceState) keeps the URL shareable.
// Data comes in as a catalogue `Product`; adding goes out through `onAddToCart`. Place it in a
// `page-grid` (it spans the row as a subgrid).

export interface ProductDetailLine {
  variantId: string;
  quantity: number;
}

export interface ProductDetailProps {
  product: Product;
  /** The brand above the name, linked when `href` is given. */
  brand?: { name: string; href?: string };
  /** The variant to show first (e.g. from `?variant=`); default the first in stock. */
  initialVariantId?: string;
  /**
   * Adds a line to the cart. `buyNow` is true for the Buy Now button: go to checkout after it
   * (and don't open a mini cart). Reject or resolve false when it did not go through.
   */
  onAddToCart: (
    line: ProductDetailLine,
    options: { buyNow: boolean; title: string },
  ) => Promise<boolean | void>;
  /** Shows Buy Now; called after its add went through. */
  onBuyNow?: () => void;
  /** Called with the new variant id; default writes `?variant=` with history.replaceState. */
  onVariantChange?: (variantId: string) => void;
  /** The gallery's Favourite action: shown when given. */
  wishlist?: { saved: boolean; onToggle: () => void };
  /** "Read all" next to the review score. */
  reviewsHref?: string;
  /** Member price row under the price (a loyalty card): shown when given. */
  memberPrice?: (price: Money) => Money;
  /** Trust row under the buttons (returns, secure payment, authentic). */
  trust?: boolean;
  /** Below Key Benefits in the right column: delivery, payment, details … */
  children?: ReactNode;
  /** Number formatting (counts, percentages). */
  locale?: string;
  labels?: ProductDetailLabels;
  className?: string;
}

export const PRODUCT_DETAIL_DEFAULTS = { trust: true, locale: "en" } as const;

/** The variant to show first: the given one, else the first in stock, else the first. */
export function initialVariant(product: Pick<Product, "variants">, id?: string): ProductVariant {
  const variants = product.variants;
  if (variants.length === 0) throw new Error("ProductDetail: a product needs at least one variant");
  return (
    variants.find((variant) => variant.id === id) ??
    variants.find((variant) => variant.stock !== "out-of-stock") ??
    variants[0]!
  );
}

function writeVariantParam(variantId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("variant", variantId);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function ProductDetail({
  product,
  brand,
  initialVariantId,
  onAddToCart,
  onBuyNow,
  onVariantChange = writeVariantParam,
  wishlist,
  reviewsHref,
  memberPrice,
  trust = PRODUCT_DETAIL_DEFAULTS.trust,
  children,
  locale = PRODUCT_DETAIL_DEFAULTS.locale,
  labels: L = PRODUCT_DETAIL_LABELS,
  className,
}: ProductDetailProps) {
  const [variant, setVariant] = useState(() => initialVariant(product, initialVariantId));

  function select(id: string) {
    const next = product.variants.find((item) => item.id === id);
    if (!next) return;
    setVariant(next);
    onVariantChange(id);
  }

  async function add(quantity: number, buyNow: boolean) {
    const title =
      product.variants.length > 1 ? `${product.name}, ${variantTitle(variant)}` : product.name;
    const added = await onAddToCart({ variantId: variant.id, quantity }, { buyNow, title });
    if (added !== false && buyNow) onBuyNow?.();
  }

  return (
    <div className={cn("col-span-full grid grid-cols-subgrid gap-y-20", className)}>
      <ProductGallery
        images={variant.images ?? product.images}
        priority
        badges={<ProductBadges product={product} variant={variant} locale={locale} labels={L} />}
        wishlist={wishlist}
        className="col-span-full desktop:col-span-6 desktop:self-start"
      />
      <div className="col-span-full flex flex-col gap-24 desktop:col-span-6">
        <ProductTitle
          product={product}
          brand={brand}
          reviewsHref={reviewsHref}
          locale={locale}
          labels={L}
        />
        <PurchasePanel
          key={variant.id}
          variants={product.variants}
          variant={variant}
          onVariantChange={select}
          onAdd={add}
          buyNow={Boolean(onBuyNow)}
          memberPrice={memberPrice}
          labels={L}
        />
        {trust && <TrustRow labels={L} />}
        {product.content && product.content.benefits.length > 0 && (
          <KeyBenefits benefits={product.content.benefits} labels={L} />
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Figma Product Image `Labels` (top right, gap 8): New (Label Default), the discount (Label
 * Accent, e.g. "41%"), Vegan (Label Success), then the other badges (Default).
 */
function ProductBadges({
  product,
  variant,
  locale,
  labels: L,
}: {
  product: Product;
  variant: ProductVariant;
  locale: string;
  labels: ProductDetailLabels;
}) {
  const discount = discountPercent(variant);
  if (product.badges.length === 0 && discount === 0) return null;
  const percent = discount > 0 && (
    <Label key="discount" color="accent">
      {formatDiscount(discount, locale)}
    </Label>
  );
  return (
    <>
      {product.badges.map((badge) =>
        badge === "sale" ? (
          percent
        ) : (
          <Label key={badge} color={badge === "vegan" ? "success" : "default"}>
            {L.badges[badge]}
          </Label>
        ),
      )}
      {!product.badges.includes("sale") && percent}
    </>
  );
}

/**
 * Figma `Brand & Product Title & Evaluation` (gap 8): the brand (label-large text-accent) and the
 * wishlist count (favorite Fill=Off + "N saved", gap 8) on one row; the name (headline-medium);
 * Reviews Scores (gap 16, label-small): touching stars + "(4.0)", the count, "Read all" with a
 * 12px arrow.
 */
function ProductTitle({
  product,
  brand,
  reviewsHref,
  locale,
  labels: L,
}: {
  product: Product;
  brand?: ProductDetailProps["brand"];
  reviewsHref?: string;
  locale: string;
  labels: ProductDetailLabels;
}) {
  const format = new Intl.NumberFormat(locale);
  const saved = format.format(product.savedCount ?? 0);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-16">
        {brand &&
          (brand.href ? (
            <Link href={brand.href} underline="hover">
              {brand.name}
            </Link>
          ) : (
            <p className="text-label-lg text-text-accent">{brand.name}</p>
          ))}
        {product.savedCount !== undefined && (
          <p className="ms-auto flex items-center gap-8 text-label-lg text-text-accent">
            <Icon name="favorite" fill={false} />
            <span aria-hidden>{L.saved(saved)}</span>
            <span className="sr-only">{L.savedName(saved)}</span>
          </p>
        )}
      </div>
      <h1 className="text-headline-md text-text-primary">{product.name}</h1>
      <p className="flex flex-wrap items-center gap-16 text-label-sm text-text-primary">
        {product.reviewCount > 0 ? (
          <>
            <Rating value={product.rating} size="sm" display="compact" locale={locale} />
            <span>{L.reviewCount(format.format(product.reviewCount), product.reviewCount)}</span>
            {reviewsHref && (
              <Link
                href={reviewsHref}
                size="xs"
                underline="hover"
                aria-label={L.readAllReviewsName(product.name)}
                className="inline-flex items-center gap-4"
              >
                {L.readAllReviews}
                <Icon name="arrow_forward" size="sm" tone="current" />
              </Link>
            )}
          </>
        ) : (
          <span>{L.noReviews}</span>
        )}
      </p>
    </div>
  );
}

function TrustRow({ labels: L }: { labels: ProductDetailLabels }) {
  const items = [
    ["undo", L.trust.returns, true],
    ["lock", L.trust.payment, false],
    ["verified", L.trust.authentic, false],
  ] as const;
  return (
    <ul className="flex flex-col gap-20 py-20 tablet:flex-row">
      {items.map(([icon, text, filled]) => (
        <li key={icon} className="flex items-center gap-4 text-body-md text-text-primary">
          {/* Figma puts the verified mark after its text. */}
          {icon !== "verified" && <Icon name={icon} weight={200} fill={filled} />}
          {text}
          {icon === "verified" && <Icon name={icon} weight={200} fill={filled} />}
        </li>
      ))}
    </ul>
  );
}

/** Key Benefits: a 1px border-neutral rule, padding-top 24, title-small over a bullet list. */
function KeyBenefits({
  benefits,
  labels: L,
}: {
  benefits: readonly string[];
  labels: ProductDetailLabels;
}) {
  return (
    <section
      aria-labelledby="pdp-benefits"
      className="flex flex-col gap-8 border-t border-border-neutral pt-24 text-text-primary"
    >
      <h2 id="pdp-benefits" className="text-title-sm">
        {L.keyBenefits}
      </h2>
      <ul className="flex list-disc flex-col gap-12 ps-24 text-body-lg">
        {benefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </section>
  );
}
