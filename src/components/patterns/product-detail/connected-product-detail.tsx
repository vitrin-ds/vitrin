"use client";

import type { Cart } from "@/lib/api/types/cart";
import type { Product } from "@/lib/api/types/catalog";
import type { CartLinePreview, CommerceCartAdapter } from "@/lib/commerce/cart-adapter";
import { ProductDetail, type ProductDetailProps } from "./product-detail";

// The product-detail block on a data contract: give it the cart part of a CommerceAdapter
// (mock, Shopify …) and Add to Cart / Buy Now add the line by themselves. The product itself is
// read where the page renders (`catalog.getProduct(slug)` on the server) and passed in.

export interface ConnectedProductDetailProps extends Omit<ProductDetailProps, "onAddToCart"> {
  adapter: Pick<CommerceCartAdapter, "addLine">;
  /** The line went in: e.g. open the mini cart (not for Buy Now) or announce it. */
  onAdded?: (cart: Cart, options: { buyNow: boolean; title: string }) => void;
  /** The add was refused (sold out, quantity limit …) or failed: tell the customer. */
  onError: (error: unknown) => void;
}

/** What the page shows of the chosen variant, for an adapter without a catalogue (the mock). */
export function previewOf(
  product: Product,
  variantId: string,
  brandName?: string,
): CartLinePreview | undefined {
  const variant = product.variants.find((item) => item.id === variantId);
  if (!variant) return undefined;
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    brandName,
    variantTitle: variant.options.map((option) => option.value).join(" · ") || undefined,
    image: variant.images?.[0] ?? product.images[0],
    unitPrice: variant.price,
    compareAtUnitPrice: variant.compareAtPrice,
    maxQuantity: variant.quantityAvailable,
  };
}

export function ConnectedProductDetail({
  adapter,
  onAdded,
  onError,
  ...props
}: ConnectedProductDetailProps) {
  return (
    <ProductDetail
      {...props}
      onAddToCart={async ({ variantId, quantity }, options) => {
        try {
          const preview = previewOf(props.product, variantId, props.brand?.name);
          const cart = await adapter.addLine(variantId, quantity, { preview });
          onAdded?.(cart, options);
          return true;
        } catch (error) {
          onError(error);
          return false;
        }
      }}
    />
  );
}
