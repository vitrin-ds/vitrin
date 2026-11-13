import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import type { Money } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";

// Price: not a Figma component; this is the "Prices" frame the product cards share (gap 4,
// baseline-aligned). Current price: title-small (md, cards) or title-large (lg, totals), text-
// primary; xl (PDP, Figma 06.01 Prices): headline-large over body-large, gap 8. Before discount: body-small, struck through, price-strike, shown only when it is
// higher than the price (Figma Don't: never with the same value). Screen readers hear "Current
// price … Original price …" instead of a silent strikethrough. Formatted with Intl.

/** The current price's text style per size. */
const CURRENT_SIZE = { md: "text-title-sm", lg: "text-title-lg", xl: "text-headline-lg" } as const;

/** The before-discount text style and the gap per size. xl is the PDP price (06.01 "Prices"). */
const COMPARE_SIZE = { md: "text-body-sm", lg: "text-body-sm", xl: "text-body-lg" } as const;
const GAP = { md: "gap-4", lg: "gap-4", xl: "gap-8" } as const;

export const PRICE_DEFAULTS = { size: "md", locale: "en" } as const;

export interface PriceLabels {
  current: string;
  original: string;
}

export const PRICE_LABELS: PriceLabels = { current: "Current price", original: "Original price" };

export interface PriceProps extends Omit<ComponentPropsWithoutRef<"p">, "children"> {
  /** Figma `Price Text`. */
  price: Money;
  /** Figma `Before Discount Text`: the price before the discount. */
  compareAt?: Money;
  /** md in cards, lg for order totals, xl on the product page (headline-large). */
  size?: keyof typeof CURRENT_SIZE;
  /** row (cards) or column, right-aligned (Card.CartItem.Detailed). */
  layout?: "row" | "column";
  /** Greyed out with an unavailable card. */
  disabled?: boolean;
  locale?: string;
  labels?: PriceLabels;
  /** `inverse`: both prices in text-inverse, over an image (Card.Product.Vertical.Featured). */
  tone?: "default" | "inverse";
}

export function Price({
  price,
  compareAt,
  size = PRICE_DEFAULTS.size,
  layout = "row",
  disabled = false,
  locale = PRICE_DEFAULTS.locale,
  labels = PRICE_LABELS,
  tone = "default",
  className,
  ...props
}: PriceProps) {
  const discounted = compareAt !== undefined && compareAt.amount > price.amount;
  return (
    <p
      {...props}
      className={cn(
        "inline-flex tabular-nums",
        layout === "row" ? cn("flex-wrap items-baseline", GAP[size]) : "flex-col items-end",
        className,
      )}
    >
      <span
        className={cn(
          CURRENT_SIZE[size],
          disabled
            ? "text-text-disabled"
            : tone === "inverse"
              ? "text-text-inverse"
              : "text-text-primary",
        )}
      >
        {discounted && <span className="sr-only">{labels.current}: </span>}
        {formatMoney(price, locale)}
      </span>
      {discounted && (
        <s
          className={cn(
            COMPARE_SIZE[size],
            disabled
              ? "text-text-disabled"
              : tone === "inverse"
                ? "text-text-inverse"
                : "text-price-strike",
          )}
        >
          <span className="sr-only">{labels.original}: </span>
          {formatMoney(compareAt, locale)}
        </s>
      )}
    </p>
  );
}
