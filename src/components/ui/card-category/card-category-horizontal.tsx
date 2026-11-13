import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { CARD_COLOR_CLASS } from "../card-product/card-product-parts";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Horizontal` (State × Color) on `.Base.Card.Category.Horizontal`: radius 8,
// a wide 150px image on top, then the bottom row (padding 12): the category name (title-small, one
// line, truncated) over the product count (body-small, text-tertiary), gap 8, and the 20px
// keyboard_arrow_right glyph (icon-accent). Color Brand (surface-secondary) or White
// (surface-primary). Hover underlines the name. Used in mega-menu showcases and carousels. The
// name is the link and its ::after covers the card.

export interface CardCategoryHorizontalLabels {
  productCount: (count: number) => string;
}

export const CARD_CATEGORY_HORIZONTAL_LABELS: CardCategoryHorizontalLabels = {
  productCount: (count) => `${count} ${count === 1 ? "Product" : "Products"}`,
};

export const CARD_CATEGORY_HORIZONTAL_DEFAULTS = {
  color: "brand",
  showBottom: true,
  rightIcon: "keyboard_arrow_right",
  headingLevel: 3,
} as const;

export interface CardCategoryHorizontalProps extends CardCategoryBaseProps {
  /** Figma `[Count] Products`: how many products the category holds. */
  productCount?: number;
  /** Figma `Color`: Brand (surface-secondary) or White (surface-primary). */
  color?: "brand" | "white";
  /** Figma `Show Bottom`: off when the image speaks for itself; the title stays for screen readers. */
  showBottom?: boolean;
  /** Figma right icon (20px, decorative); `null` hides it. */
  rightIcon?: IconName | null;
  headingLevel?: 2 | 3 | 4;
  labels?: CardCategoryHorizontalLabels;
}

export function CardCategoryHorizontal({
  title,
  href,
  image,
  sizes = "(min-width: 1024px) 368px, 80vw",
  productCount,
  showBottom = CARD_CATEGORY_HORIZONTAL_DEFAULTS.showBottom,
  color = CARD_CATEGORY_HORIZONTAL_DEFAULTS.color,
  rightIcon = CARD_CATEGORY_HORIZONTAL_DEFAULTS.rightIcon,
  headingLevel = CARD_CATEGORY_HORIZONTAL_DEFAULTS.headingLevel,
  labels = CARD_CATEGORY_HORIZONTAL_LABELS,
  className,
}: CardCategoryHorizontalProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      data-card="category-horizontal"
      data-color={color}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-card",
        CARD_COLOR_CLASS[color],
        className,
      )}
    >
      <CategoryMedia image={image} sizes={sizes} className="h-150 w-full" />
      {!showBottom && (
        <Heading>
          <NextLink href={href} className="absolute inset-0 rounded-card">
            <span className="sr-only">{title}</span>
          </NextLink>
        </Heading>
      )}
      {showBottom && (
        <div className="flex items-center justify-between gap-8 p-12">
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <Heading className="text-title-sm text-text-primary">
              <NextLink
                href={href}
                className="block truncate rounded-4 group-hover/card:underline after:absolute after:inset-0"
              >
                {title}
              </NextLink>
            </Heading>
            {productCount !== undefined && (
              <p className="text-body-sm text-text-tertiary">{labels.productCount(productCount)}</p>
            )}
          </div>
          {rightIcon && <Icon name={rightIcon} className="shrink-0" />}
        </div>
      )}
    </article>
  );
}
