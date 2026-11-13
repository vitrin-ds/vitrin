import type { ImageAsset } from "@/lib/api/types/catalog";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });

const productImage = (name: string): ImageAsset => ({
  src: "/brand/add-image.svg",
  alt: `${name}, product shot`,
  width: 1024,
  height: 1024,
});

const NAMES = [
  ["Glow Serum", "Serums"],
  ["Hydrating Gel Cream", "Moisturisers"],
  ["Gentle Foam Cleanser", "Cleansers"],
  ["Mineral Sun Fluid SPF 50", "Sun Care"],
  ["Juicy Melting Gloss", "Lip Make Up"],
  ["Volume Lash Mascara", "Eye Make Up"],
  ["Repair Hair Mask", "Hair Care"],
  ["Calming Toner", "Toners"],
  ["Silk Body Lotion", "Body Care"],
  ["Overnight Renewal Cream with Ceramides and Peptides", "Moisturisers"],
] as const;

/** Card.Product.Vertical props for a rail: 10 cards, as New Arrivals on Home (pageSize 10). */
export const CAROUSEL_PRODUCTS = NAMES.map(([name, category], i) => ({
  id: `p-${i + 1}`,
  name,
  category,
  href: `/p/${name.toLowerCase().replaceAll(" ", "-")}`,
  image: productImage(name),
  price: eur(6800 - i * 400),
  compareAt: i % 3 === 0 ? eur(8200 - i * 400) : undefined,
  label: i < 2 ? "New" : undefined,
  rating: i % 4 === 3 ? undefined : { value: 4.8 - (i % 5) * 0.2, reviewCount: 240 - i * 17 },
}));

/** Card.Category.Vertical.Featured that opens Your Daily Edit. */
export const DAILY_EDIT_CATEGORY = {
  id: "c-fragrance",
  overline: "This week",
  title: "Fragrance",
  href: "/c/body-care/fragrance",
  cta: "Shop the edit",
  image: {
    src: "/brand/add-image.svg",
    alt: "Perfume bottles on a marble shelf",
    width: 1024,
    height: 1024,
  },
} as const;
