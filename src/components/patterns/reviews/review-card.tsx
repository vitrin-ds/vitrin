import NextImage from "next/image";
import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Rating } from "@/components/ui/rating/rating";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";

// Figma `Card.UserReview` (03. Patterns › Social Proof & Reviews › Review Card, main 8238:47346)
// as used on 06.01 (the review slider, 334px cards) and 06.02 (the list, full width). Padding 12,
// gap 12, radius 8, a 1px border-neutral ring (`card`) or no frame with a bottom divider
// (`list`). The reviewer and the date (title-small); the score (Rating sm: 16px stars + value);
// the comment (body-small); the photo strip (44px tiles, radius 8, gap 4: at most five and a
// "+N" tile). The review title from the data sits above the comment (title-small).
//
// Figma `Actions` ("Was this review helpful?") is the `actions` slot: pass ReviewHelpful (a
// client component; the card itself stays server-renderable). It sits at the foot of the card,
// so cards stretched to one row height (the PDP slider) keep it on one line, photos or not. A
// review awaiting moderation
// shows `pendingLabel` in place of the verified mark. The card is an <article> whose heading is
// the reviewer, so a list of cards can be browsed by heading.

export const reviewCardVariants = cva("flex flex-col gap-12 bg-surface-primary p-12", {
  variants: {
    variant: {
      card: "rounded-card inset-ring inset-ring-border-neutral",
      list: "border-b border-border-neutral",
    },
  },
});

export const REVIEW_CARD_DEFAULTS = { variant: "card", headingLevel: 3, locale: "en" } as const;

/** Photos shown before the "+N" tile. */
export const REVIEW_CARD_MAX_PHOTOS = 5;

export interface ReviewCardLabels {
  verified: string;
  /** The "+N" tile; must start with the visible "+N" (WCAG 2.5.3). */
  morePhotos: (count: number) => string;
  photos: string;
}

export const REVIEW_CARD_LABELS: ReviewCardLabels = {
  verified: "Verified purchase",
  morePhotos: (count) => `+${count} more ${count === 1 ? "photo" : "photos"}`,
  photos: "Customer photos",
};

export interface ReviewCardProps {
  author: string;
  /** ISO 8601. */
  date: string;
  /** 1 … 5. */
  rating: number;
  title?: string;
  body: string;
  photos?: readonly ImageAsset[];
  verified?: boolean;
  /** Figma `Actions`: the helpfulness row (ReviewHelpful). */
  actions?: ReactNode;
  /** Shown for the visitor's own review awaiting moderation, e.g. "Awaiting moderation". */
  pendingLabel?: string;
  /** Figma: bordered card or borderless list item. */
  variant?: "card" | "list";
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  labels?: ReviewCardLabels;
  className?: string;
}

export function ReviewCard({
  author,
  date,
  rating,
  title,
  body,
  photos = [],
  verified = false,
  actions,
  pendingLabel,
  variant = REVIEW_CARD_DEFAULTS.variant,
  headingLevel = REVIEW_CARD_DEFAULTS.headingLevel,
  locale = REVIEW_CARD_DEFAULTS.locale,
  labels = REVIEW_CARD_LABELS,
  className,
}: ReviewCardProps) {
  const Heading = `h${headingLevel}` as const;
  const shown = photos.slice(0, REVIEW_CARD_MAX_PHOTOS);
  const more = photos.length - shown.length;
  const formatted = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

  return (
    <article className={cn(reviewCardVariants({ variant }), className)}>
      <header className="flex flex-wrap items-center gap-12 text-title-sm text-text-primary">
        <Heading className="text-title-sm">{author}</Heading>
        <time dateTime={date}>{formatted}</time>
        {pendingLabel ? (
          <span className="text-label-sm text-text-secondary">{pendingLabel}</span>
        ) : (
          verified && <span className="text-label-sm text-text-success">{labels.verified}</span>
        )}
      </header>
      <div className="flex flex-col gap-8">
        <Rating value={rating} size="sm" locale={locale} />
        {title && <p className="text-title-sm text-text-primary">{title}</p>}
        <p className="text-body-sm text-text-primary">{body}</p>
        {shown.length > 0 && (
          <ul aria-label={labels.photos} className="flex gap-4 overflow-hidden">
            {shown.map((photo, i) => (
              <li
                key={`${photo.src}-${i}`}
                className="relative size-44 shrink-0 overflow-hidden rounded-8 bg-surface-neutral inset-ring inset-ring-border-neutral"
              >
                <NextImage
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </li>
            ))}
            {more > 0 && (
              <li className="flex size-44 shrink-0 items-center justify-center rounded-8 text-label-lg text-text-primary inset-ring inset-ring-border-neutral">
                <span aria-hidden>+{more}</span>
                <span className="sr-only">{labels.morePhotos(more)}</span>
              </li>
            )}
          </ul>
        )}
      </div>
      {actions && <div className="mt-auto">{actions}</div>}
    </article>
  );
}
