import { cva } from "class-variance-authority";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { CategoryMedia } from "./card-category-parts";

// Figma `Card.Category.ChipType` (State) on `.Base.Card.Category.ChipType`: a pill (radius full,
// padding 8 · 16 · 8 · 8, gap 8, 64px tall) with a 48px round image and the title (title-small,
// one line). Default: surface-primary with a 1px border-default ring; Hover & Tap: the ring is
// 2px; Selected: surface-secondary. With `href` it's a link (Selected = aria-current="page"),
// otherwise a toggle button (Selected = aria-pressed) for category filter strips.

export const cardCategoryChipTypeVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center gap-8 rounded-full py-8 pr-16 pl-8",
    "inset-ring inset-ring-border-default hover:inset-ring-2",
  ],
  {
    variants: {
      selected: { true: "bg-surface-secondary", false: "bg-surface-primary" },
    },
  },
);

export const CARD_CATEGORY_CHIP_TYPE_DEFAULTS = { selected: false } as const;

export interface CardCategoryChipTypeProps {
  /** Figma `Title Text`. */
  title: string;
  /** Figma `img`: shown in a 48px circle; a placeholder shows when it's missing. */
  image?: ImageAsset;
  /** Navigates to the category. */
  href?: string;
  /** Without `href`: toggles the category filter. */
  onClick?: () => void;
  /** Figma `State=Selected` (current page, or active filter). */
  selected?: boolean;
  className?: string;
}

export function CardCategoryChipType({
  title,
  image,
  href,
  onClick,
  selected = CARD_CATEGORY_CHIP_TYPE_DEFAULTS.selected,
  className,
}: CardCategoryChipTypeProps) {
  const classes = cn(cardCategoryChipTypeVariants({ selected }), className);
  const content = (
    <>
      <CategoryMedia decorative image={image} sizes="48px" className="size-48 rounded-full" />
      <span className="text-title-sm whitespace-nowrap text-text-primary">{title}</span>
    </>
  );

  if (href) {
    return (
      <NextLink
        data-card="category-chip-type"
        href={href}
        aria-current={selected ? "page" : undefined}
        className={classes}
      >
        {content}
      </NextLink>
    );
  }
  return (
    <button
      data-card="category-chip-type"
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={classes}
    >
      {content}
    </button>
  );
}
