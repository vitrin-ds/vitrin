"use client";

import type { Cart } from "@/lib/api/types/cart";
import type { CartLinePreview, CommerceCartAdapter } from "@/lib/commerce/cart-adapter";
import { ProductList, type ProductListItem, type ProductListProps } from "./product-list";

// The product-list block on a data contract: give it the cart part of a CommerceAdapter (mock,
// Shopify …) and the cards' Add to cart adds the shown variant by itself. The list, the facets
// and the filter / sort state stay the caller's (read where the page renders, e.g.
// `catalog.listProducts`, and kept in the URL).

export interface ConnectedProductListProps extends Omit<ProductListProps, "onAddToCart"> {
  adapter: Pick<CommerceCartAdapter, "addLine">;
  /** The line went in: e.g. open the mini cart or announce it. */
  onAdded?: (cart: Cart, item: ProductListItem) => void;
  /** The add was refused or failed: tell the customer. */
  onError: (error: unknown, item: ProductListItem) => void;
}

/** What the card shows, for an adapter without a catalogue (the mock); for display only. */
export function previewOf(item: ProductListItem): CartLinePreview {
  return {
    productId: item.id,
    name: item.name,
    slug: item.href.split("/").filter(Boolean).pop() ?? item.id,
    image: item.image,
    unitPrice: item.price,
    compareAtUnitPrice: item.compareAt,
  };
}

export function ConnectedProductList({
  adapter,
  onAdded,
  onError,
  ...props
}: ConnectedProductListProps) {
  return (
    <ProductList
      {...props}
      onAddToCart={(item) => {
        adapter.addLine(item.variantId, 1, { preview: previewOf(item) }).then(
          (cart) => onAdded?.(cart, item),
          (error: unknown) => onError(error, item),
        );
      }}
    />
  );
}
