import NextImage from "next/image";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/api/types/catalog";

// Pieces shared by the Card.Category family: the props every card takes and the image frame.
// Category images are scenes, so they cover their frame. The frames have the fixed Figma heights
// (240 / 150 / 102 …) while the width follows the grid; the project `Image` only has fixed ratios,
// so the frame here is sized by the card and next/image fills it. A missing image shows the
// Figma "Add Image" surface (the `add-image` utility). `fit="logo"`: a brand wordmark, uncropped
// and inset 12 on surface-static-light (white in both themes, so the purple marks stay legible).

export interface CardCategoryBaseProps {
  /** Figma `Title Text` / `Category Name`. Also the link's accessible name. */
  title: string;
  /** The category page. */
  href: string;
  /** The category image; a placeholder shows when it's missing. */
  image?: ImageAsset;
  /** Rendered width per breakpoint for next/image. */
  sizes?: string;
  className?: string;
}

export function CategoryMedia({
  image,
  sizes,
  decorative = false,
  fit = "cover",
  padded = false,
  className,
}: {
  image?: ImageAsset;
  sizes: string;
  /**
   * `cover`: a scene fills the frame. `logo`: a wordmark, contained, on white. `packshot`: a cut-out
   * product, contained, with the card's own fill behind it.
   */
  fit?: "cover" | "logo" | "packshot";
  /** Keeps a `packshot` 8 clear of the frame, for a round frame that would touch the product. */
  padded?: boolean;
  /** In a card that is one link, the title names the link: the image adds nothing (alt=""). */
  decorative?: boolean;
  /** Size and shape of the frame (e.g. `h-150 w-full`, `size-80 rounded-full`). */
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        fit === "logo" && "bg-surface-static-light",
        fit === "cover" && "bg-surface-skeleton",
        className,
      )}
    >
      {image && fit === "logo" ? (
        <span className="absolute inset-12">
          <NextImage
            src={image.src}
            alt={decorative ? "" : image.alt}
            fill
            sizes={sizes}
            className="object-contain"
          />
        </span>
      ) : image && padded ? (
        <span className="absolute inset-8">
          <NextImage
            src={image.src}
            alt={decorative ? "" : image.alt}
            fill
            sizes={sizes}
            className="object-contain"
          />
        </span>
      ) : image ? (
        <NextImage
          src={image.src}
          alt={decorative ? "" : image.alt}
          fill
          sizes={sizes}
          className={fit === "packshot" ? "object-contain" : "object-cover"}
        />
      ) : (
        <span aria-hidden data-placeholder className="absolute inset-0 add-image" />
      )}
    </span>
  );
}
