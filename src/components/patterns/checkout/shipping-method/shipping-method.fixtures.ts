import type { ShippingOption } from "./shipping-method";

// Figma WD.09.03.01 Checkout — Signed in: Standard €4.95 · Next day €6.90.

const STANDARD: ShippingOption = {
  id: "standard",
  name: "Standard",
  price: { amount: 495, currency: "EUR" },
  estimate: { earliest: "2026-11-05", latest: "2026-11-09" },
};

const NEXT_DAY: ShippingOption = {
  id: "next-day",
  name: "Next day",
  price: { amount: 690, currency: "EUR" },
  estimate: { earliest: "2026-11-03" },
  description: "Order before 2pm",
};

export const SHIPPING_OPTIONS: readonly ShippingOption[] = [STANDARD, NEXT_DAY];

/** Free standard delivery once the order passes the threshold, plus an unavailable option. */
export const SHIPPING_OPTIONS_FREE: readonly ShippingOption[] = [
  { ...STANDARD, price: { amount: 0, currency: "EUR" } },
  NEXT_DAY,
  {
    id: "same-day",
    name: "Same day",
    price: { amount: 1290, currency: "EUR" },
    unavailableReason: "Not available for your postcode",
  },
];
