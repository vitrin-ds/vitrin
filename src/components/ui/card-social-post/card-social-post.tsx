import NextImage from "next/image";
import NextLink from "next/link";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";

// Figma `Card.Social.Post` (Type) on `.Base.Card.Social.Post` (31720:9152): a UGC tile for the
// single-brand Social band, always on a dark or gradient surface (its text is text-on-accent).
// - Post: a 16px avatar dot (surface-accent-subtle) and the @handle (label-small), gap 8 over a
//   4:5 image on surface-tertiary. The whole tile links to the post.
// - See more: the closing tile, same size. The handle row is an empty 16px spacer; the 4:5 box
//   has a 1px dashed text-on-accent border and "+ See more" (label-large) in the middle.
// Figma has no Hover or Focus state; as on Card.Product.Minimal, hover and keyboard focus
// underline the text (the handle, or "See more"), so focus stays visible.

export interface CardSocialPostLabels {
  seeMore: string;
  /** Accessible name of a post tile. */
  post: (handle: string) => string;
}

export const CARD_SOCIAL_POST_LABELS: CardSocialPostLabels = {
  seeMore: "See more",
  post: (handle) => `Post by ${handle}`,
};

export const CARD_SOCIAL_POST_DEFAULTS = { type: "post" } as const;

interface CardSocialPostCommon {
  /** The post, or the feed for See more. */
  href: string;
  labels?: CardSocialPostLabels;
  className?: string;
}

export type CardSocialPostProps = CardSocialPostCommon &
  (
    | {
        /** Figma `Type=Post`. */
        type?: "post";
        /** Figma `Handle`: the creator's @handle. */
        handle: string;
        image?: ImageAsset;
      }
    | {
        /** Figma `Type=See more`: the closing tile. */
        type: "see-more";
      }
  );

const TILE =
  "group/tile flex flex-col gap-8 rounded-4 text-text-on-accent focus-visible:outline-none";
const UNDERLINE = "group-hover/tile:underline group-focus-visible/tile:underline";
const FRAME = "relative aspect-4/5 w-full overflow-hidden";

export function CardSocialPost(props: CardSocialPostProps) {
  const { href, labels = CARD_SOCIAL_POST_LABELS, className } = props;
  if (props.type === "see-more") {
    return (
      <NextLink href={href} className={cn(TILE, className)}>
        <span aria-hidden className="h-16" />
        <span
          className={cn(
            FRAME,
            "flex items-center justify-center border border-dashed border-text-on-accent text-label-lg",
          )}
        >
          <span aria-hidden>+&nbsp;&nbsp;</span>
          <span className={UNDERLINE}>{labels.seeMore}</span>
        </span>
      </NextLink>
    );
  }
  const { handle, image } = props;
  return (
    <NextLink href={href} aria-label={labels.post(handle)} className={cn(TILE, className)}>
      <span className="flex items-center gap-8">
        <span aria-hidden className="size-16 shrink-0 rounded-full bg-surface-accent-subtle" />
        <span className={cn("truncate text-label-sm", UNDERLINE)}>{handle}</span>
      </span>
      <span className={cn(FRAME, "bg-surface-tertiary")}>
        {image && (
          <NextImage
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 220px, 50vw"
            className="object-cover"
          />
        )}
      </span>
    </NextLink>
  );
}
