import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { Image } from "../image/image";

// Figma `Card.Content.Compact` (State) on `.Base.Card.Content.Compact`: an editorial card,
// gap 12: the image (radius 8; Figma 441 × 280, here the nearest Image ratio 3/2) and below it,
// padding 0 · 8, gap 8: the date / time (body-small, text-accent) and the title (title-large, at
// most two lines per Figma Do). No card surface or border: it sits on the page. Hover & Tap
// underlines the title. The title is the link and its ::after covers the card.

export const CARD_CONTENT_COMPACT_DEFAULTS = { headingLevel: 3 } as const;

export interface CardContentCompactProps {
  /** Figma `Title Text` (also the link's accessible name). */
  title: string;
  /** The article page. */
  href: string;
  image: ImageAsset;
  /** Figma `Date Time Text`, as shown, e.g. "12 Oct 2026". */
  dateTime?: string;
  /** Machine-readable form of `dateTime` (ISO 8601) for the <time> element. */
  dateTimeISO?: string;
  /** Rendered width per breakpoint for next/image. */
  sizes?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CardContentCompact({
  title,
  href,
  image,
  dateTime,
  dateTimeISO,
  sizes = "(min-width: 1024px) 448px, 100vw",
  headingLevel = CARD_CONTENT_COMPACT_DEFAULTS.headingLevel,
  className,
}: CardContentCompactProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={cn("group/card relative flex flex-col gap-12", className)}>
      <div className="overflow-hidden rounded-card">
        <Image src={image.src} alt={image.alt} ratio="3/2" sizes={sizes} />
      </div>
      <div className="flex flex-col gap-8 px-8">
        {dateTime && (
          <p className="text-body-sm text-text-accent">
            {dateTimeISO ? <time dateTime={dateTimeISO}>{dateTime}</time> : dateTime}
          </p>
        )}
        <Heading className="text-title-lg text-text-primary">
          <NextLink
            href={href}
            className="line-clamp-2 rounded-4 group-hover/card:underline after:absolute after:inset-0"
          >
            {title}
          </NextLink>
        </Heading>
      </div>
    </article>
  );
}
