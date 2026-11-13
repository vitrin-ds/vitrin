import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { Button } from "../button/button";
import { Image } from "../image/image";

// Pieces shared by the Card.Product family: the props every card takes, the product link that
// makes the whole card clickable (its ::after covers the card; other controls sit above it), the
// image frame with a placeholder for missing images, and the hover "Add to cart" overlay.

export interface CardProductBaseProps {
  /** Figma `Product Name Text`. */
  name: string;
  /** The product page. */
  href: string;
  /** Figma `Category Name Text`. */
  category?: string;
  /** The card image (1:1 product shots on white); a placeholder shows when it's missing. */
  image?: ImageAsset;
  /** Figma `Price Text`. */
  price: Money;
  /** Figma `Before Discount Text`: only when the product is on sale. */
  compareAt?: Money;
  /**
   * Figma `Color`: Brand (surface-secondary, the default: every card on the Figma WEB pages) or
   * White (surface-primary), only where a design asks for it.
   */
  color?: "white" | "brand";
  /**
   * Code only: the image can be the page's LCP (the first cards of a product grid). Loads it
   * eagerly at high fetch priority (DS Image `priority`); every other card image stays lazy.
   */
  priority?: boolean;
  locale?: string;
  className?: string;
}

export const CARD_COLOR_CLASS = {
  white: "bg-surface-primary",
  brand: "bg-surface-secondary",
} as const;

export function ProductLink({
  href,
  name,
  className,
}: {
  href: string;
  name: string;
  className?: string;
}) {
  return (
    <NextLink
      href={href}
      className={cn(
        "rounded-4 text-title-sm text-text-primary after:absolute after:inset-0",
        className,
      )}
    >
      {name}
    </NextLink>
  );
}

export function ProductImage({
  image,
  ratio,
  sizes,
  priority = false,
  className,
}: {
  image?: ImageAsset;
  /** `card`: Card.Product.Vertical's 200-tall image area. */
  ratio: "1/1" | "6/5" | "4/3" | "card";
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image) {
    return (
      <span
        className={cn(
          "flex w-full add-image",
          { "1/1": "aspect-square", "6/5": "aspect-6/5", "4/3": "aspect-4/3", card: "h-200" }[
            ratio
          ],
          className,
        )}
        aria-hidden
        data-placeholder
      />
    );
  }
  // The image fills the frame's width (Figma: the image covers its area). Product shots are
  // transparent cut-outs (alpha WebP), so the frame has no fill: the card's own colour shows
  // through, at rest, on hover and in dark mode.
  return (
    <Image
      src={image.src}
      alt={image.alt}
      ratio={ratio}
      surface="none"
      fit="cover"
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

/**
 * Figma Hover state: the content fades to 20% and an Outline button appears over it. The button
 * also shows when it gets keyboard focus; touch devices have no hover (see the Phase 3 notes).
 */
export function AddToCartOverlay({
  label,
  name,
  onClick,
}: {
  /** Visible text, e.g. "Add to cart". */
  label: string;
  /** Accessible name that says which product; starts with the visible label (WCAG 2.5.3). */
  name: string;
  onClick: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <Button
        variant="outline"
        aria-label={name}
        onClick={onClick}
        className={cn(
          // Invisible = not clickable, so a click on the card still opens the product.
          "pointer-events-none w-180 opacity-0",
          "group-hover/card:pointer-events-auto group-hover/card:opacity-100 focus-visible:opacity-100",
        )}
      >
        {label}
      </Button>
    </div>
  );
}
