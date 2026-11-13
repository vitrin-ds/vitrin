import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label, type LabelProps } from "../label/label";
import { Progress } from "../progress/progress";

// Figma `Card.Rewards` (31005:37531) on `.Base.Card.Rewards` (31005:37466): a gift card, coupon
// or credit in the account's rewards wallet (My Account WD.03.P002 Rewards). 254 tall, padding
// 12, content pushed apart: on top the 20px glyph (redeem for gift cards, sell for coupons) and a
// Label (Info "Default", Success "Ready", Warning "13 days", Neutral "Promo"); below, gap 12:
// Balance (overline label-small text-tertiary, the value in headline-large, caption body-medium
// text-secondary), an optional Progress (what's left of a gift card) and Info (title-small name +
// body-small details). Surface primary, 1px border-neutral, radius 8; flat, like every card at rest.
// Figma `State`: Default · Hover & Tap (CSS: interactive-subtle-hover fill and border) · Warning
// (a reward about to expire: border-warning, the overline, caption and details text-warning) ·
// Disabled (surface-disabled, border-disabled, no hover; the text stays, as in Figma). Type has
// one value (Card). The width comes from the container (Figma 180 in a Card Rail).

export const cardRewardsVariants = cva(
  "flex h-254 w-full flex-col justify-between rounded-card p-12 inset-ring",
  {
    variants: {
      state: {
        // Figma Hover & Tap: interactive-subtle-hover fill and border.
        default: [
          "bg-surface-primary inset-ring-border-neutral",
          "hover:bg-interactive-subtle-hover hover:inset-ring-interactive-subtle-hover",
        ],
        warning: "bg-surface-primary inset-ring-border-warning",
        disabled: "bg-surface-disabled inset-ring-border-disabled",
      },
    },
  },
);

export const CARD_REWARDS_DEFAULTS = {
  state: "default",
  icon: "redeem",
  headingLevel: 3,
} as const;

export interface CardRewardsProps {
  /** Figma `State` (Hover & Tap is CSS): Warning for a reward about to expire. */
  state?: NonNullable<VariantProps<typeof cardRewardsVariants>["state"]>;
  /** Figma top-left glyph (20px, decorative): redeem (gift card), sell (coupon). */
  icon?: IconName;
  /** Figma `Label`: the reward's state, e.g. { color: "info", icon: "circle", text: "Default" }. */
  label?: { text: string; color: NonNullable<LabelProps["color"]>; icon?: IconName };
  /** Figma `Balance` overline: "Balance", "Save". */
  overline: string;
  /** Figma value: "€42.50", "-€25", "-25%". */
  value: string;
  /** Figma caption under the value: "of €50", "off orders over €100". */
  caption?: string;
  /** Figma `Progress` (Show Progress): what's left, e.g. 4250 of 5000. */
  progress?: { value: number; max: number; label: string; valueText?: string };
  /** Figma `Info` title: the gift card's name or the coupon code. The card's heading. */
  title: string;
  /** Figma `Info` details: "Gift card · •••• 7K2M", "Coupon · Single use". */
  details?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CardRewards({
  state = CARD_REWARDS_DEFAULTS.state,
  icon = CARD_REWARDS_DEFAULTS.icon,
  label,
  overline,
  value,
  caption,
  progress,
  title,
  details,
  headingLevel = CARD_REWARDS_DEFAULTS.headingLevel,
  className,
}: CardRewardsProps) {
  const Heading = `h${headingLevel}` as const;
  const warning = state === "warning";
  const muted = warning ? "text-text-warning" : "text-text-secondary";
  return (
    <article
      data-card="rewards"
      aria-disabled={state === "disabled" || undefined}
      className={cn(cardRewardsVariants({ state }), className)}
    >
      <div className="flex items-center justify-between gap-8">
        <Icon name={icon} weight={200} />
        {label && (
          <Label color={label.color} icon={label.icon}>
            {label.text}
          </Label>
        )}
      </div>
      <div className="flex flex-col gap-12">
        {/* Read as one phrase: "Balance €42.50 of €50". */}
        <p className="flex flex-col">
          <span
            className={cn(
              "text-label-sm uppercase",
              warning ? "text-text-warning" : "text-text-tertiary",
            )}
          >
            {overline}
          </span>{" "}
          <span className="text-headline-lg text-text-primary tabular-nums">{value}</span>{" "}
          {caption && <span className={cn("text-body-md", muted)}>{caption}</span>}
        </p>
        {progress && (
          <Progress
            size="4x"
            value={progress.value}
            max={progress.max}
            label={progress.label}
            valueText={progress.valueText}
          />
        )}
        <div className="flex flex-col gap-2">
          <Heading className="text-title-sm break-words text-text-primary">{title}</Heading>
          {details && <p className={cn("text-body-sm", muted)}>{details}</p>}
        </div>
      </div>
    </article>
  );
}
