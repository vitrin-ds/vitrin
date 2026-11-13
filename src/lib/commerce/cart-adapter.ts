import type { Cart } from "@/lib/api/types/cart";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";

/**
 * The data contract behind the cart blocks: a block reads and changes the
 * cart only through this, so the same block runs on any commerce backend. Every method answers
 * with the whole cart as the backend priced it, and rejects when the change did not happen.
 */
export interface CartAdapter {
  getCart(): Promise<Cart>;
  setLineQuantity(lineId: string, quantity: number): Promise<Cart>;
  removeLine(lineId: string): Promise<Cart>;
}

/**
 * What a block already shows about the line it adds: name, picture, the price on screen. For
 * display only. An adapter with its own catalogue (Shopify, a real backend) takes price, stock and
 * variant from its own source and never trusts the price here; only a catalogue-less adapter (the
 * in-memory mock) builds the line from it.
 */
export interface CartLinePreview {
  productId: string;
  name: string;
  slug: string;
  brandName?: string;
  /** The variant's option values, e.g. "Rosewood" or "30 ml". */
  variantTitle?: string;
  image?: ImageAsset;
  unitPrice: Money;
  compareAtUnitPrice?: Money;
  /** The most that can be ordered, when the block knows it. */
  maxQuantity?: number;
}

export interface AddLineOptions {
  /** For display only: see CartLinePreview. */
  preview?: CartLinePreview;
}

/** The full cart: what the Mini Cart needs (CartAdapter) plus adding and coupons. */
export interface CommerceCartAdapter extends CartAdapter {
  addLine(variantId: string, quantity?: number, options?: AddLineOptions): Promise<Cart>;
  applyCoupon(code: string): Promise<Cart>;
  removeCoupon(code: string): Promise<Cart>;
}
