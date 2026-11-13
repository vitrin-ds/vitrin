import { cva } from "class-variance-authority";
import type { Money } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";
import { Icon } from "@/components/ui/icon/icon";
import { Progress } from "@/components/ui/progress/progress";
import { Text } from "@/components/ui/text/text";
import { freeShippingRemaining } from "./order-totals";

// Figma `Free Shipping` (Mini Cart footer 31321:6791; Cart Order Detail 31321:6925): the 16px
// local_shipping glyph with "Spend €12 more for free shipping" (body-small), over the 8x
// Progress (subtotal of the threshold), gap 12. In the Mini Cart footer it is divided from the
// subtotal by a border-neutral rule (padding-bottom 16); in the cart's Order Summary it leads the
// card (padding-bottom 6). Once the threshold is reached the glyph and the bar turn success
// (green) with "You've unlocked free shipping"; Figma draws only the Spend state.

export interface FreeShippingLabels {
  /** Progress name. */
  progress: string;
  remaining: (amount: string) => string;
  reached: string;
  /** Spoken value, e.g. "€138.00 of €150.00". */
  value: (subtotal: string, threshold: string) => string;
}

export const FREE_SHIPPING_LABELS: FreeShippingLabels = {
  progress: "Free shipping progress",
  remaining: (amount) => `Spend ${amount} more for free shipping`,
  reached: "You've unlocked free shipping",
  value: (subtotal, threshold) => `${subtotal} of ${threshold}`,
};

export const freeShippingProgressVariants = cva("flex flex-col gap-12", {
  variants: {
    divided: { true: "border-b border-border-neutral pb-16", false: "pb-6" },
  },
});

export interface FreeShippingProgressProps {
  subtotal: Money;
  threshold: Money;
  /** Mini Cart footer: a rule under it. */
  divided?: boolean;
  locale?: string;
  labels?: FreeShippingLabels;
}

export function FreeShippingProgress({
  subtotal,
  threshold,
  divided = false,
  locale = "en",
  labels = FREE_SHIPPING_LABELS,
}: FreeShippingProgressProps) {
  const remaining = freeShippingRemaining(subtotal, threshold);
  const reached = remaining.amount <= 0;
  return (
    <div className={freeShippingProgressVariants({ divided })}>
      <p className="flex items-center gap-2">
        <Icon
          name="local_shipping"
          size="16"
          weight={200}
          fill={false}
          tone={reached ? "success" : "primary"}
        />
        <Text as="span" variant="body-sm">
          {reached ? labels.reached : labels.remaining(formatMoney(remaining, locale))}
        </Text>
      </p>
      <Progress
        size="8x"
        tone={reached ? "success" : "accent"}
        value={Math.min(subtotal.amount, threshold.amount)}
        max={threshold.amount}
        label={labels.progress}
        valueText={labels.value(formatMoney(subtotal, locale), formatMoney(threshold, locale))}
      />
    </div>
  );
}
