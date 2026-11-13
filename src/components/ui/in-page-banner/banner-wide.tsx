import NextImage from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { BandAction, type BandActionProps } from "../cta-band/band-action";

// Figma `Banner [Wide]` (Content Direction × Breakpoint): the full-width campaign banner (Home 07,
// 1360 × 500), radius 8, half copy panel and half image: two equal halves from tablet (680 + 680
// on desktop), whatever the copy's length.
// - Copy panel: surface-tertiary, padding 48 · 60 (Figma 45 · 60; 45 is off the scale), the
//   copy at most 460 wide: overline title-small text-accent, title headline-large text-primary,
//   copy body-large text-secondary (gap 12), then Button Outline Large and the pagination,
//   gap 60 (40 on mobile).
// - Image: fills its half (500 tall); `Content Direction=Left` puts the copy left of it, Right
//   puts it on the right.
// - Card.Product.Vertical (`Show Card.Product.Vertical`, desktop only): a featured product card
//   (260 wide) straddling the image edge by 40px, vertically centred. Pass the card as `product`.
// - Mobile (Breakpoint=Mobile): the image (320 tall) on top, the copy below with padding 40.
//   Side by side from tablet (Home WT: 712 × 500).
// - Pagination (`Show Pagination`, "‹ 1 / 2 ›"): pass <CarouselPagination variant="fraction">
//   when several wide banners rotate in one slot.

export const BANNER_WIDE_DEFAULTS = { contentDirection: "left", headingLevel: 2 } as const;

export interface BannerWideProps {
  /** Figma `Overline Text` (`Show Overline`). */
  overline?: string;
  /** Figma `Title Text`. */
  title: string;
  /** Figma `Copy Text` (`Show Copy`). */
  copy?: string;
  image: ImageAsset;
  /** Figma `Button` (`Show Button`). */
  action?: BandActionProps;
  /** Figma `Content Direction`: the copy panel left or right of the image. */
  contentDirection?: "left" | "right";
  /** Figma `Card.Product.Vertical` (desktop only). */
  product?: ReactNode;
  /** Figma `Pagination`. */
  pagination?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}

export function BannerWide({
  overline,
  title,
  copy,
  image,
  action,
  contentDirection = BANNER_WIDE_DEFAULTS.contentDirection,
  product,
  pagination,
  headingLevel = BANNER_WIDE_DEFAULTS.headingLevel,
  className,
}: BannerWideProps) {
  const Heading = `h${headingLevel}` as const;
  const copyLeft = contentDirection === "left";
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-card tablet:min-h-500 tablet:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-320 bg-surface-skeleton tablet:h-auto tablet:w-1/2 tablet:shrink-0",
          copyLeft && "tablet:order-last",
        )}
      >
        <NextImage
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 744px) 50vw, 100vw"
          className="object-cover"
        />
        {product && (
          <div
            className={cn(
              "absolute top-1/2 hidden w-260 -translate-y-1/2 desktop:block",
              copyLeft ? "-left-40" : "-right-40",
            )}
          >
            {product}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center bg-surface-tertiary p-40 tablet:w-1/2 tablet:shrink-0 tablet:px-60 tablet:py-48">
        <div className="flex max-w-460 flex-col items-start gap-40 desktop:gap-60">
          <div className="flex flex-col gap-12">
            {overline && <p className="text-title-sm text-text-accent">{overline}</p>}
            <Heading className="text-headline-lg text-text-primary">{title}</Heading>
            {copy && <p className="text-body-lg text-text-secondary">{copy}</p>}
          </div>
          {action && <BandAction {...action} variant="outline" size="lg" className="min-w-216" />}
          {pagination}
        </div>
      </div>
    </section>
  );
}
