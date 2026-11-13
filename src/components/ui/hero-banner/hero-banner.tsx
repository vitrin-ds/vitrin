"use client";

import NextImage from "next/image";
import { useId } from "react";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { ToolbarButton } from "@/components/base/modal/toolbar-button";
import { BandAction, type BandActionProps } from "../cta-band/band-action";
import {
  CAROUSEL_PAGINATION_LABELS,
  CarouselPagination,
  type CarouselPaginationLabels,
} from "./carousel-pagination";
import { useAutoRotation } from "./use-auto-rotation";

// Figma `Hero Banner` (Layout): the top-of-page campaign hero.
// - Split Left / Split Right (1360 × 540): an 8-column image (904 × 540, radius 12) next to the
//   copy column (flex, gap 60 between copy and pagination; copy and button gap 40; overline,
//   title, copy gap 12). Overline title-small text-accent, title headline-large text-primary,
//   copy body-large text-secondary, Button Outline Large. Below 1024px (Home WT/WM frames) the
//   image (420 tall) sits on top and the copy below it, gap 20.
// - Centered (1340 × 522, radius 12, padding 40): the image fills the hero and the copy is
//   centred over it, a 44px round arrow button on each side, Button Filled Large. Figma sets the
//   copy in text-primary / text-secondary / text-inverse directly on the photo; code uses
//   text-on-image on a full-cover scrim (scrim-bottom: black 60%, fading over the top 40px), so
//   the copy passes AA on any image, even a white one.
//
// Carousel (WAI-ARIA APG): a region with aria-roledescription="carousel"; each slide's copy is a
// group with aria-roledescription="slide" and an "n of m" name; previous / next buttons and
// "Slide n of m" dots (Split). The copy of the visible slide is the slide group; its image sits in
// the image column (the Split layout puts the pagination under the copy, outside the slide).
// No rotation unless `autoplayInterval` is set; then a Pause / Play icon button (44px, named by aria-label) is shown, rotation
// stops on hover and while focus is inside, and it does not start for reduced motion. The slides
// are aria-live="polite" except while rotating.

export interface HeroBannerSlide {
  id: string;
  /** Figma `Overline Text`. */
  overline?: string;
  /** Figma `Title Text`: one clear headline. */
  title: string;
  /** Figma `Copy Text`: one or two short lines. */
  copy?: string;
  image: ImageAsset;
  /** Figma `Button` (`Show Button`): the one primary CTA. */
  action?: BandActionProps;
}

export type HeroBannerLayout = "split-left" | "split-right" | "centered";

export interface HeroBannerLabels extends CarouselPaginationLabels {
  /** Name of the carousel region. */
  carousel: string;
  /** Name of a slide group, e.g. "1 of 3". */
  slideOf: (n: number, total: number) => string;
  pause: string;
  play: string;
}

export const HERO_BANNER_LABELS: HeroBannerLabels = {
  ...CAROUSEL_PAGINATION_LABELS,
  carousel: "Featured campaigns",
  slideOf: (n, total) => `${n} of ${total}`,
  pause: "Pause",
  play: "Play",
};

export const HERO_BANNER_DEFAULTS = {
  layout: "split-left",
  headingLevel: 2,
  priority: false,
} as const;

export interface HeroBannerProps {
  /** One slide is a plain hero; more become a carousel (Figma: 3–5 slides). */
  slides: readonly HeroBannerSlide[];
  /** Figma `Layout`: copy left of the image, right of it, or centred over it. */
  layout?: HeroBannerLayout;
  /** Rotate every n ms (Figma Don't: no autoplay without a pause control). Off by default. */
  autoplayInterval?: number;
  /** The first slide's image is the page's LCP image: load it eagerly with high priority. */
  priority?: boolean;
  headingLevel?: 1 | 2 | 3;
  labels?: HeroBannerLabels;
  className?: string;
}

const SIZES = {
  split: "(min-width: 1024px) 904px, 100vw",
  centered: "(min-width: 1440px) 1360px, 100vw",
} as const;

export function HeroBanner({
  slides,
  layout = HERO_BANNER_DEFAULTS.layout,
  autoplayInterval,
  priority = HERO_BANNER_DEFAULTS.priority,
  headingLevel = HERO_BANNER_DEFAULTS.headingLevel,
  labels = HERO_BANNER_LABELS,
  className,
}: HeroBannerProps) {
  const id = useId();
  const slidesId = `${id}-slides`;
  const rotation = useAutoRotation(slides.length, autoplayInterval);
  const isCarousel = slides.length > 1;
  const centered = layout === "centered";
  const Heading = `h${headingLevel}` as const;

  const images = slides.map((slide, i) => (
    <NextImage
      key={slide.id}
      src={slide.image.src}
      alt={slide.image.alt}
      fill
      sizes={centered ? SIZES.centered : SIZES.split}
      // LCP image: eager at high fetch priority (next/image `priority` is deprecated in Next 16;
      // see the DS Image).
      {...(priority && i === 0 ? ({ loading: "eager", fetchPriority: "high" } as const) : {})}
      hidden={i !== rotation.index}
      data-state={rotation.changed ? "open" : undefined}
      className="motion-overlay object-cover"
    />
  ));

  const copy = (
    <div id={slidesId} aria-live={rotation.rotating ? "off" : "polite"} className="grid">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          role={isCarousel ? "group" : undefined}
          aria-roledescription={isCarousel ? "slide" : undefined}
          aria-label={isCarousel ? labels.slideOf(i + 1, slides.length) : undefined}
          hidden={i !== rotation.index}
          data-state={rotation.changed ? "open" : undefined}
          className={cn(
            "col-start-1 row-start-1 flex motion-overlay flex-col gap-40",
            centered ? "items-center text-center" : "items-start",
          )}
        >
          <div className="flex flex-col gap-12">
            {slide.overline && (
              <p
                className={cn(
                  "text-title-sm",
                  centered ? "text-text-on-image" : "text-text-accent",
                )}
              >
                {slide.overline}
              </p>
            )}
            <Heading
              className={cn(
                "text-headline-lg",
                centered ? "text-text-on-image" : "text-text-primary",
              )}
            >
              {slide.title}
            </Heading>
            {slide.copy && (
              <p
                className={cn(
                  "text-body-lg",
                  centered ? "text-text-on-image" : "text-text-secondary",
                )}
              >
                {slide.copy}
              </p>
            )}
          </div>
          {slide.action && (
            <BandAction
              {...slide.action}
              variant={centered ? "filled" : "outline"}
              size="lg"
              className="min-w-216"
            />
          )}
        </div>
      ))}
    </div>
  );

  const playToggle = rotation.canRotate && (
    <ToolbarButton
      icon={rotation.playing ? "pause" : "play_arrow"}
      label={rotation.playing ? labels.pause : labels.play}
      controls={slidesId}
      onClick={rotation.togglePlaying}
    />
  );

  const carouselProps = isCarousel
    ? { "aria-roledescription": "carousel", "aria-label": labels.carousel }
    : {};

  if (centered) {
    return (
      <section
        {...carouselProps}
        {...rotation.holdHandlers}
        className={cn(
          "relative isolate flex min-h-420 flex-wrap items-center justify-center gap-8 overflow-hidden rounded-12 px-16 py-40",
          "desktop:h-522 desktop:flex-nowrap desktop:px-40",
          className,
        )}
      >
        <div className="absolute inset-0 -z-10 bg-surface-skeleton">{images}</div>
        <div aria-hidden className="absolute inset-0 -z-10 scrim-bottom" />
        {isCarousel && (
          <ToolbarButton
            icon="keyboard_arrow_left"
            label={labels.previous}
            onClick={rotation.previous}
          />
        )}
        <div className="order-first w-full desktop:order-none desktop:w-auto desktop:flex-1">
          {copy}
        </div>
        {isCarousel && (
          <ToolbarButton icon="keyboard_arrow_right" label={labels.next} onClick={rotation.next} />
        )}
        {playToggle && <div className="absolute right-16 bottom-16">{playToggle}</div>}
      </section>
    );
  }

  const left = layout === "split-left";
  return (
    <section
      {...carouselProps}
      {...rotation.holdHandlers}
      className={cn(
        "grid grid-cols-1 gap-20 desktop:grid-cols-12 desktop:items-center desktop:gap-x-8",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-420 overflow-hidden rounded-12 bg-surface-skeleton desktop:col-span-8 desktop:row-start-1 desktop:h-540",
          left ? "desktop:col-start-5" : "desktop:col-start-1",
        )}
      >
        {images}
      </div>
      <div
        className={cn(
          "flex flex-col gap-40 desktop:col-span-4 desktop:row-start-1 desktop:gap-60",
          // The 8px grid gutter plus 12 = Figma's 20px gap between image and copy.
          left ? "desktop:col-start-1 desktop:pr-12" : "desktop:col-start-9 desktop:pl-12",
        )}
      >
        {copy}
        {(isCarousel || playToggle) && (
          <div className="flex flex-wrap items-center gap-24">
            {isCarousel && (
              <CarouselPagination
                index={rotation.index}
                count={slides.length}
                onPrevious={rotation.previous}
                onNext={rotation.next}
                onSelect={rotation.goTo}
                controls={slidesId}
                labels={labels}
              />
            )}
            {playToggle}
          </div>
        )}
      </div>
    </section>
  );
}
