"use client";

import { useId } from "react";
import { Icon } from "@/components/ui/icon/icon";
import type { ReviewVote } from "@/lib/api/types/reviews";
import { cn } from "@/lib/cn";

// Figma Card.UserReview › Actions (8238:34706): a border-neutral divider, padding-top 8, the
// question (label-small, text-primary) and the thumbs: thumb_up / thumb_down (20px, icon-accent)
// each with its count (label-small), gap 4, 16 apart. Each thumb is a toggle button (aria-pressed);
// one vote per review, so after voting both are aria-disabled and the chosen one is filled.
// The vote is counted in the shown number. Feedback is the caller's (a Toast on the site).

export interface ReviewHelpfulLabels {
  question: string;
  /** Hidden text before the visible count, so the name is e.g. "Yes, helpful 12" (WCAG 2.5.3). */
  helpful: string;
  notHelpful: string;
}

export const REVIEW_HELPFUL_LABELS: ReviewHelpfulLabels = {
  question: "Was this review helpful?",
  helpful: "Yes, helpful",
  notHelpful: "No, not helpful",
};

export interface ReviewHelpfulProps {
  /** Votes before this visitor's. */
  helpfulCount: number;
  notHelpfulCount: number;
  /** This visitor's vote, if any. */
  vote?: ReviewVote | null;
  /** Called once; ignored after a vote. */
  onVote?: (vote: ReviewVote) => void;
  locale?: string;
  labels?: ReviewHelpfulLabels;
  className?: string;
}

export function ReviewHelpful({
  helpfulCount,
  notHelpfulCount,
  vote = null,
  onVote,
  locale = "en",
  labels = REVIEW_HELPFUL_LABELS,
  className,
}: ReviewHelpfulProps) {
  const id = useId();
  const number = new Intl.NumberFormat(locale);
  const thumbs = [
    {
      value: "helpful",
      icon: "thumb_up",
      count: helpfulCount + (vote === "helpful" ? 1 : 0),
      name: labels.helpful,
    },
    {
      value: "not-helpful",
      icon: "thumb_down",
      count: notHelpfulCount + (vote === "not-helpful" ? 1 : 0),
      name: labels.notHelpful,
    },
  ] as const;

  return (
    <div
      className={cn(
        "flex items-center gap-12 border-t border-border-neutral pt-8 text-label-sm text-text-primary",
        className,
      )}
    >
      <p id={`${id}-question`} className="min-w-0 flex-1">
        {labels.question}
      </p>
      <div role="group" aria-labelledby={`${id}-question`} className="flex items-center gap-16">
        {thumbs.map((thumb) => {
          const pressed = vote === thumb.value;
          const formatted = number.format(thumb.count);
          return (
            <button
              key={thumb.value}
              type="button"
              aria-pressed={pressed}
              aria-disabled={vote !== null || !onVote}
              onClick={() => {
                if (vote === null) onVote?.(thumb.value);
              }}
              className={cn(
                // 20px glyph, 44px target (the row is tight: the hit area overlaps the padding).
                "relative flex items-center gap-4 rounded-4 before:absolute before:-inset-12",
                vote === null && onVote ? "cursor-pointer" : "cursor-default",
              )}
            >
              <Icon name={thumb.icon} fill={pressed} tone="accent" />
              <span className="sr-only">{thumb.name}</span> <span>{formatted}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
