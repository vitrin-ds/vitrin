import type { ProductBadge } from "@/lib/api/types/catalog";

// UI strings of the product-detail block (the 06.01 "main product" section): the title row, the
// prices, the variant selector, stock, quantity and the buttons. English placeholder copy from
// the Figma frames; pass `labels` to translate. The site's PDP_LABELS spreads these.

export const PRODUCT_DETAIL_LABELS = {
  reviewCount: (count: string, n: number) => `${count} ${n === 1 ? "review" : "reviews"}`,
  readAllReviews: "Read all",
  readAllReviewsName: (name: string) => `Read all reviews of ${name}`,
  noReviews: "No reviews yet",
  saved: (count: string) => `${count} saved`,
  savedName: (count: string) => `Saved to ${count} wishlists`,
  save: (amount: string) => `Save ${amount}`,
  /** Member price row: the brand word, the label (the price follows). */
  cardPrice: { brand: "things", label: ". Card price — " },
  axis: { shade: "Shade", size: "Size" } as Record<string, string>,
  /** Unit price on a size tile, e.g. "€54.00 / 100 ml". */
  unitPrice: (price: string, unit: string) => `${price} / ${unit}`,
  unavailableOption: "Out of stock",
  unavailableList: (names: string) => `Out of stock: ${names}`,
  stock: {
    "in-stock": { title: "In stock — ships today", body: "Delivered in 2–4 working days" },
    "low-stock": {
      title: "Low stock",
      body: (count: number) => `Only ${count} left — order soon`,
    },
    "out-of-stock": {
      title: "Out of stock",
      body: "This option can't be added to your cart. Choose another option or check back soon.",
    },
  },
  quantity: "Quantity",
  addToCart: "Add to Cart",
  buyNow: "Buy Now",
  trust: { returns: "30-day returns", payment: "Secure payment", authentic: "100% authentic" },
  keyBenefits: "Key Benefits",
  badges: {
    new: "New",
    sale: "Sale",
    bestseller: "Bestseller",
    limited: "Limited",
    vegan: "Vegan",
    "online-only": "Online only",
  } as Record<ProductBadge, string>,
};

export type ProductDetailLabels = typeof PRODUCT_DETAIL_LABELS;
