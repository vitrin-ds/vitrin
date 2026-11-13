"use client";

import type { CartLine } from "@/lib/api/types/cart";
import type { CartAdapter } from "@/lib/commerce/cart-adapter";
import { useCart } from "@/lib/commerce/use-cart";
import { MiniCart, type MiniCartLine, type MiniCartProps } from "./mini-cart";

// The Mini Cart on a data contract: give it a CartAdapter (mock, Shopify …) and it reads and
// changes the cart by itself. MiniCart stays the presentational part, driven by props.

export interface ConnectedMiniCartProps extends Pick<
  MiniCartProps,
  "open" | "onClose" | "checkoutHref" | "cartHref" | "shopHref" | "locale" | "labels"
> {
  adapter: CartAdapter;
  /** A read or a change failed and the cart rolled back: tell the customer (e.g. a Toast). */
  onError: (error: unknown) => void;
  /** Where a line links to. Defaults to `/p/{slug}`. */
  productHref?: (line: CartLine) => string;
}

const defaultProductHref = (line: CartLine) => `/p/${line.slug}`;

function toMiniCartLine(line: CartLine, href: string): MiniCartLine {
  return {
    id: line.id,
    name: line.name,
    href,
    overline: line.brandName,
    subtitle: line.variantTitle,
    image: line.image,
    price: line.lineTotal,
    compareAt: line.compareAtUnitPrice && {
      amount: line.compareAtUnitPrice.amount * line.quantity,
      currency: line.compareAtUnitPrice.currency,
    },
    quantity: line.quantity,
    maxQuantity: line.maxQuantity,
  };
}

export function ConnectedMiniCart({
  adapter,
  onError,
  productHref = defaultProductHref,
  ...props
}: ConnectedMiniCartProps) {
  const { cart, setLineQuantity, removeLine } = useCart(adapter, { onError });
  // Nothing to show before the first read: an empty sheet here would claim the cart is empty.
  if (!cart) return null;
  return (
    <MiniCart
      {...props}
      lines={cart.lines.map((line) => toMiniCartLine(line, productHref(line)))}
      subtotal={cart.subtotal}
      freeShippingThreshold={
        cart.freeShippingThreshold.amount > 0 ? cart.freeShippingThreshold : undefined
      }
      onQuantityChange={setLineQuantity}
      onRemove={removeLine}
    />
  );
}
