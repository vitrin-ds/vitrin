import { describe, expect, it } from "vitest";
import {
  computeOrderTotals,
  freeShippingRemaining,
  includedTax,
  orderTotalsFromOrder,
} from "./order-totals";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const LINES = [
  { unitPrice: eur(7000), quantity: 1 },
  { unitPrice: eur(3800), quantity: 1 },
  { unitPrice: eur(3000), quantity: 1 },
];

describe("computeOrderTotals", () => {
  it("matches the Figma example: subtotal, 10% promo, shipping, included VAT, total", () => {
    const totals = computeOrderTotals({
      lines: LINES,
      discounts: [{ code: "WELCOME10", label: "Promo", type: "percent", percent: 10 }],
      shipping: eur(495),
      taxRate: 0.2,
    });
    expect(totals).toEqual({
      itemCount: 3,
      subtotal: eur(13800),
      discounts: [{ code: "WELCOME10", label: "Promo", amount: eur(1380) }],
      discountTotal: eur(1380),
      shipping: eur(495),
      tax: eur(2153),
      total: eur(12915),
    });
  });

  it("counts units, multiplies by quantity and leaves shipping out until it is known", () => {
    const totals = computeOrderTotals({
      lines: [{ unitPrice: eur(1999), quantity: 3 }],
      shipping: null,
    });
    expect(totals.itemCount).toBe(3);
    expect(totals.subtotal).toEqual(eur(5997));
    expect(totals.total).toEqual(eur(5997));
    expect(totals.shipping).toBeNull();
    expect(totals.tax).toBeNull();
  });

  it("caps stacked discounts at the subtotal so the total never goes negative", () => {
    const totals = computeOrderTotals({
      lines: [{ unitPrice: eur(1000), quantity: 1 }],
      discounts: [
        { label: "Gift card", type: "fixed", amount: eur(800) },
        { label: "Voucher", type: "fixed", amount: eur(500) },
      ],
      shipping: eur(0),
    });
    expect(totals.discounts.map((d) => d.amount.amount)).toEqual([800, 200]);
    expect(totals.discountTotal).toEqual(eur(1000));
    expect(totals.total).toEqual(eur(0));
  });

  it("rounds percentages half up to the cent", () => {
    const totals = computeOrderTotals({
      lines: [{ unitPrice: eur(1005), quantity: 1 }],
      discounts: [{ label: "10%", type: "percent", percent: 10 }],
      shipping: null,
    });
    expect(totals.discountTotal).toEqual(eur(101));
  });

  it("handles an empty cart", () => {
    const totals = computeOrderTotals({ lines: [], shipping: null });
    expect(totals.itemCount).toBe(0);
    expect(totals.total).toEqual(eur(0));
  });

  it("rejects invalid input", () => {
    expect(() =>
      computeOrderTotals({ lines: [{ unitPrice: eur(100), quantity: 1.5 }], shipping: null }),
    ).toThrow(/Quantity/);
    expect(() =>
      computeOrderTotals({
        lines: LINES,
        discounts: [{ label: "x", type: "percent", percent: 120 }],
        shipping: null,
      }),
    ).toThrow(/percent/);
    expect(() =>
      computeOrderTotals({
        lines: LINES,
        shipping: { amount: 100, currency: "USD" },
      }),
    ).toThrow(/currencies/);
    expect(() => includedTax(100, -1)).toThrow(/rate/);
  });
});

describe("orderTotalsFromOrder", () => {
  it("uses the order's own amounts and names the discount line", () => {
    const totals = orderTotalsFromOrder(
      {
        lines: [
          {
            id: "l1",
            productId: "p1",
            variantId: "v1",
            name: "Glow Serum",
            quantity: 2,
            unitPrice: eur(1000),
            lineTotal: eur(2000),
          },
        ],
        subtotal: eur(2000),
        discounts: eur(200),
        shipping: eur(495),
        total: eur(2295),
      },
      { discountLabel: "Promo · WELCOME10 (10%)", discountCode: "WELCOME10", taxRate: 0.2 },
    );
    expect(totals.itemCount).toBe(2);
    expect(totals.discounts).toEqual([
      { code: "WELCOME10", label: "Promo · WELCOME10 (10%)", amount: eur(200) },
    ]);
    expect(totals.tax).toEqual(eur(383));
    expect(totals.total).toEqual(eur(2295));
  });

  it("drops the discount line when there is none", () => {
    const totals = orderTotalsFromOrder({
      lines: [],
      subtotal: eur(0),
      discounts: eur(0),
      shipping: eur(0),
      total: eur(0),
    });
    expect(totals.discounts).toEqual([]);
    expect(totals.tax).toBeNull();
  });
});

describe("freeShippingRemaining", () => {
  it("returns what is left to spend, never below zero", () => {
    expect(freeShippingRemaining(eur(10800), eur(15000))).toEqual(eur(4200));
    expect(freeShippingRemaining(eur(16000), eur(15000))).toEqual(eur(0));
  });
});
