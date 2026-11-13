import type { ReactNode } from "react";

/** Figma's masked format: "**** **** **** 5012". Only the last four digits are ever passed in. */
export function maskedCardNumber(last4: string): string {
  return `**** **** **** ${last4}`;
}

/** The masked number for the eye; "ending in 5012" for screen readers (no "star star …"). */
export function MaskedCardNumber({
  last4,
  srText,
  short = false,
}: {
  last4: string;
  /** "•••• 5012", as Payment Methods (Figma 03.03). */
  short?: boolean;
  /** e.g. "Card ending in 5012". */
  srText: string;
}): ReactNode {
  return (
    <>
      <span aria-hidden>{short ? `•••• ${last4}` : maskedCardNumber(last4)}</span>
      <span className="sr-only">{srText}</span>
    </>
  );
}
