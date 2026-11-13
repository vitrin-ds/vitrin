import NextImage from "next/image";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { buttonVariants } from "../button/button";
import type { IconName } from "../icon/icon-names";
import { Label } from "../label/label";
import { BandAction, type BandActionProps } from "../cta-band/band-action";

// The image banners of Figma In Page Banners. The image fills the banner; the copy is at the top
// and the Button Outline Large at the bottom (space-between).
// - `Banner [Image Background / Compact]` (BannerImageBackgroundCompact): 400 tall, copy left-aligned, padding
//   40 (20 on mobile), optional sale tag (Figma `Show Sticker`): a Label (accent) top-right at 20.
// - `Banner [Image - Centered]` (BannerImageCentered): 560 tall (440 on mobile), copy and button
//   centred. Home 07 uses it for the Sale Banner (448 × 675) with a SaleCountdown (sayfa düzeyi, children olarak) in `children`.
// - `Banner.Horizontal` (BannerHorizontal): the Compact banner as one link (Home 07 "Banner
//   Tower"); Hover draws a 4px surface-primary frame inside the banner and underlines the title.
//   No scrim, as in Figma: overline text-accent and title text-primary straight on the photo.
// Copy: overline body-large, title headline-large (gap 8). Figma sets them in text-accent /
// text-primary straight on the photo; code uses text-on-image on the scrim-top block (black 60%
// fading over 40px), so the copy stays AA on any image, even a white one. Below 744px the button
// fills the width (Figma Mobile).

/** The sale tag on the banner: a Label (accent). The caller formats the text, e.g. "20% Off". */
export interface BannerSticker {
  text: string;
  /** Figma `Left Icon` of the Label (`loyalty` on the banners). */
  icon?: IconName;
}

interface BannerImageBaseProps {
  /** Figma `Overline Text` (`Show Overline`). */
  overline?: string;
  /** Figma `Title Text`. */
  title: string;
  image: ImageAsset;
  /** Rendered width per breakpoint for next/image. */
  sizes?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export const BANNER_IMAGE_DEFAULTS = {
  headingLevel: 2,
  sizes: "(min-width: 1024px) 676px, 100vw",
} as const;

function Frame({
  image,
  sizes,
  className,
  children,
}: {
  image: ImageAsset;
  sizes: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex flex-col justify-between overflow-hidden bg-surface-skeleton",
        className,
      )}
    >
      <NextImage
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="-z-10 object-cover"
      />
      {children}
    </section>
  );
}

function Copy({
  overline,
  title,
  headingLevel,
  centered = false,
  scrim = true,
  titleSlot,
  children,
}: {
  overline?: string;
  title: string;
  headingLevel: 2 | 3 | 4;
  centered?: boolean;
  /**
   * true: text-on-image on the scrim-top block. false: Figma's colours straight on the photo
   * (overline text-accent, title text-primary), no scrim.
   */
  scrim?: boolean;
  /** Replaces the title text (Banner.Horizontal wraps it in the link). */
  titleSlot?: ReactNode;
  children?: ReactNode;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={cn(
        "flex flex-col gap-8 px-20 pt-20 tablet:px-40 tablet:pt-40",
        scrim ? "scrim-top pb-40 text-text-on-image" : "pb-20 tablet:pb-40",
        centered && "items-center text-center",
      )}
    >
      {overline && <p className={cn("text-body-lg", !scrim && "text-text-accent")}>{overline}</p>}
      <Heading className={cn("text-headline-lg", !scrim && "text-text-primary")}>
        {titleSlot ?? title}
      </Heading>
      {children}
    </div>
  );
}

function Sticker({ sticker }: { sticker: BannerSticker }) {
  return (
    <Label
      color="accent"
      icon={sticker.icon}
      className="pointer-events-none absolute top-20 right-20"
    >
      {sticker.text}
    </Label>
  );
}

export interface BannerImageBackgroundCompactProps extends BannerImageBaseProps {
  /** Figma `Button` (`Show Button`). */
  action?: BandActionProps;
  /** Figma `Sticker` (`Show Sticker`). */
  sticker?: BannerSticker;
}

/** Figma `Banner [Image Background / Compact]`. */
export function BannerImageBackgroundCompact({
  overline,
  title,
  image,
  action,
  sticker,
  sizes = BANNER_IMAGE_DEFAULTS.sizes,
  headingLevel = BANNER_IMAGE_DEFAULTS.headingLevel,
  className,
}: BannerImageBackgroundCompactProps) {
  return (
    <Frame image={image} sizes={sizes} className={cn("h-400", className)}>
      <Copy overline={overline} title={title} headingLevel={headingLevel} />
      {action && (
        <div className="px-20 pb-20 tablet:px-40 tablet:pb-40">
          <BandAction
            {...action}
            variant="outline"
            size="lg"
            className="w-full min-w-216 tablet:w-auto"
          />
        </div>
      )}
      {sticker && <Sticker sticker={sticker} />}
    </Frame>
  );
}

export interface BannerImageCenteredProps extends BannerImageBaseProps {
  /** Figma `Button` (`Show Button`). */
  action?: BandActionProps;
  /** Extra copy under the title, e.g. a SaleCountdown (sayfa düzeyi, children olarak) (Home 07 Sale Banner). */
  children?: ReactNode;
}

/** Figma `Banner [Image - Centered]`. */
export function BannerImageCentered({
  overline,
  title,
  image,
  action,
  children,
  sizes = "(min-width: 1024px) 448px, 100vw",
  headingLevel = BANNER_IMAGE_DEFAULTS.headingLevel,
  className,
}: BannerImageCenteredProps) {
  return (
    <Frame image={image} sizes={sizes} className={cn("min-h-440 tablet:min-h-560", className)}>
      <Copy overline={overline} title={title} headingLevel={headingLevel} centered>
        {children}
      </Copy>
      {action && (
        <div className="flex justify-center px-20 pb-20 tablet:px-40 tablet:pb-40">
          <BandAction
            {...action}
            variant="outline"
            size="lg"
            className="w-full min-w-216 tablet:w-auto"
          />
        </div>
      )}
    </Frame>
  );
}

export interface BannerSaleProps extends BannerImageBaseProps {
  /** Figma `Button` ("Shop The Sale"). */
  action?: BandActionProps;
  /** The SaleCountdown (sayfa düzeyi, children olarak) under the title. */
  children?: ReactNode;
}

/**
 * Figma Home 07 `Sale Banner` (30198:193347): radius 8, the image fills it, padding 40 · 48
 * (Figma 47, off the spacing scale), copy at the top and the button at the bottom
 * (space-between), all centred. Copy (gap 12): overline title-medium, title display-small, then
 * the SaleCountdown (sayfa düzeyi, children olarak; display-small, `children`), in text-on-image straight on the photo: no scrim, as
 * in Figma. Button: Outline Large Pill, at least 216 wide (full width below 744px).
 */
export function BannerSale({
  overline,
  title,
  image,
  action,
  children,
  sizes = "(min-width: 1024px) 448px, 100vw",
  headingLevel = BANNER_IMAGE_DEFAULTS.headingLevel,
  className,
}: BannerSaleProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <Frame
      image={image}
      sizes={sizes}
      className={cn(
        "min-h-440 items-center gap-40 rounded-card px-20 py-40 text-center tablet:min-h-560 tablet:px-48",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-12 text-text-on-image">
        {overline && <p className="text-title-md">{overline}</p>}
        <Heading className="text-display-sm">{title}</Heading>
        {children}
      </div>
      {action && (
        <BandAction
          {...action}
          variant="outline"
          size="lg"
          className="w-full min-w-216 tablet:w-auto"
        />
      )}
    </Frame>
  );
}

export interface BannerHorizontalProps extends BannerImageBaseProps {
  /** Where the whole banner links to. */
  href: string;
  /** Figma C2A button text; drawn as a button, the banner itself is the link. */
  cta?: string;
  /** Figma `Sticker`. */
  sticker?: BannerSticker;
}

/** Figma `Banner.Horizontal`: the Compact banner as one link. */
export function BannerHorizontal({
  overline,
  title,
  image,
  href,
  cta,
  sticker,
  sizes = BANNER_IMAGE_DEFAULTS.sizes,
  headingLevel = BANNER_IMAGE_DEFAULTS.headingLevel,
  className,
}: BannerHorizontalProps) {
  return (
    <Frame
      image={image}
      sizes={sizes}
      className={cn(
        "group/banner h-400 rounded-card",
        // The image covers the banner, so the hover frame is drawn on top of it (Figma State=Hover).
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-card",
        "after:border-surface-primary hover:after:border-4",
        className,
      )}
    >
      <Copy
        overline={overline}
        title={title}
        headingLevel={headingLevel}
        scrim={false}
        titleSlot={
          <NextLink
            href={href}
            className="rounded-4 group-hover/banner:underline after:absolute after:inset-0"
          >
            {title}
          </NextLink>
        }
      />
      {cta && (
        <div className="px-20 pb-20 tablet:px-40 tablet:pb-40">
          {/* Not a second control: the banner is the link, this only shows its call to action. */}
          <span
            aria-hidden
            className={cn(
              "inline-flex min-w-216 items-center justify-center whitespace-nowrap",
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full tablet:w-auto",
            )}
          >
            {cta}
          </span>
        </div>
      )}
      {sticker && <Sticker sticker={sticker} />}
    </Frame>
  );
}
