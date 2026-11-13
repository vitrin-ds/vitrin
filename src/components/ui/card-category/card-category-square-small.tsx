import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { CARD_COLOR_CLASS } from "../card-product/card-product-parts";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Square.Small` (State × Color) on `.Base.Card.Category.Square.Small`: a
// square card (radius 8, padding 24 · 16, gap 20, centred) with a 128px thumbnail (radius 8) and
// the category name (title-small, centred). Color Brand (surface-secondary) or White
// (surface-primary). Hover: a 1px border-default ring inside the card and the name underlined.
// Small enough that the whole card is one link.

export const CARD_CATEGORY_SQUARE_SMALL_DEFAULTS = { color: "brand" } as const;

export interface CardCategorySquareSmallProps extends CardCategoryBaseProps {
  /** Figma `Color`: Brand (surface-secondary) or White (surface-primary). */
  color?: "brand" | "white";
  /** `photo` (default): a scene covers the thumbnail. `packshot`: a cut-out on the card's fill. */
  media?: "photo" | "packshot";
}

export function CardCategorySquareSmall({
  title,
  href,
  image,
  sizes = "128px",
  color = CARD_CATEGORY_SQUARE_SMALL_DEFAULTS.color,
  media = "photo",
  className,
}: CardCategorySquareSmallProps) {
  return (
    <NextLink
      data-card="category-square-small"
      data-color={color}
      href={href}
      className={cn(
        "group/card flex aspect-square flex-col items-center justify-center gap-20 rounded-card px-16 py-24",
        "hover:inset-ring hover:inset-ring-border-default",
        CARD_COLOR_CLASS[color],
        className,
      )}
    >
      <CategoryMedia
        decorative
        image={image}
        sizes={sizes}
        fit={media === "photo" ? "cover" : "packshot"}
        className="size-128 rounded-8"
      />
      <span className="text-center text-title-sm text-text-primary group-hover/card:underline">
        {title}
      </span>
    </NextLink>
  );
}
