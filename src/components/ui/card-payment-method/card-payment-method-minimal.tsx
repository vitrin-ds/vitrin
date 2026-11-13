"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { TextAction } from "@/components/base/text-action/text-action";
import {
  PaymentNetwork,
  paymentNetworkName,
  type PaymentNetworkId,
} from "../payment-network/payment-network";
import { MaskedCardNumber } from "./mask";

// Figma `Card.PaymentMethod.Minimal` (State) on `.Base.Card.PaymentMethod.Minimal`: a card (radius
// 8, padding 16, gap 8, 1px border-neutral) with the network badge and masked number
// (label-large) and "Expires: 01/30" (body-small, text-accent) on the left; Edit / Delete
// (underlined label-medium with 20px icon-accent glyphs) on the right, each a flush 44px row.
// State: Default · Hover & Tap (interactive-subtle-hover fill and border, CSS) · Disabled. No Make
// Default and no selection: the default card and checkout selection live in
// Card.PaymentMethod.Extended.

export const cardPaymentMethodMinimalVariants = cva(
  "relative flex items-start gap-8 rounded-card p-16 inset-ring",
  {
    variants: {
      disabled: {
        true: "bg-surface-disabled inset-ring-border-disabled",
        false:
          "bg-surface-primary inset-ring-border-neutral hover:bg-interactive-subtle-hover hover:inset-ring-interactive-subtle-hover",
      },
    },
  },
);

export interface CardPaymentMethodMinimalLabels {
  expires: string;
  edit: string;
  delete: string;
  /** Accessible names that say which card, e.g. "Edit Visa ending in 5012". */
  editFor: (card: string) => string;
  deleteFor: (card: string) => string;
  card: (network: string, last4: string) => string;
}

export const CARD_PAYMENT_METHOD_MINIMAL_LABELS: CardPaymentMethodMinimalLabels = {
  expires: "Expires:",
  edit: "Edit",
  delete: "Delete",
  editFor: (card) => `Edit ${card}`,
  deleteFor: (card) => `Delete ${card}`,
  card: (network, last4) => `${network} ending in ${last4}`,
};

export interface CardPaymentMethodMinimalProps {
  network: PaymentNetworkId;
  /** Figma `Card Number`: only the last four digits. */
  last4: string;
  /** Figma `Expire Date`, e.g. "01/30" (Figma Don't: never hide it). */
  expiry: string;
  /** Figma `Edit` (shown when given). */
  onEdit?: () => void;
  /** Figma `Delete` (shown when given). */
  onDelete?: () => void;
  disabled?: boolean;
  labels?: CardPaymentMethodMinimalLabels;
  className?: string;
}

export function CardPaymentMethodMinimal({
  network,
  last4,
  expiry,
  onEdit,
  onDelete,
  disabled = false,
  labels = CARD_PAYMENT_METHOD_MINIMAL_LABELS,
  className,
}: CardPaymentMethodMinimalProps) {
  const card = labels.card(paymentNetworkName(network), last4);
  const text = disabled ? "text-text-disabled" : "text-text-primary";
  const hasActions = onEdit || onDelete;

  return (
    <div
      data-card="payment-method-minimal"
      // Inactive card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3).
      aria-disabled={disabled || undefined}
      className={cn(cardPaymentMethodMinimalVariants({ disabled }), className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <p className={cn("flex items-center gap-8 text-label-lg", text)}>
          <PaymentNetwork network={network} />
          <MaskedCardNumber last4={last4} srText={card} />
        </p>
        <p
          className={cn(
            "flex gap-8 text-body-sm",
            disabled ? "text-text-disabled" : "text-text-accent",
          )}
        >
          <span>{labels.expires}</span>
          <span>{expiry}</span>
        </p>
      </div>
      {hasActions && (
        <div className="flex flex-col items-end self-stretch">
          {onEdit && (
            <TextAction
              icon="edit_square"
              label={labels.edit}
              name={labels.editFor(card)}
              onClick={onEdit}
              disabled={disabled}
              underline
            />
          )}
          {onDelete && (
            <TextAction
              icon="delete"
              label={labels.delete}
              name={labels.deleteFor(card)}
              onClick={onDelete}
              disabled={disabled}
              underline
            />
          )}
        </div>
      )}
    </div>
  );
}
