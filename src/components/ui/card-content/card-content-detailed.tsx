import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { Image } from "../image/image";

// Figma `Card.Content.Detailed` (State) on `.Base.Card.Content.Detailed`: an editorial article card, gap 12: the image
// (radius 8, 448 × 300 = 3/2) and below it, padding 0 · 8, gap 8: category (label-medium,
// text-accent), title (title-medium, at most three lines), excerpt (body-small, text-secondary)
// and meta, e.g. "12 Oct 2026 · 6 min read" (label-small, text-tertiary). No card surface or
// border: it sits on the page. Hover & Tap: the title turns text-accent and underlined. The title
// is the link and its ::after covers the card. Figma Do: 4 columns (448px) on desktop.

export const CARD_CONTENT_DETAILED_DEFAULTS = { headingLevel: 3 } as const;

export interface CardContentDetailedProps {
  /** Figma `Title Text` (also the link's accessible name). */
  title: string;
  /** The article page. */
  href: string;
  image: ImageAsset;
  /** Figma `Category Text`, e.g. "Skincare". */
  category?: string;
  /** Figma `Excerpt Text`: one or two sentences. */
  excerpt?: string;
  /** Figma `Meta Text`: publication date · reading time. */
  meta?: string;
  /** Rendered width per breakpoint for next/image. */
  sizes?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CardContentDetailed({
  title,
  href,
  image,
  category,
  excerpt,
  meta,
  sizes = "(min-width: 1024px) 448px, (min-width: 744px) 50vw, 100vw",
  headingLevel = CARD_CONTENT_DETAILED_DEFAULTS.headingLevel,
  className,
}: CardContentDetailedProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={cn("group/card relative flex flex-col gap-12", className)}>
      <div className="overflow-hidden rounded-card">
        <Image src={image.src} alt={image.alt} ratio="3/2" sizes={sizes} />
      </div>
      <div className="flex flex-col gap-8 px-8">
        {category && <p className="text-label-md text-text-accent">{category}</p>}
        <Heading
          className={cn(
            "text-title-md text-text-primary",
            "group-hover/card:text-text-accent group-hover/card:underline",
          )}
        >
          <NextLink href={href} className="line-clamp-3 rounded-4 after:absolute after:inset-0">
            {title}
          </NextLink>
        </Heading>
        {excerpt && <p className="text-body-sm text-text-secondary">{excerpt}</p>}
        {meta && <p className="text-label-sm text-text-tertiary">{meta}</p>}
      </div>
    </article>
  );
}
