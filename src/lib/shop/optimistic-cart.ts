import type { Cart } from "@/lib/api/types/cart";
import type { Money } from "@/lib/api/types/catalog";

// What the cart looks like while a quantity change or a removal is on its way to the server
// (ShopProvider's optimistic state). Line totals and the subtotal follow the new quantities; the
// discounts stay as they were until the server's cart (which prices coupons again) replaces this.

export type CartChange =
  { type: "quantity"; lineId: string; quantity: number } | { type: "remove"; lineId: string };

const times = (price: Money, quantity: number): Money => ({
  amount: price.amount * quantity,
  currency: price.currency,
});

export function optimisticCart(cart: Cart, change: CartChange): Cart {
  const lines =
    change.type === "remove"
      ? cart.lines.filter((line) => line.id !== change.lineId)
      : cart.lines.map((line) =>
          line.id === change.lineId
            ? {
                ...line,
                quantity: change.quantity,
                lineTotal: times(line.unitPrice, change.quantity),
              }
            : line,
        );
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal.amount, 0);
  const discounts = Math.min(cart.discounts.amount, subtotal);
  return {
    ...cart,
    lines,
    subtotal: { ...cart.subtotal, amount: subtotal },
    discounts: { ...cart.discounts, amount: discounts },
    total: { ...cart.total, amount: subtotal - discounts },
  };
}
