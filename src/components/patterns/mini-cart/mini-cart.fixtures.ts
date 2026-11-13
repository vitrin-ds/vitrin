import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import type { MiniCartLine } from "./mini-cart";

// Figma Mini Cart example: two lines (€70 + €38 = €108), free shipping from €150 (€42 to go).

export const eur = (amount: number): Money => ({ amount, currency: "EUR" });

const image = (alt: string): ImageAsset => ({
  src: "/brand/add-image.svg",
  alt,
  width: 1024,
  height: 1024,
});

export interface MiniCartFixtureLine extends MiniCartLine {
  unitPrice: Money;
}

export const MINI_CART_LINES: MiniCartFixtureLine[] = [
  {
    id: "line-1",
    name: "Glow Serum",
    href: "/p/glow-serum",
    overline: "Serein",
    subtitle: "30 ml · Rosewood",
    image: image("Glow Serum bottle"),
    unitPrice: eur(7000),
    price: eur(7000),
    quantity: 1,
    maxQuantity: 5,
  },
  {
    id: "line-2",
    name: "Cloud Cream",
    href: "/p/cloud-cream",
    overline: "Northwind Botanics",
    subtitle: "50 ml",
    image: image("Cloud Cream jar"),
    unitPrice: eur(3800),
    price: eur(3800),
    quantity: 1,
    maxQuantity: 3,
  },
];

export const FREE_SHIPPING_THRESHOLD = eur(15000);

/** Line totals and the subtotal for a set of lines (stories and tests keep them in sync). */
export function withTotals(lines: readonly MiniCartFixtureLine[]): {
  lines: MiniCartFixtureLine[];
  subtotal: Money;
} {
  const priced = lines.map((line) => ({
    ...line,
    price: { ...line.unitPrice, amount: line.unitPrice.amount * line.quantity },
  }));
  return {
    lines: priced,
    subtotal: eur(priced.reduce((sum, line) => sum + line.price.amount, 0)),
  };
}
