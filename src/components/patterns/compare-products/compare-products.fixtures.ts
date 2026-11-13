import type { CompareAttribute, CompareProduct } from "./compare-types";

// Placeholder products from Figma Compare View (31513:5575).

const IMAGE = { src: "/brand/add-image.svg", width: 1024, height: 1024 } as const;

export const COMPARE_ATTRIBUTES: readonly CompareAttribute[] = [
  { id: "size", label: "Size" },
  { id: "skin-type", label: "Skin type" },
  { id: "ingredient", label: "Key ingredient" },
  { id: "finish", label: "Finish" },
  { id: "vegan", label: "Vegan" },
];

export const COMPARE_PRODUCTS: readonly CompareProduct[] = [
  {
    id: "p1",
    name: "Hydra Calm Gel",
    href: "/p/hydra-calm-gel",
    category: "Moisturisers",
    image: { ...IMAGE, alt: "Hydra Calm Gel jar" },
    price: { amount: 2400, currency: "EUR" },
    rating: { value: 4.6, count: 129 },
    label: "New",
    attributes: {
      size: "50 ml",
      "skin-type": "All",
      ingredient: "Hyaluronic acid",
      finish: "Gel",
      vegan: "Yes",
    },
  },
  {
    id: "p2",
    name: "Vitamin C Glow Serum",
    href: "/p/vitamin-c-glow-serum",
    category: "Serums",
    image: { ...IMAGE, alt: "Vitamin C Glow Serum bottle" },
    price: { amount: 2900, currency: "EUR" },
    compareAt: { amount: 3400, currency: "EUR" },
    rating: { value: 4.4, count: 88 },
    attributes: {
      size: "30 ml",
      "skin-type": "Dry",
      ingredient: "Vitamin C",
      finish: "Serum",
      vegan: "Yes",
    },
  },
  {
    id: "p3",
    name: "Barrier Repair Cream",
    href: "/p/barrier-repair-cream",
    category: "Moisturisers",
    image: { ...IMAGE, alt: "Barrier Repair Cream tube" },
    price: { amount: 3200, currency: "EUR" },
    rating: { value: 4.8, count: 212 },
    attributes: {
      size: "50 ml",
      "skin-type": "Sensitive",
      ingredient: "Ceramides",
      finish: "Cream",
      vegan: "Yes",
    },
  },
];
