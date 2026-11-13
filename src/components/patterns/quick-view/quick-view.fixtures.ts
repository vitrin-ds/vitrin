import { GALLERY_IMAGES } from "@/components/patterns/product-gallery/product-gallery.fixtures";
import type { QuickViewProduct } from "./quick-view";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });

/** Figma 31513:1157: Brand A · Hydrating Gel Cream 50 ml · 4.9 · €24 · 30 / 50 / 100 ml. */
export const QUICK_VIEW_PRODUCT: QuickViewProduct = {
  name: "Hydrating Gel Cream 50 ml",
  href: "/p/hydrating-gel-cream",
  brand: "Brand A",
  images: GALLERY_IMAGES.slice(0, 4),
  rating: { value: 4.9, reviewCount: 129 },
  price: eur(2400),
  variants: {
    label: "Size",
    options: [
      { value: "30", label: "30 ml" },
      { value: "50", label: "50 ml" },
      { value: "100", label: "100 ml", disabled: true },
    ],
  },
};

export const QUICK_VIEW_PRODUCT_ON_SALE: QuickViewProduct = {
  ...QUICK_VIEW_PRODUCT,
  name: "Overnight Renewal Cream with Ceramides and Peptides for Dry Skin",
  price: eur(1920),
  compareAt: eur(2400),
  variants: undefined,
};
