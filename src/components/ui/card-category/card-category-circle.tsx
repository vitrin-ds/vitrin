import NextLink from "next/link";
import { cn } from "@/lib/cn";
import { CategoryMedia, type CardCategoryBaseProps } from "./card-category-parts";

// Figma `Card.Category.Circle` (State) on `.Base.Card.Category.Circle`: 112px wide, an 80px round
// image and the title below (title-small, centred), gap 12. Hover & Tap: a 4px border-default
// ring inside the image and the title underlined. The whole card is one link.
// `media="logo"` (Mega Menu Trending Brands): the brand's wordmark, uncropped, on a white circle.

export interface CardCategoryCircleProps extends CardCategoryBaseProps {
  /**
   * `photo` (default): a scene covers the circle. `logo`: a wordmark contained on white.
   * `packshot`: a cut-out product contained on surface-secondary.
   */
  media?: "photo" | "logo" | "packshot";
  /** Figma `Show Title`: off when the image (a logo) speaks for itself; screen readers still get it. */
  showTitle?: boolean;
}

export function CardCategoryCircle({
  title,
  href,
  image,
  sizes = "80px",
  media = "photo",
  showTitle = true,
  className,
}: CardCategoryCircleProps) {
  return (
    <NextLink
      href={href}
      className={cn("group/card flex w-112 flex-col items-center gap-12 rounded-8", className)}
    >
      <span
        className={cn(
          "relative size-80 shrink-0",
          // The image covers the frame, so the hover ring is drawn on top of it.
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-full",
          "after:border-border-default group-hover/card:after:border-4",
        )}
      >
        <CategoryMedia
          decorative
          image={image}
          sizes={sizes}
          fit={media === "photo" ? "cover" : media}
          padded={media === "packshot"}
          className={cn("size-80 rounded-full", media === "packshot" && "bg-surface-secondary")}
        />
      </span>
      <span
        className={cn(
          "w-full text-center text-title-sm text-text-primary group-hover/card:underline",
          !showTitle && "sr-only",
        )}
      >
        {title}
      </span>
    </NextLink>
  );
}
