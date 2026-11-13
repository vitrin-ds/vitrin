import NextImage from "next/image";
import NextLink from "next/link";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button/button";
import { ProductImage } from "./card-product-parts";
import { Price } from "@/components/ui/price/price";

// Figma `Card.Product.Vertical.Featured` (30108:205016) on `.Base.Card.Product.Vertical.Featured`
// (30108:204921): an editorial product card, 491 tall, radius 8. A scene image fills the card;
// `Top` holds the overline (title-small) and title (title-large) over the image, bottom-aligned,
// padding 20, gap 20; `Bottom` (padding 12, gap 8) is the product: a 72px image (radius 8), the
// product name (title-small) and Price, and a Button Outline Small "Shop". The whole card links
// to the product; "Shop" only shows the call to action (like Banner.Horizontal).
//
// The image (or the Add Image pattern) runs under the whole card, Bottom included: Bottom is a
// tinted glass bar over it (`featured-glass`: Figma's rgba(54,10,82,.1) + 8px blur). All copy is
// text-inverse, as in Figma. No scrim (TOKEN-AUDIT decision of 2 Nov). Hover & Tap looks the same as Default.
// Open token point: the bar's tint has no Figma variable; `featured-glass` mixes primary/950 at 10%.

export interface CardProductVerticalFeaturedProps {
  /** Figma `Overline Text` (`Show Overline`). */
  overline?: string;
  /** Figma `Title Text` (`Show Title`): the editorial line over the image. */
  title?: string;
  /** The scene behind the copy (decorative: the copy says what it is about). */
  image?: ImageAsset;
  product: {
    /** Figma `Product Name Text`; names the card's link. */
    name: string;
    href: string;
    image?: ImageAsset;
    price: Money;
    compareAt?: Money;
  };
  /** Figma Button text, e.g. "Shop". */
  cta?: string;
  /** Rendered width per breakpoint for the scene image. */
  sizes?: string;
  locale?: string;
  className?: string;
}

export function CardProductVerticalFeatured({
  overline,
  title,
  image,
  product,
  cta,
  sizes = "(min-width: 1024px) 334px, 332px",
  locale = "en",
  className,
}: CardProductVerticalFeaturedProps) {
  return (
    <article
      className={cn(
        "group/card relative isolate flex h-491 flex-col justify-end overflow-hidden rounded-card add-image",
        className,
      )}
    >
      {image && (
        <NextImage src={image.src} alt="" fill sizes={sizes} className="-z-10 object-cover" />
      )}
      {(overline || title) && (
        <div className="flex flex-col gap-20 px-20 pb-20">
          {overline && <p className="text-title-sm text-text-inverse">{overline}</p>}
          {title && <p className="text-title-lg text-text-inverse">{title}</p>}
        </div>
      )}
      <div className="flex items-center gap-8 featured-glass p-12 backdrop-blur-base">
        <ProductImage
          image={product.image}
          ratio="1/1"
          sizes="72px"
          className="w-72 shrink-0 rounded-8"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <h3 className="text-title-sm text-text-inverse">
            <NextLink href={product.href} className="rounded-4 after:absolute after:inset-0">
              {product.name}
            </NextLink>
          </h3>
          <Price
            price={product.price}
            compareAt={product.compareAt}
            locale={locale}
            tone="inverse"
          />
        </div>
        {cta && (
          // Not a second control: the card is the link, this only shows its call to action.
          <span
            aria-hidden
            className={cn(
              "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
              buttonVariants({ variant: "outline", size: "sm" }),
            )}
          >
            {cta}
          </span>
        )}
      </div>
    </article>
  );
}
