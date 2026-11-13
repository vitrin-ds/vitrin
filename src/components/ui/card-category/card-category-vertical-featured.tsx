import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Vertical.Featured` (State) on `.Base.Card.Category.Vertical.Featured`:
// radius 8, 382px tall, the image fills the card and the editorial text sits on it (padding
// 12 · 20 · 20, space-between): overline (body-small, text-accent) and title (title-large,
// text-primary), gap 8; at the bottom the C2A text (label-large, text-primary) with the 20px
// arrow_forward glyph (icon-accent). No scrim (TOKEN-AUDIT decision of 2 Nov).
// Hover & Tap: the background turns surface-accent-subtle, no border (Figma description).
// The image is multiplied onto the card background, so the hover tint shows
// through it. The title is the link and its ::after covers the card.

export const CARD_CATEGORY_VERTICAL_FEATURED_DEFAULTS = {
  rightIcon: "arrow_forward",
  headingLevel: 3,
} as const;

export interface CardCategoryVerticalFeaturedProps extends CardCategoryBaseProps {
  /**
   * Figma `Show Title`. Off: the title is hidden on screen but stays the link's accessible name.
   */
  showTitle?: boolean;
  /** Figma `Overline` (e.g. the season or campaign). */
  overline?: string;
  /** Figma `C2A Text`, e.g. "Shop the edit". */
  cta?: string;
  /** Figma C2A icon (20px, decorative); `null` hides it. */
  rightIcon?: IconName | null;
  headingLevel?: 2 | 3 | 4;
}

export function CardCategoryVerticalFeatured({
  title,
  href,
  image,
  sizes = "(min-width: 1024px) 334px, 70vw",
  showTitle = true,
  overline,
  cta,
  rightIcon = CARD_CATEGORY_VERTICAL_FEATURED_DEFAULTS.rightIcon,
  headingLevel = CARD_CATEGORY_VERTICAL_FEATURED_DEFAULTS.headingLevel,
  className,
}: CardCategoryVerticalFeaturedProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      data-card="category-vertical-featured"
      className={cn(
        "group/card relative isolate flex min-h-382 flex-col overflow-hidden rounded-card",
        "bg-surface-secondary hover:bg-surface-accent-subtle",
        className,
      )}
    >
      <CategoryMedia
        image={image}
        sizes={sizes}
        className="absolute inset-0 bg-transparent mix-blend-multiply"
      />
      <div className="relative flex flex-1 flex-col justify-between px-20 pt-12 pb-20">
        <div className="flex flex-col gap-8">
          {overline && <p className="text-body-sm text-text-accent">{overline}</p>}
          <Heading className="text-title-lg text-text-primary">
            <NextLink href={href} className="rounded-4 after:absolute after:inset-0">
              {showTitle ? title : <span className="sr-only">{title}</span>}
            </NextLink>
          </Heading>
        </div>
        {(cta || rightIcon) && (
          <p className="flex items-start justify-between gap-8 text-label-lg text-text-primary">
            {cta && <span className="min-w-0 flex-1">{cta}</span>}
            {rightIcon && <Icon name={rightIcon} tone="accent" className="ml-auto shrink-0" />}
          </p>
        )}
      </div>
    </article>
  );
}
