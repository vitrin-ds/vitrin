"use client";

import { cva } from "class-variance-authority";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RadioCardControl, useRadioCardChecked } from "@/components/base/radio-card/radio-card";
import { Button } from "../button/button";
import { Divider } from "../divider/divider";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label } from "../label/label";
import { PaymentNetwork, type PaymentNetworkId } from "../payment-network/payment-network";
import { MaskedCardNumber } from "./mask";

// Figma `Card.PaymentMethod.Extended` (Type × State) on `.Base.Card.PaymentMethod.Extended`: a top
// bar (surface-neutral, padding 8, gap 4) with the network badge, title (title-small), a Label
// (Info; Error when expired) and the more_vert action; the masked number (title-small) and holder
// row (20px glyph + body-small, gap 8) in a 12px content block; then, below a divider, the
// additional details (body-small) and two Small Buttons (Filled + Outline, gap 12). List Item:
// bottom border; Card: radius 8, border all round, drawn on ::after above the top bar's fill.
// Warning: border-warning + text-assistive details; Expired: border-error, Error label, text-error
// details, number and holder in text-secondary (the label carries the state). Disabled greys
// everything out. Inside a RadioCardGroup the card is selectable: Selected is a 2px border-accent
// plus the check_circle badge (see radio-card.tsx). Figma State=Focus (keyboard focus on the card's
// radio): a 1px interactive-focus-ring stroke outside the card (Card: all round; List Item: under it).

export const cardPaymentMethodExtendedVariants = cva(
  "group/card relative flex flex-col after:pointer-events-none after:absolute after:inset-0",
  {
    variants: {
      type: {
        list: "after:border-b has-[[role=radio]:focus-visible]:after:-bottom-px has-[[role=radio]:focus-visible]:after:border-interactive-focus-ring",
        card: "rounded-card after:rounded-card after:border has-[[role=radio]:focus-visible]:outline has-[[role=radio]:focus-visible]:outline-interactive-focus-ring",
      },
      state: {
        default: "after:border-border-neutral",
        warning: "after:border-border-warning",
        expired: "after:border-border-error",
      },
      disabled: {
        true: "bg-surface-disabled after:border-border-disabled",
        false: "bg-surface-primary",
      },
      selected: { true: "after:border-2 after:border-border-accent", false: "" },
    },
    compoundVariants: [
      // Figma Hover & Tap (from Default): interactive-subtle-hover fill, border-default.
      {
        state: "default",
        disabled: false,
        selected: false,
        className: "hover:bg-interactive-subtle-hover hover:after:border-border-default",
      },
    ],
  },
);

export interface PaymentMethodAction {
  label: string;
  onClick: () => void;
  /** Figma Button `Right Icon` (Update expiry & CVV: keyboard_arrow_right). */
  rightIcon?: IconName;
}

export interface CardPaymentMethodExtendedLabels {
  more: (title: string) => string;
  cardEnding: (last4: string) => string;
}

export const CARD_PAYMENT_METHOD_EXTENDED_LABELS: CardPaymentMethodExtendedLabels = {
  more: (title) => `More actions for ${title}`,
  cardEnding: (last4) => `Card ending in ${last4}`,
};

export const CARD_PAYMENT_METHOD_EXTENDED_DEFAULTS = {
  type: "list",
  state: "default",
  holderIcon: "mail",
  headingLevel: 3,
} as const;

export interface CardPaymentMethodExtendedProps {
  /** Value in a RadioCardGroup (checkout payment selection). */
  value?: string;
  /** Figma `Payment Method Icon`. */
  network: PaymentNetworkId;
  /** Figma `Title Text`, e.g. "Visa ending in 5012". */
  title: string;
  /** Figma `Label`, e.g. "Default". */
  label?: string;
  /** Figma `Label` colour; by default Info, Error when expired. */
  labelColor?: "info" | "success" | "warning" | "error";
  /** Figma `Label` icon (8px), e.g. check on Default. */
  labelIcon?: IconName;
  /** Figma `Card Number Text`: only the last four digits, the card masks the rest. */
  last4?: string;
  /** The number as "•••• 5012" (My Account, Figma 03.03). */
  shortNumber?: boolean;
  /** Figma `Holder Detail Text`: cardholder name or e-mail. */
  holderDetail?: string;
  /** Figma `Holder Icon` (20px, decorative); null: none, as a saved card in My Account. */
  holderIcon?: IconName | null;
  /** Figma `Additional Details Text`, e.g. the expiry date. Hidden when empty (Figma Don't). */
  additionalDetails?: string;
  /** Figma `Button [Primary]`, e.g. "Set as default". */
  primaryAction?: PaymentMethodAction;
  /** Figma `Button [Secondary]`, e.g. "Remove". */
  secondaryAction?: PaymentMethodAction;
  /** Figma `Right Action` (more_vert): opens the owner's menu. */
  onMore?: () => void;
  /** Figma `Right Action` as the menu itself (Action Menu), in place of `onMore`. */
  menu?: ReactNode;
  /** Figma `Type`: List Item in checkout, Card in account settings. */
  type?: "list" | "card";
  /** Figma `State`: Warning (expires soon) · Expired. */
  state?: "default" | "warning" | "expired";
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4;
  labels?: CardPaymentMethodExtendedLabels;
  className?: string;
}

export function CardPaymentMethodExtended({
  value,
  network,
  title,
  label,
  labelColor,
  labelIcon,
  last4,
  shortNumber = false,
  holderDetail,
  holderIcon = CARD_PAYMENT_METHOD_EXTENDED_DEFAULTS.holderIcon,
  additionalDetails,
  primaryAction,
  secondaryAction,
  onMore,
  menu,
  type = CARD_PAYMENT_METHOD_EXTENDED_DEFAULTS.type,
  state = CARD_PAYMENT_METHOD_EXTENDED_DEFAULTS.state,
  disabled = false,
  headingLevel = CARD_PAYMENT_METHOD_EXTENDED_DEFAULTS.headingLevel,
  labels = CARD_PAYMENT_METHOD_EXTENDED_LABELS,
  className,
}: CardPaymentMethodExtendedProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const expired = state === "expired";
  const selected = useRadioCardChecked(value);
  // Number and holder: Disabled greys them out; Expired keeps them readable in text-secondary.
  const detailText = disabled
    ? "text-text-disabled"
    : expired
      ? "text-text-secondary"
      : "text-text-primary";
  const hasActions = primaryAction || secondaryAction;

  return (
    <section
      data-card="payment-method-extended"
      aria-labelledby={`${id}-title`}
      className={cn(
        cardPaymentMethodExtendedVariants({ type, state, disabled, selected }),
        className,
      )}
    >
      <RadioCardControl
        value={value}
        labelledBy={`${id}-title`}
        disabled={disabled}
        className={type === "card" ? "rounded-card" : undefined}
      />
      {/* Inactive card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3); a
          region can't carry it, so a layout-free wrapper does. */}
      <div className="contents" aria-disabled={disabled || undefined}>
        <div
          className={cn(
            "flex items-center gap-4 p-8",
            type === "card" && "rounded-t-card",
            disabled ? "bg-surface-disabled" : "bg-surface-neutral",
          )}
        >
          <PaymentNetwork network={network} />
          <Heading
            id={`${id}-title`}
            className={cn("text-title-sm", disabled ? "text-text-disabled" : "text-text-primary")}
          >
            {title}
          </Heading>
          {label && (
            <Label color={labelColor ?? (expired ? "error" : "info")} icon={labelIcon}>
              {label}
            </Label>
          )}
          {menu && <div className="ml-auto flex">{menu}</div>}
          {onMore && (
            <button
              type="button"
              aria-label={labels.more(title)}
              onClick={onMore}
              disabled={disabled}
              className={cn(
                "relative ml-auto flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12",
                "disabled:cursor-not-allowed disabled:text-icon-disabled",
              )}
            >
              <Icon name="more_vert" weight={200} fill={false} tone="current" />
            </button>
          )}
        </div>

        {(last4 || holderDetail) && (
          <div className="flex flex-col gap-8 p-12">
            {last4 && (
              <p className={cn("text-title-sm", detailText)}>
                <MaskedCardNumber
                  last4={last4}
                  srText={labels.cardEnding(last4)}
                  short={shortNumber}
                />
              </p>
            )}
            {holderDetail && (
              <p className="flex items-center gap-8">
                {holderIcon && (
                  <Icon
                    name={holderIcon}
                    weight={200}
                    fill={false}
                    tone={disabled ? "disabled" : "secondary"}
                  />
                )}
                <span className={cn("text-body-sm", detailText)}>{holderDetail}</span>
              </p>
            )}
          </div>
        )}

        {(additionalDetails || hasActions) && (
          <div className="flex flex-col gap-12 px-12 pb-12">
            <Divider />
            {additionalDetails && (
              <p
                className={cn(
                  "text-body-sm",
                  disabled
                    ? "text-text-disabled"
                    : expired
                      ? "text-text-error"
                      : state === "warning"
                        ? "text-text-assistive"
                        : "text-text-tertiary group-hover/card:text-text-secondary",
                )}
              >
                {additionalDetails}
              </p>
            )}
            {hasActions && (
              <div className="flex gap-12">
                {primaryAction && (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={disabled}
                    rightIcon={primaryAction.rightIcon}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={disabled}
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
