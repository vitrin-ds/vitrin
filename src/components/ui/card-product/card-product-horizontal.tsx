import { cn } from "@/lib/cn";
import { Chip } from "../chip/chip";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Price } from "../price/price";
import {
  CARD_COLOR_CLASS,
  ProductImage,
  ProductLink,
  type CardProductBaseProps,
} from "./card-product-parts";

// Figma `Card.Product.Horizontal` (State × Color): a row for wishlists, search results and order
// lists. Padding 16, gap 12, radius 8 with a 1px border-default ring (2px on hover); an 80px image
// (radius 4, no stroke: the cut-out sits on the card's colour), category
// (body-small, text-accent), name (title-small) and Price (gap 8), the selected variant as a Light
// Chip, and a trailing 20px icon (icon-accent). The whole card links to the product. Brand
// (surface-secondary) by default, White on request.

export const CARD_PRODUCT_HORIZONTAL_DEFAULTS = {
  color: "brand",
  rightIcon: "keyboard_arrow_right",
  locale: "en",
} as const;

export interface CardProductHorizontalProps extends CardProductBaseProps {
  /** Figma `Chip [Variant]`: the selected variant, e.g. "50 ml". */
  variant?: string;
  /** Figma `Right Icon` (decorative). Defaults to keyboard_arrow_right. */
  rightIcon?: IconName | null;
}

export function CardProductHorizontal({
  name,
  href,
  category,
  image,
  price,
  compareAt,
  color = CARD_PRODUCT_HORIZONTAL_DEFAULTS.color,
  locale = CARD_PRODUCT_HORIZONTAL_DEFAULTS.locale,
  variant,
  rightIcon = CARD_PRODUCT_HORIZONTAL_DEFAULTS.rightIcon,
  className,
}: CardProductHorizontalProps) {
  return (
    <article
      data-card="product-horizontal"
      data-color={color}
      className={cn(
        "relative flex items-center gap-12 rounded-card p-16",
        "inset-ring inset-ring-border-default hover:inset-ring-2",
        CARD_COLOR_CLASS[color],
        className,
      )}
    >
      <ProductImage image={image} ratio="1/1" sizes="80px" className="w-80 shrink-0 rounded-4" />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {category && <p className="text-body-sm text-text-accent">{category}</p>}
        <h3 className="text-title-sm">
          <ProductLink href={href} name={name} />
        </h3>
        <Price price={price} compareAt={compareAt} locale={locale} />
      </div>
      {variant && <Chip color="light">{variant}</Chip>}
      {rightIcon && <Icon name={rightIcon} tone="accent" />}
    </article>
  );
}
