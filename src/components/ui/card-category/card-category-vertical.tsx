import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { CARD_COLOR_CLASS } from "../card-product/card-product-parts";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Vertical` (State × Color) on `.Base.Card.Category.Vertical`: radius 8,
// a 240px image on top, then the bottom row (padding 20 · 12): the category name (title-small, one
// line, truncated) and the 20px keyboard_arrow_right glyph (icon-accent). Color Brand
// (surface-secondary) or White (surface-primary). Hover underlines the name. The name is the link
// and its ::after covers the card, so the whole card opens the category.

export const CARD_CATEGORY_VERTICAL_DEFAULTS = {
  color: "brand",
  rightIcon: "keyboard_arrow_right",
  headingLevel: 3,
} as const;

export interface CardCategoryVerticalProps extends CardCategoryBaseProps {
  /** Figma `Color`: Brand (surface-secondary) or White (surface-primary). */
  color?: "brand" | "white";
  /** Figma `Right Icon` (20px, decorative); `null` hides it. */
  rightIcon?: IconName | null;
  headingLevel?: 2 | 3 | 4;
}

export function CardCategoryVertical({
  title,
  href,
  image,
  sizes = "(min-width: 1024px) 334px, 50vw",
  color = CARD_CATEGORY_VERTICAL_DEFAULTS.color,
  rightIcon = CARD_CATEGORY_VERTICAL_DEFAULTS.rightIcon,
  headingLevel = CARD_CATEGORY_VERTICAL_DEFAULTS.headingLevel,
  className,
}: CardCategoryVerticalProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      data-card="category-vertical"
      data-color={color}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-card",
        CARD_COLOR_CLASS[color],
        className,
      )}
    >
      <CategoryMedia image={image} sizes={sizes} className="h-240 w-full" />
      <div className="flex items-end justify-between gap-8 px-12 py-20">
        <Heading className="min-w-0 text-title-sm text-text-primary">
          <NextLink
            href={href}
            className="block truncate rounded-4 group-hover/card:underline after:absolute after:inset-0"
          >
            {title}
          </NextLink>
        </Heading>
        {rightIcon && <Icon name={rightIcon} className="shrink-0" />}
      </div>
    </article>
  );
}
