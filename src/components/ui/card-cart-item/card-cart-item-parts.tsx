import NextImage from "next/image";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";

// Pieces shared by Card.CartItem.Compact and .Detailed: the props both take and the product
// thumbnail (surface-primary, 1px border-default as an inset outline, radius 4; a placeholder
// glyph when the image is missing).

export interface CardCartItemBaseProps {
  /** Figma `Product Name Text`. */
  name: string;
  /** The product page. */
  href: string;
  /** Figma `Overline Text`: brand or product code. */
  overline?: string;
  image?: ImageAsset;
  /** Figma `Label [1]`, `Label [2]`: the selected variant values (shade, size). Max two. */
  variantLabels?: readonly string[];
  /** Figma `Price Text`: the line price. */
  price: Money;
  /** Figma `Before Discount Price Text`: only when the item is discounted. */
  compareAt?: Money;
  /** Figma `Item Count Text`. */
  quantity: number;
  /** Figma `Strapper Actions`: shown when given (an editable cart). */
  onQuantityChange?: (quantity: number) => void;
  /** Most the customer can order (stock or a per-order limit). */
  maxQuantity?: number;
  /** Figma `Type`: List (stacked rows) · Card (bordered). */
  type?: "list" | "card";
  locale?: string;
  className?: string;
}

export const CART_ITEM_TYPE_CLASS = {
  list: "border-b border-border-neutral",
  card: "rounded-card inset-ring inset-ring-border-neutral",
} as const;

/**
 * Figma Hover & Tap: the interactive-subtle-hover fill, the border in the same colour. On that
 * fill text-tertiary is 4.28:1, so tertiary text in a hoverable list card turns text-secondary
 * with it (`group-hover/card:text-text-secondary`), as on surface-accent-subtle, where text-tertiary fails AA.
 */
export const CART_ITEM_HOVER_CLASS = {
  list: "hover:border-interactive-subtle-hover hover:bg-interactive-subtle-hover",
  card: "hover:bg-interactive-subtle-hover hover:inset-ring-interactive-subtle-hover",
} as const;

export function CartItemThumb({
  image,
  size,
  disabled = false,
}: {
  image?: ImageAsset;
  size: 60 | 80;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-4 bg-surface-primary",
        "outline -outline-offset-1",
        disabled ? "outline-border-disabled" : "outline-border-default",
        size === 60 ? "size-60" : "size-80",
      )}
    >
      {image ? (
        <NextImage
          src={image.src}
          alt={image.alt}
          width={size}
          height={size}
          className="size-full object-contain"
        />
      ) : (
        <span aria-hidden data-placeholder className="size-full add-image" />
      )}
    </span>
  );
}

export function CartItemName({
  href,
  name,
  className,
}: {
  href: string;
  name: string;
  className?: string;
}) {
  return (
    <NextLink href={href} className={cn("block truncate rounded-4 hover:underline", className)}>
      {name}
    </NextLink>
  );
}
