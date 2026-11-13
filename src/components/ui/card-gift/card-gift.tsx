import { cva } from "class-variance-authority";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label, type LabelProps } from "../label/label";
import { Progress } from "../progress/progress";

// Figma `Card.Gift` (State × Type) on `.Base.Card.Gift` (03.04): a top bar (surface-neutral,
// padding 8, gap 4) with the Top Left Icon (redeem, weight 200, filled), the title (title-small),
// the Label and the Right Action; the details (padding 12, gap 12): the overline (label-small),
// the balance (headline-small) with the card total (label-xsmall, text-tertiary), the Progress, the
// masked code (body-small) with its copy button and the expiry (body-small, text-secondary); then
// the terms Accordion as the last section. Every `Show` slot is optional. Type: List Item = a
// bottom border, Card = radius 8 and a border all round (drawn on ::after above the fills).
// State: Warning = border-warning; Expired = the balance, total, code and expiry in
// text-disabled, the border border-error on a List Item and border-neutral on a Card (as Figma).

export const cardGiftVariants = cva(
  "relative flex flex-col bg-surface-primary after:pointer-events-none after:absolute after:inset-0",
  {
    variants: {
      type: { list: "after:border-b", card: "rounded-card after:rounded-card after:border" },
      state: {
        default: "after:border-border-neutral",
        warning: "after:border-border-warning",
        expired: "",
      },
    },
    compoundVariants: [
      { type: "list", state: "expired", className: "after:border-border-error" },
      { type: "card", state: "expired", className: "after:border-border-neutral" },
    ],
  },
);

export const CARD_GIFT_DEFAULTS = {
  type: "list",
  state: "default",
  icon: "redeem",
  headingLevel: 3,
} as const;

export interface CardGiftProps {
  /** Figma `Show Gift Card Title` + `Title Text`, e.g. "Birthday from Mum". Names the card. */
  title?: string;
  /** Figma `Top Left Icon` (20px, decorative). */
  icon?: IconName;
  /** Figma `Show Label`. */
  label?: { text: string; color: NonNullable<LabelProps["color"]>; icon?: IconName };
  /** The overline above the balance, e.g. "AVAILABLE BALANCE". */
  overline: string;
  /** Figma `Balance Text`, e.g. "€42.50". */
  value: string;
  /** Figma `Show Card Total` + `Card Total Text`, e.g. "of €50.00". */
  caption?: string;
  /** Figma `Show Progress`. */
  progress?: { value: number; max: number; label: string; valueText: string };
  /** Figma `Show Code` + `Code Text`: the last four characters (masked). */
  last4?: string;
  /** Copy the code (the content_copy button by the code). */
  copy?: { label: string; onClick: () => void };
  /** Figma `Show Expiry Date` + `Expiry Text`, e.g. "Expires Dec 2028". */
  details?: string;
  /** Figma `State`. */
  state?: "default" | "warning" | "expired";
  /** Figma `Type`: List Item (default) or Card. */
  type?: "list" | "card";
  /** Figma `Show Right Action`: an Action Menu. */
  menu?: ReactNode;
  /** Figma `Show Accordion [Terms & Restrictions]`: an Accordion with the terms (the page builds it). */
  terms?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CardGift({
  title,
  icon = CARD_GIFT_DEFAULTS.icon,
  label,
  overline,
  value,
  caption,
  progress,
  last4,
  copy,
  details,
  state = CARD_GIFT_DEFAULTS.state,
  type = CARD_GIFT_DEFAULTS.type,
  menu,
  terms,
  headingLevel = CARD_GIFT_DEFAULTS.headingLevel,
  className,
}: CardGiftProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const expired = state === "expired";
  const muted = (tone: string) => (expired ? "text-text-disabled" : tone);
  return (
    <section
      data-card="gift-extended"
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn(cardGiftVariants({ type, state }), className)}
    >
      <div
        className={cn(
          "flex items-center gap-4 bg-surface-neutral p-8",
          type === "card" && "rounded-t-card",
        )}
      >
        <Icon name={icon} weight={200} />
        {title && (
          <Heading id={`${id}-title`} className="text-title-sm text-text-primary">
            {title}
          </Heading>
        )}
        {label && (
          <Label color={label.color} icon={label.icon}>
            {label.text}
          </Label>
        )}
        {menu && <div className="ml-auto flex">{menu}</div>}
      </div>
      {/* An expired card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3). */}
      <div className="flex flex-col gap-12 p-12" aria-disabled={expired || undefined}>
        <div className="flex flex-col gap-4">
          <p className="text-label-sm text-text-primary">{overline}</p>
          <p className="flex items-center gap-8">
            <span className={cn("text-headline-sm tabular-nums", muted("text-text-primary"))}>
              {value}
            </span>
            {caption && (
              <span className={cn("text-label-xs tabular-nums", muted("text-text-tertiary"))}>
                {caption}
              </span>
            )}
          </p>
        </div>
        {progress && (
          <Progress
            size="4x"
            value={progress.value}
            max={progress.max}
            label={progress.label}
            valueText={progress.valueText}
          />
        )}
        {(last4 || details) && (
          <div className="flex items-center gap-16">
            {last4 && (
              <p className="flex items-center gap-2">
                <span className={cn("text-body-sm", muted("text-text-primary"))}>•••• {last4}</span>
                {copy && !expired && (
                  <button
                    type="button"
                    aria-label={copy.label}
                    onClick={copy.onClick}
                    className="relative flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12"
                  >
                    <Icon name="content_copy" weight={200} fill={false} tone="current" />
                  </button>
                )}
              </p>
            )}
            {details && (
              <p className={cn("text-body-sm", muted("text-text-secondary"))}>{details}</p>
            )}
          </div>
        )}
      </div>
      {terms}
    </section>
  );
}
