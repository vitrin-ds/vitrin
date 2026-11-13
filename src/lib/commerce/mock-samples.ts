import type { Address } from "@/lib/api/types/customer";
import type { ShippingMethod } from "@/lib/api/types/checkout";
import type { Order } from "@/lib/api/types/orders";

// Small sample data for the in-memory adapters: enough for a block to render and act on a fresh
// install. Placeholder people, places and products only.

export const SAMPLE_ADDRESS: Address = {
  id: "address-home",
  label: "Home",
  firstName: "Jane",
  lastName: "Doe",
  line1: "12 Sample Street",
  postalCode: "N1 9GU",
  city: "London",
  countryCode: "GB",
  phone: "+44 20 7946 0000",
  isDefaultShipping: true,
  isDefaultBilling: true,
};

export const SAMPLE_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard",
    price: { amount: 495, currency: "EUR" },
    description: "3–5 working days",
  },
  {
    id: "next-day",
    name: "Next day",
    price: { amount: 995, currency: "EUR" },
    description: "Order before 2pm",
  },
];

const euro = (amount: number) => ({ amount, currency: "EUR" });

export const SAMPLE_ORDERS: Order[] = [
  {
    id: "order-1002",
    number: "1002",
    placedAt: "2026-01-14T10:20:00Z",
    status: "shipped",
    lines: [
      {
        id: "order-1002-line-1",
        productId: "sample-cream",
        variantId: "sample-cream-50",
        name: "Sample Night Cream",
        variantTitle: "50 ml",
        quantity: 1,
        unitPrice: euro(2800),
        lineTotal: euro(2800),
      },
    ],
    shippingAddress: SAMPLE_ADDRESS,
    subtotal: euro(2800),
    discounts: euro(0),
    shipping: euro(495),
    total: euro(3295),
    timeline: [{ id: "placed", title: "Order placed", occurredAt: "2026-01-14T10:20:00Z" }],
  },
  {
    id: "order-1001",
    number: "1001",
    placedAt: "2025-12-02T15:05:00Z",
    status: "delivered",
    lines: [
      {
        id: "order-1001-line-1",
        productId: "sample-serum",
        variantId: "sample-serum-30",
        name: "Sample Serum",
        variantTitle: "30 ml",
        quantity: 2,
        unitPrice: euro(1900),
        lineTotal: euro(3800),
      },
    ],
    shippingAddress: SAMPLE_ADDRESS,
    subtotal: euro(3800),
    discounts: euro(0),
    shipping: euro(0),
    total: euro(3800),
    timeline: [{ id: "placed", title: "Order placed", occurredAt: "2025-12-02T15:05:00Z" }],
  },
];
