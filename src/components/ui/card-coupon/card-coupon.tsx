import { cva } from "class-variance-authority";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label, type LabelProps } from "../label/label";

// Figma `Card.Coupon` (State × Type) on its Base (03.04): a top bar (surface-neutral,
// padding 8, gap 4) with the code (title-small), its copy button, the Label and the menu; the
// details (padding 12, gap 12): the value (headline-small) with what it applies to (label-xsmall),
// the description (body-small text-secondary), the Neutral Labels of its conditions and the
// disclaimer (radius 8, padding 8, gap 8, surface-neutral, text-primary); then the terms as the
// card's last section. Every `Show` slot is optional. Type: List Item = a bottom border, Card =
// radius 8 and a border all round. State: Warning = border-warning; Expired = border-error on a
// List Item and border-neutral on a Card (as Figma); the content stays as it is.

export const cardCouponVariants = cva(
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

export const CARD_COUPON_DEFAULTS = { type: "list", state: "default", headingLevel: 3 } as const;

export interface CardCouponProps {
  /** Figma `Item Primary Identity`: the code, e.g. "SUMMER25". Names the card. */
  code: string;
  /** Figma `Show Label`. */
  label?: { text: string; color: NonNullable<LabelProps["color"]>; icon?: IconName };
  /** Figma `Value`, e.g. "-€25", "-20%". */
  value: string;
  /** Figma `Show Requirement` + `Requirement Text`, e.g. "off your order". */
  caption?: string;
  /** Figma `Show Info` + `Info Text`. */
  description?: string;
  /** Figma `Show Labels` + `Label [1]–[3]`: the conditions (up to three). */
  tags?: readonly { text: string; icon?: IconName }[];
  /** Figma `Show Main Disclaimer` + `Main Disclaimer Text` / `Icon`: the expiry, or when it was used. */
  disclaimer?: { text: string; icon: IconName };
  copy?: { label: string; onClick: () => void };
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

export function CardCoupon({
  code,
  label,
  value,
  caption,
  description,
  tags = [],
  disclaimer,
  copy,
  state = CARD_COUPON_DEFAULTS.state,
  type = CARD_COUPON_DEFAULTS.type,
  menu,
  terms,
  headingLevel = CARD_COUPON_DEFAULTS.headingLevel,
  className,
}: CardCouponProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      data-card="coupon-extended"
      aria-labelledby={`${id}-title`}
      className={cn(cardCouponVariants({ type, state }), className)}
    >
      <div
        className={cn(
          "flex items-center gap-4 bg-surface-neutral p-8",
          type === "card" && "rounded-t-card",
        )}
      >
        <Heading id={`${id}-title`} className="text-title-sm text-text-primary">
          {code}
        </Heading>
        {copy && (
          <button
            type="button"
            aria-label={copy.label}
            onClick={copy.onClick}
            className="relative flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12"
          >
            <Icon name="content_copy" size="16" weight={200} fill={false} tone="current" />
          </button>
        )}
        {label && (
          <Label color={label.color} icon={label.icon}>
            {label.text}
          </Label>
        )}
        {menu && <div className="ml-auto flex">{menu}</div>}
      </div>
      <div className="flex flex-col gap-12 p-12">
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-8">
            <span className="text-headline-sm text-text-primary tabular-nums">{value}</span>
            {caption && <span className="text-label-xs text-text-tertiary">{caption}</span>}
          </p>
          {description && <p className="text-body-sm text-text-secondary">{description}</p>}
        </div>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {tags.slice(0, 3).map((tag) => (
              <li key={tag.text} className="flex">
                <Label color="neutral" icon={tag.icon}>
                  {tag.text}
                </Label>
              </li>
            ))}
          </ul>
        )}
        {disclaimer && (
          <p className="flex items-center gap-8 rounded-8 bg-surface-neutral p-8 text-body-sm text-text-primary">
            <Icon name={disclaimer.icon} weight={200} fill={false} tone="primary" />
            {disclaimer.text}
          </p>
        )}
      </div>
      {terms}
    </section>
  );
}
