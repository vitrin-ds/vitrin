import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { Image } from "../image/image";
import { ProductLink } from "./card-product-parts";

// Figma `Card.Product.Minimal` (State) on `.Base.Card.Product.Minimal` (31720:8888): for small,
// single-brand catalogues. A tinted 4:5 packshot (surface-accent-subtle, no radius, never cropped),
// then gap 8: name (title-small) and price (label-large) on one row, a one-line description
// (body-small, text-tertiary). Hover underlines the name. The whole card links to the product.
// Figma's "Image brief" text is a note for the art director, not card content.

export const CARD_PRODUCT_MINIMAL_DEFAULTS = { locale: "en", priority: false } as const;

export interface CardProductMinimalProps {
  /** Figma `Name`. */
  name: string;
  /** The product page. */
  href: string;
  /** Figma `Price`. */
  price: Money;
  /** Figma `Description`: one short line. */
  description?: string;
  /** The packshot; the tinted area stays when it's missing. */
  image?: ImageAsset;
  /** Code only: the image can be the page's LCP. */
  priority?: boolean;
  locale?: string;
  className?: string;
}

export function CardProductMinimal({
  name,
  href,
  price,
  description,
  image,
  priority = CARD_PRODUCT_MINIMAL_DEFAULTS.priority,
  locale = CARD_PRODUCT_MINIMAL_DEFAULTS.locale,
  className,
}: CardProductMinimalProps) {
  return (
    <article
      data-card="product-minimal"
      className={cn("group/card relative flex flex-col gap-8", className)}
    >
      <div className="aspect-4/5 w-full bg-surface-accent-subtle">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            ratio="4/5"
            surface="none"
            fit="contain"
            sizes="(min-width: 1024px) 448px, 100vw"
            priority={priority}
          />
        )}
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <h3 className="min-w-0 text-title-sm">
            <ProductLink href={href} name={name} className="group-hover/card:underline" />
          </h3>
          <p className="shrink-0 text-label-lg text-text-primary">{formatMoney(price, locale)}</p>
        </div>
        {description && <p className="text-body-sm text-text-tertiary">{description}</p>}
      </div>
    </article>
  );
}
