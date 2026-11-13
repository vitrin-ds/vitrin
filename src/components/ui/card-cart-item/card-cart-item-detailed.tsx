"use client";

import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Label } from "../label/label";
import { Price } from "../price/price";
import { Stepper } from "../stepper/stepper";
import {
  CART_ITEM_HOVER_CLASS,
  CART_ITEM_TYPE_CLASS,
  CartItemName,
  CartItemThumb,
  type CardCartItemBaseProps,
} from "./card-cart-item-parts";

// Figma `Card.CartItem.Detailed` (State × Type): the cart-page / order-review line. Padding 12
// (14 on the sides in Card), gap 12, top-aligned: the 80px thumb, then (gap 8) overline + name
// (title-medium) with the Price stacked on the right, variant Labels (Outline, no icon), the stock
// disclaimer (20px glyph + label-small) and the bottom row: the quantity control (Stepper
// `inline`) and Save for later / Remove (16px glyph + label-small, gap 12, 44px-tall rows). The disclaimer tells
// the truth about stock (Figma Don't): in stock (success), low (warning), out of stock (error).

export type StockDisclaimerTone = "success" | "warning" | "error";

const DISCLAIMER: Record<StockDisclaimerTone, { icon: IconName; className: string }> = {
  success: { icon: "check", className: "text-text-success" },
  warning: { icon: "warning", className: "text-text-warning" },
  error: { icon: "error", className: "text-text-error" },
};

export interface CardCartItemDetailedLabels {
  quantity: (name: string) => string;
  saveForLater: string;
  saveForLaterFor: (name: string) => string;
  remove: string;
  removeFor: (name: string) => string;
}

export const CARD_CART_ITEM_DETAILED_LABELS: CardCartItemDetailedLabels = {
  quantity: (name) => `Quantity, ${name}`,
  saveForLater: "Save for later",
  saveForLaterFor: (name) => `Save for later: ${name}`,
  remove: "Remove",
  removeFor: (name) => `Remove ${name}`,
};

export const CARD_CART_ITEM_DETAILED_DEFAULTS = { type: "list", locale: "en" } as const;

export interface CardCartItemDetailedProps extends CardCartItemBaseProps {
  /** Figma `Disclaimer`: availability, e.g. { tone: "warning", text: "Only 2 left" }. */
  disclaimer?: { tone: StockDisclaimerTone; text: string };
  /** Figma "Save for later" action (shown when given). */
  onSaveForLater?: () => void;
  /** Figma "Remove" action (shown when given). */
  onRemove?: () => void;
  labels?: CardCartItemDetailedLabels;
}

export function CardCartItemDetailed({
  name,
  href,
  overline,
  image,
  variantLabels = [],
  price,
  compareAt,
  quantity,
  onQuantityChange,
  maxQuantity,
  disclaimer,
  onSaveForLater,
  onRemove,
  type = CARD_CART_ITEM_DETAILED_DEFAULTS.type,
  locale = CARD_CART_ITEM_DETAILED_DEFAULTS.locale,
  labels = CARD_CART_ITEM_DETAILED_LABELS,
  className,
}: CardCartItemDetailedProps) {
  return (
    <div
      data-card="cart-item-detailed"
      className={cn(
        "flex items-start gap-12 bg-surface-primary py-12",
        type === "card" ? "px-14" : "px-0",
        CART_ITEM_TYPE_CLASS[type],
        // Figma Hover & Tap: a List row only recolours its divider; a Card also fills.
        type === "card" ? CART_ITEM_HOVER_CLASS.card : "hover:border-interactive-subtle-hover",
        className,
      )}
    >
      <CartItemThumb image={image} size={80} />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex items-start gap-12">
          <div className="flex min-w-0 flex-1 flex-col">
            {overline && <p className="text-body-sm text-text-accent">{overline}</p>}
            <h3 className="min-w-0 text-title-md text-text-primary">
              <CartItemName href={href} name={name} />
            </h3>
          </div>
          <Price price={price} compareAt={compareAt} layout="column" locale={locale} />
        </div>
        {variantLabels.length > 0 && (
          <p className="flex gap-8">
            {variantLabels.slice(0, 2).map((value) => (
              <Label key={value} color="outline">
                {value}
              </Label>
            ))}
          </p>
        )}
        {disclaimer && (
          <p
            className={cn(
              "flex items-center gap-4 text-label-sm",
              DISCLAIMER[disclaimer.tone].className,
            )}
          >
            <Icon name={DISCLAIMER[disclaimer.tone].icon} tone="current" />
            <span className="truncate">{disclaimer.text}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-8">
          {onQuantityChange ? (
            <Stepper
              variant="inline"
              label={labels.quantity(name)}
              value={quantity}
              max={maxQuantity}
              onValueChange={onQuantityChange}
            />
          ) : (
            <p className="text-title-md text-text-primary tabular-nums">{quantity}</p>
          )}
          {(onSaveForLater || onRemove) && (
            <div className="ml-auto flex items-center gap-12">
              {onSaveForLater && (
                <LineAction
                  icon="favorite"
                  label={labels.saveForLater}
                  name={labels.saveForLaterFor(name)}
                  onClick={onSaveForLater}
                />
              )}
              {onRemove && (
                <LineAction
                  icon="delete"
                  label={labels.remove}
                  name={labels.removeFor(name)}
                  onClick={onRemove}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LineAction({
  icon,
  label,
  name,
  onClick,
}: {
  icon: IconName;
  label: string;
  /** Accessible name; starts with the visible label (WCAG 2.5.3). */
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={name}
      onClick={onClick}
      className={cn(
        "relative flex h-44 cursor-pointer items-center gap-4 rounded-4 text-label-sm text-text-primary",
        "hover:text-interactive-hover",
      )}
    >
      <Icon name={icon} size="16" fill={false} tone="accent" />
      {label}
    </button>
  );
}
