"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Checkbox } from "../checkbox/checkbox";
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

// Figma `Card.CartItem.Compact` (State × Type): the mini-cart / order-summary line. Padding 14 · 12,
// gap 12: an optional selection checkbox, the 60px thumb, then overline (body-small, text-accent),
// name (title-small, one line), subtitle (body-small, text-tertiary, one line), variant Labels
// (Outline, gap 8) and Price; the quantity pill (Stepper `pill`) on the right. List: bottom border;
// Card: radius 8, border all round. Disabled (e.g. unavailable) greys the content and the stepper.
// Figma has no Badge on the thumb: the quantity is in the Stepper. There is no Remove button either:
// with `minQuantity={0}` (the Mini Cart) the "−" stays active at quantity 1, is named "Remove
// {name}" and sets the quantity to 0, which the owner treats as removing the line.

export interface CardCartItemCompactLabels {
  quantity: (name: string) => string;
  quantityValue: (quantity: number) => string;
  select: (name: string) => string;
  remove: (name: string) => string;
}

export const CARD_CART_ITEM_COMPACT_LABELS: CardCartItemCompactLabels = {
  quantity: (name) => `Quantity, ${name}`,
  quantityValue: (quantity) => `Quantity: ${quantity}`,
  select: (name) => `Select ${name}`,
  remove: (name) => `Remove ${name}`,
};

export const CARD_CART_ITEM_COMPACT_DEFAULTS = { type: "list", locale: "en" } as const;

const OVERLINE_TONE = {
  accent: "text-text-accent",
  error: "text-text-error",
  info: "text-text-info",
} as const;

export interface CardCartItemCompactProps extends CardCartItemBaseProps {
  /** Figma `Product Subtitle Text`: one line, e.g. the variant. */
  subtitle?: string;
  /** Figma `Overline` colour: Accent, or a warning tag ("FINAL SALE", "CUSTOM MADE"). */
  overlineTone?: "accent" | "error" | "info";
  /** Figma `Left Icon` as any element, e.g. a step number or a done mark. */
  leading?: ReactNode;
  /** A finished step in a flow: the border in border-success (Card only). */
  done?: boolean;
  /** Figma `Left Icon` (check_box): selection for bulk actions, shown when given. */
  selection?: { checked: boolean; onCheckedChange: (checked: boolean) => void };
  disabled?: boolean;
  /**
   * Lowest quantity the stepper allows. 0 (Mini Cart): "−" at 1 removes the line (the owner gets
   * `onQuantityChange(0)`). Default 1.
   */
  minQuantity?: 0 | 1;
  labels?: CardCartItemCompactLabels;
}

export function CardCartItemCompact({
  name,
  href,
  overline,
  overlineTone = "accent",
  leading,
  done = false,
  subtitle,
  image,
  variantLabels = [],
  price,
  compareAt,
  quantity,
  onQuantityChange,
  maxQuantity,
  selection,
  type = CARD_CART_ITEM_COMPACT_DEFAULTS.type,
  disabled = false,
  minQuantity = 1,
  locale = CARD_CART_ITEM_COMPACT_DEFAULTS.locale,
  labels = CARD_CART_ITEM_COMPACT_LABELS,
  className,
}: CardCartItemCompactProps) {
  const muted = disabled ? "text-text-disabled" : undefined;
  return (
    <div
      data-card="cart-item-compact"
      // Inactive card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3).
      aria-disabled={disabled || undefined}
      className={cn(
        "group/card flex items-center gap-12 px-14 py-12",
        disabled ? "bg-surface-disabled" : "bg-surface-primary",
        CART_ITEM_TYPE_CLASS[type],
        // Figma Hover & Tap: interactive-subtle-hover fill and border.
        !disabled && CART_ITEM_HOVER_CLASS[type],
        done && type === "card" && "inset-ring-border-success hover:inset-ring-border-success",
        className,
      )}
    >
      {leading}
      {selection && (
        <Checkbox
          label={labels.select(name)}
          hideLabel
          checked={selection.checked}
          onChange={(event) => selection.onCheckedChange(event.target.checked)}
          disabled={disabled}
        />
      )}
      <CartItemThumb image={image} size={60} disabled={disabled} />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex min-w-0 flex-col">
          {overline && (
            <p className={cn("text-body-sm", muted ?? OVERLINE_TONE[overlineTone])}>{overline}</p>
          )}
          <h3 className={cn("min-w-0 text-title-sm", muted ?? "text-text-primary")}>
            <CartItemName href={href} name={name} />
          </h3>
          {subtitle && (
            <p
              className={cn(
                "truncate text-body-sm",
                muted ?? "text-text-tertiary group-hover/card:text-text-secondary",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {variantLabels.length > 0 && (
          <p className="flex gap-8">
            {variantLabels.slice(0, 2).map((value) => (
              <Label key={value} color="outline" icon="loyalty">
                {value}
              </Label>
            ))}
          </p>
        )}
        <Price price={price} compareAt={compareAt} locale={locale} disabled={disabled} />
      </div>
      {onQuantityChange ? (
        <Stepper
          variant="pill"
          label={labels.quantity(name)}
          value={quantity}
          min={minQuantity}
          max={maxQuantity}
          onValueChange={onQuantityChange}
          decreaseLabel={minQuantity === 0 && quantity <= 1 ? labels.remove(name) : undefined}
          disabled={disabled}
        />
      ) : (
        <p className={cn("text-title-md tabular-nums", muted ?? "text-text-primary")}>
          <span aria-hidden>{quantity}</span>
          <span className="sr-only">{labels.quantityValue(quantity)}</span>
        </p>
      )}
    </div>
  );
}
