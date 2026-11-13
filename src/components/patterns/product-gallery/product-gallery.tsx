"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button/button";
import { Image } from "@/components/ui/image/image";
import {
  SLIDER_PAGINATION_LABELS,
  SliderPagination,
} from "@/components/ui/pagination/slider-pagination";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { GalleryViewer } from "./gallery-viewer";
import { useIsDesktop } from "@/lib/use-is-desktop";

// Figma pattern `Product Gallery` (03. Patterns › Discovery, 31511:16978) as used on the
// PDP (06.01: WD 31215:29033, WM 31215:30141 + 31215:30148). A 1:1 main image (676px = 6 columns
// on desktop, full width on mobile) with 44px thumbnails: a vertical column over the image's left
// edge on desktop (inset 12, gap 8), a row under it on mobile (gap 8). At most 6 (desktop) / 4
// (mobile) thumbnails show; the rest sit behind a "+N" tile that reveals them. Badges
// (<Label>) go top right, the wishlist and zoom actions bottom right: Button Outline Medium,
// icon-only (44 × 44, radius 8), the icon in Fill=Off (Fill=On once saved). The main image sits
// in a radius-8 frame with a 1px border-neutral ring (Figma Product Image). No autoplay (Figma
// Don't).
//
// Accessibility: the thumbnails are an APG tablist and each image a tabpanel ("tabbed carousel"):
// Figma draws thumbnails, not slide dots, and a tab per image gives each one a named, selectable
// control. Roving tabindex, automatic activation; ←/→ and ↑/↓ (the column is vertical on
// desktop), Home / End. Swiping the main image (touch / pen) moves between images; the thumbnails
// are the single-pointer alternative (WCAG 2.5.1). Without thumbnails (`thumbnails={false}`, the
// compact gallery inside Quick View) a Slider Pagination Bar does that job. Image changes from a
// swipe or the pagination are announced in a polite live region. Only the first image may load
// with `priority`; the others are lazy and load when their panel shows (Figma Don't: "load all
// full-size images upfront"). Zoom opens GalleryViewer (main image click or the zoom button).

export interface ProductGalleryLabels {
  /** Accessible name of the gallery, e.g. "Product images". */
  gallery: string;
  /** Thumbnail tab names. */
  thumbnail: (index: number, total: number) => string;
  /** The "+N" tile; must start with the visible "+N" (WCAG 2.5.3). */
  more: (count: number) => string;
  zoom: string;
  wishlistAdd: string;
  wishlistRemove: string;
  /** Spoken position after a swipe or a pagination step, and the viewer counter. */
  position: (current: number, total: number) => string;
  viewer: string;
  close: string;
  previous: string;
  next: string;
}

export const PRODUCT_GALLERY_LABELS: ProductGalleryLabels = {
  gallery: "Product images",
  thumbnail: (index, total) => `Image ${index} of ${total}`,
  more: (count) => `+${count} more images`,
  zoom: "Zoom image",
  wishlistAdd: "Save to wishlist",
  wishlistRemove: "Remove from wishlist",
  position: (current, total) => `Image ${current} of ${total}`,
  viewer: "Product images, full screen",
  close: "Close",
  previous: "Previous image",
  next: "Next image",
};

export const PRODUCT_GALLERY_DEFAULTS = {
  thumbnails: true,
  zoom: true,
  priority: false,
  /** Figma: 6 thumbnails + "+N" on desktop (31215:29033), 4 + "+N" on mobile (31215:30148). */
  maxThumbnails: { desktop: 6, mobile: 4 },
  sizes: "(min-width: 1024px) 676px, 100vw",
} as const;

/** Horizontal travel (px) that counts as a swipe rather than a tap. */
export const SWIPE_THRESHOLD = 40;

export interface ProductGalleryProps {
  /** Square product shots (Figma Do: "Use square, consistent product images"), each with alt text. */
  images: readonly ImageAsset[];
  /** Figma Label slot (top right): `<Label>New</Label>`, `<Label color="accent">20%</Label>` … */
  badges?: ReactNode;
  /** Figma Button (icon) "Favourite": shown when given. */
  wishlist?: { saved: boolean; onToggle: () => void };
  /** Thumbnail tablist; false = compact gallery with a Slider Pagination Bar (Quick View). */
  thumbnails?: boolean;
  /** Zoom on click and the zoom_in action. Off inside another modal (Quick View Don't: nested dialogs). */
  zoom?: boolean;
  /** Load the first image with `priority` (only when the gallery holds the page's LCP image). */
  priority?: boolean;
  /** Rendered width of the main image per breakpoint. */
  sizes?: string;
  /** Controlled selection (0-based). */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  labels?: ProductGalleryLabels;
  className?: string;
}

export function ProductGallery({
  images,
  badges,
  wishlist,
  thumbnails = PRODUCT_GALLERY_DEFAULTS.thumbnails,
  zoom = PRODUCT_GALLERY_DEFAULTS.zoom,
  priority = PRODUCT_GALLERY_DEFAULTS.priority,
  sizes = PRODUCT_GALLERY_DEFAULTS.sizes,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  labels = PRODUCT_GALLERY_LABELS,
  className,
}: ProductGalleryProps) {
  const id = useId();
  const total = images.length;
  const [uncontrolled, setUncontrolled] = useState(defaultIndex);
  const index = Math.min(Math.max(indexProp ?? uncontrolled, 0), Math.max(total - 1, 0));
  const [expanded, setExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusTab = useRef<number | null>(null);
  const swipe = useRef<{ x: number; swiped: boolean } | null>(null);

  const max = PRODUCT_GALLERY_DEFAULTS.maxThumbnails[isDesktop ? "desktop" : "mobile"];
  // Selecting a hidden image (swipe, keyboard) reveals every thumbnail, so the tab is visible.
  const showAll = expanded || total <= max || index >= max;
  const hiddenCount = showAll ? 0 : total - max;

  // Move focus after the tab it targets has rendered (it may have been hidden a moment ago).
  useEffect(() => {
    if (focusTab.current === null) return;
    tabRefs.current[focusTab.current]?.focus();
    focusTab.current = null;
  });

  function select(next: number, announce = false) {
    const clamped = Math.min(Math.max(next, 0), total - 1);
    if (clamped === index) return;
    if (indexProp === undefined) setUncontrolled(clamped);
    onIndexChange?.(clamped);
    setAnnouncement(announce ? labels.position(clamped + 1, total) : "");
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const target = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: total - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + total) % total;
    focusTab.current = next;
    select(next);
  }

  function revealMore() {
    focusTab.current = max;
    setExpanded(true);
  }

  // Swipe: touch and pen only (a mouse click zooms). `touch-pan-y` keeps vertical page scroll.
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swipe.current = event.pointerType === "mouse" ? null : { x: event.clientX, swiped: false };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!swipe.current) return;
    const dx = event.clientX - swipe.current.x;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    swipe.current.swiped = true;
    select(index + (dx < 0 ? 1 : -1), true);
  }

  function onImageClick() {
    const swiped = swipe.current?.swiped;
    swipe.current = null;
    if (!swiped && zoom) setZoomOpen(true);
  }

  if (total === 0) return null;
  const tabs = thumbnails && total > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.gallery}
      className={cn("relative flex flex-col gap-8", className)}
    >
      <div
        className={cn(
          "relative touch-pan-y overflow-hidden rounded-card bg-surface-primary",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-card after:inset-ring after:inset-ring-border-neutral",
          zoom && "cursor-zoom-in",
        )}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onImageClick}
      >
        {images.map((image, i) => (
          <div
            key={`${image.src}-${i}`}
            id={`${id}-panel-${i}`}
            role={tabs ? "tabpanel" : "group"}
            aria-roledescription={tabs ? undefined : "slide"}
            aria-labelledby={tabs ? `${id}-tab-${i}` : undefined}
            aria-label={tabs ? undefined : labels.position(i + 1, total)}
            hidden={i !== index}
          >
            <Image
              src={image.src}
              alt={image.alt}
              ratio="1/1"
              fit="contain"
              sizes={sizes}
              priority={priority && i === 0}
              className="bg-surface-primary"
            />
          </div>
        ))}
        {badges && (
          <div className="absolute top-12 right-12 flex flex-col items-end gap-8">{badges}</div>
        )}
        {(wishlist || zoom) && (
          // The actions stop the click so they don't also open the zoom.
          <div
            className="absolute right-12 bottom-12 flex gap-8"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {wishlist && (
              <Button
                variant="outline"
                leftIcon="favorite"
                iconFill={wishlist.saved}
                aria-label={wishlist.saved ? labels.wishlistRemove : labels.wishlistAdd}
                onClick={wishlist.onToggle}
              />
            )}
            {zoom && (
              <Button
                variant="outline"
                leftIcon="zoom_in"
                iconFill={false}
                aria-label={labels.zoom}
                onClick={() => setZoomOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {tabs && (
        // The "+N" tile is a plain button, so it sits next to the tablist, not inside it.
        <div
          className={cn(
            "flex flex-wrap gap-8",
            "desktop:absolute desktop:top-12 desktop:left-12 desktop:flex-col desktop:flex-nowrap",
          )}
        >
          <div
            role="tablist"
            aria-label={labels.gallery}
            className="flex flex-wrap gap-8 desktop:flex-col desktop:flex-nowrap"
          >
            {images.map((image, i) => (
              <button
                key={`${image.src}-${i}`}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                id={`${id}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={`${id}-panel-${i}`}
                aria-label={labels.thumbnail(i + 1, total)}
                tabIndex={i === index ? 0 : -1}
                hidden={!showAll && i >= max}
                onClick={() => select(i)}
                onKeyDown={onTabKeyDown}
                className={cn(
                  "size-44 shrink-0 cursor-pointer overflow-hidden rounded-8 bg-surface-primary p-2 inset-ring",
                  i === index
                    ? "inset-ring-border-accent"
                    : "inset-ring-border-neutral hover:inset-ring-interactive-hover",
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  ratio="1/1"
                  fit="contain"
                  sizes="44px"
                  className="rounded-4 bg-surface-primary"
                />
              </button>
            ))}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              aria-label={labels.more(hiddenCount)}
              onClick={revealMore}
              className={cn(
                "flex size-44 shrink-0 cursor-pointer items-center justify-center rounded-8",
                "bg-surface-primary text-label-lg text-text-primary inset-ring inset-ring-border-neutral",
                "hover:inset-ring-interactive-hover",
              )}
            >
              +{hiddenCount}
            </button>
          )}
        </div>
      )}

      {!thumbnails && total > 1 && (
        <SliderPagination
          current={index + 1}
          total={total}
          onPrevious={() => select(index - 1, true)}
          onNext={() => select(index + 1, true)}
          labels={{
            ...SLIDER_PAGINATION_LABELS,
            progress: labels.gallery,
            previous: labels.previous,
            next: labels.next,
            position: (current, count) => labels.position(current, count),
          }}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {zoom && (
        <GalleryViewer
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          images={images}
          index={index}
          onIndexChange={(next) => select(next)}
          labels={labels}
        />
      )}
    </section>
  );
}
