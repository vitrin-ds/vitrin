import type { CurrencyCode, Money } from "@/lib/api/types/catalog";
import type { Order } from "@/lib/api/types/orders";

// The Order Summary arithmetic (Figma Order Summary 30407:67773): pure, in minor units, so the
// summary and the lines never round differently (Figma Don't). Prices are VAT-inclusive (EU
// mocks): the VAT row is the share already inside the total, not an extra charge.

/** One priced line: the cart line or order line, reduced to what the totals need. */
export interface OrderTotalsLine {
  unitPrice: Money;
  quantity: number;
}

/** A promotion on the subtotal. Percent off rounds half up to the cent. */
export type OrderDiscountInput =
  | { code?: string; label: string; type: "percent"; percent: number }
  | { code?: string; label: string; type: "fixed"; amount: Money };

export interface OrderTotalsInput {
  lines: readonly OrderTotalsLine[];
  discounts?: readonly OrderDiscountInput[];
  /** Null until a shipping method is known ("Calculated at checkout"); 0 is free shipping. */
  shipping: Money | null;
  /** VAT rate included in the prices, e.g. 0.2. Omit to hide the VAT row. */
  taxRate?: number;
  /** Needed when there are no lines to read it from. Defaults to EUR. */
  currency?: CurrencyCode;
}

export interface OrderDiscountLine {
  code?: string;
  label: string;
  /** Positive: the amount taken off. The summary shows it as a negative line. */
  amount: Money;
}

export interface OrderTotals {
  /** Units, not lines: "Subtotal (3 items)". */
  itemCount: number;
  subtotal: Money;
  discounts: OrderDiscountLine[];
  /** Sum of `discounts`, never more than the subtotal. */
  discountTotal: Money;
  shipping: Money | null;
  /** VAT included in `total`; null when no rate was given. */
  tax: Money | null;
  /** Subtotal − discounts + shipping (shipping counts as 0 until known). */
  total: Money;
}

const money = (amount: number, currency: CurrencyCode): Money => ({ amount, currency });

function assertCurrency(value: Money, currency: CurrencyCode): void {
  if (value.currency !== currency) {
    throw new Error(`Order totals mix currencies: ${value.currency} and ${currency}`);
  }
}

function assertWholeNonNegative(value: number, what: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${what} must be a whole number ≥ 0, got ${value}`);
  }
}

/** Computes every row of the Order Summary from typed lines. Throws on mixed currencies. */
export function computeOrderTotals(input: OrderTotalsInput): OrderTotals {
  const currency = input.lines[0]?.unitPrice.currency ?? input.currency ?? "EUR";

  let itemCount = 0;
  let subtotal = 0;
  for (const line of input.lines) {
    assertCurrency(line.unitPrice, currency);
    assertWholeNonNegative(line.quantity, "Quantity");
    itemCount += line.quantity;
    subtotal += line.unitPrice.amount * line.quantity;
  }

  // Discounts apply in order and never take the subtotal below zero.
  let remaining = subtotal;
  const discounts: OrderDiscountLine[] = (input.discounts ?? []).map((discount) => {
    let amount: number;
    if (discount.type === "percent") {
      if (discount.percent < 0 || discount.percent > 100) {
        throw new Error(`Discount percent must be 0–100, got ${discount.percent}`);
      }
      amount = Math.round((subtotal * discount.percent) / 100);
    } else {
      assertCurrency(discount.amount, currency);
      amount = discount.amount.amount;
    }
    amount = Math.min(Math.max(amount, 0), remaining);
    remaining -= amount;
    return { code: discount.code, label: discount.label, amount: money(amount, currency) };
  });
  const discountTotal = subtotal - remaining;

  if (input.shipping) assertCurrency(input.shipping, currency);
  const total = remaining + (input.shipping?.amount ?? 0);

  return {
    itemCount,
    subtotal: money(subtotal, currency),
    discounts,
    discountTotal: money(discountTotal, currency),
    shipping: input.shipping,
    tax: input.taxRate === undefined ? null : money(includedTax(total, input.taxRate), currency),
    total: money(total, currency),
  };
}

/** VAT inside a tax-inclusive amount: total − total / (1 + rate), to the cent. */
export function includedTax(total: number, rate: number): number {
  if (rate < 0) throw new Error(`Tax rate must be ≥ 0, got ${rate}`);
  return Math.round(total - total / (1 + rate));
}

/**
 * The summary of a placed order (confirmation, order detail): the backend's own amounts, so the
 * customer sees exactly what was charged. `discountLabel` names the order's discount line.
 */
export function orderTotalsFromOrder(
  order: Pick<Order, "lines" | "subtotal" | "discounts" | "shipping" | "total">,
  options: { discountLabel?: string; discountCode?: string; taxRate?: number } = {},
): OrderTotals {
  const { currency } = order.total;
  return {
    itemCount: order.lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: order.subtotal,
    discounts:
      order.discounts.amount > 0
        ? [
            {
              code: options.discountCode,
              label: options.discountLabel ?? options.discountCode ?? "",
              amount: order.discounts,
            },
          ]
        : [],
    discountTotal: order.discounts,
    shipping: order.shipping,
    tax:
      options.taxRate === undefined
        ? null
        : money(includedTax(order.total.amount, options.taxRate), currency),
    total: order.total,
  };
}

/** Free-shipping progress for the Mini Cart: what is left to spend (0 when reached). */
export function freeShippingRemaining(subtotal: Money, threshold: Money): Money {
  assertCurrency(subtotal, threshold.currency);
  return money(Math.max(threshold.amount - subtotal.amount, 0), threshold.currency);
}
