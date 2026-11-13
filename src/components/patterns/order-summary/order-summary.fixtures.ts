import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { computeOrderTotals, type OrderTotalsLine } from "./order-totals";

// Figma Order Summary example: three items (€70 + €38 + €30 = €138), WELCOME10 (10%) −€13.80,
// shipping €4.95, total €129.15, VAT 20% included (€21.53).

export const eur = (amount: number): Money => ({ amount, currency: "EUR" });

const image = (alt: string): ImageAsset => ({
  src: "/brand/add-image.svg",
  alt,
  width: 1024,
  height: 1024,
});

export const SUMMARY_LINES: (OrderTotalsLine & { name: string; image?: ImageAsset })[] = [
  { name: "Glow Serum", image: image("Glow Serum bottle"), unitPrice: eur(7000), quantity: 1 },
  { name: "Cloud Cream", image: image("Cloud Cream jar"), unitPrice: eur(3800), quantity: 1 },
  { name: "Dew Mist", image: image("Dew Mist spray"), unitPrice: eur(3000), quantity: 1 },
];

export const WELCOME10 = {
  code: "WELCOME10",
  label: "Promo · WELCOME10 (10%)",
  type: "percent",
  percent: 10,
} as const;

export const SUMMARY_TOTALS = computeOrderTotals({
  lines: SUMMARY_LINES,
  discounts: [WELCOME10],
  shipping: eur(495),
  taxRate: 0.2,
});

/** Cart page: no shipping method yet, so no VAT row and shipping "Calculated at checkout". */
export const CART_TOTALS = computeOrderTotals({
  lines: SUMMARY_LINES,
  discounts: [WELCOME10],
  shipping: null,
});

export const FREE_SHIPPING_TOTALS = computeOrderTotals({
  lines: SUMMARY_LINES,
  shipping: eur(0),
  taxRate: 0.2,
});
