import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { CARD_COLOR_CLASS } from "../card-product/card-product-parts";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Horizontal.Small` (State × Color) on `.Base.Card.Category.Horizontal.Small`:
// radius 8, min width 156, a 102px image on top and a 48px bottom row (padding 8) with the category
// name (label-medium, up to two lines). Color Brand (= Default, surface-secondary) or White
// (surface-primary). Hover underlines the name. Small enough that the whole card is one link.

export const CARD_CATEGORY_HORIZONTAL_SMALL_DEFAULTS = { color: "brand" } as const;

export interface CardCategoryHorizontalSmallProps extends CardCategoryBaseProps {
  /** Figma `Color`: Brand / Default (surface-secondary) or White (surface-primary). */
  color?: "brand" | "white";
}

export function CardCategoryHorizontalSmall({
  title,
  href,
  image,
  sizes = "(min-width: 1024px) 244px, 45vw",
  color = CARD_CATEGORY_HORIZONTAL_SMALL_DEFAULTS.color,
  className,
}: CardCategoryHorizontalSmallProps) {
  return (
    <NextLink
      data-card="category-horizontal-small"
      data-color={color}
      href={href}
      className={cn(
        "group/card flex min-w-156 flex-col overflow-hidden rounded-card",
        CARD_COLOR_CLASS[color],
        className,
      )}
    >
      <CategoryMedia decorative image={image} sizes={sizes} className="h-102 w-full" />
      <span className="flex min-h-48 items-center p-8">
        <span className="line-clamp-2 text-label-md text-text-primary group-hover/card:underline">
          {title}
        </span>
      </span>
    </NextLink>
  );
}
