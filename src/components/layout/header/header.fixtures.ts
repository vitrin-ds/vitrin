import type {
  MegaMenuContent,
  MegaMenuGroup,
  NavigationItem,
  NavigationLink,
} from "./header-types";

// Placeholder navigation for stories and tests (Figma Mega Menu [Links Only] copy, 30677:8834).

function links(prefix: string, labels: readonly string[]): NavigationLink[] {
  return labels.map((label) => ({
    id: `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
    href: `/c/${prefix}/${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  }));
}

function group(id: string, title: string, items: readonly string[]): MegaMenuGroup {
  return {
    id,
    title,
    links: links(id, items),
    actions: [
      { id: `${id}-all`, label: "Show All Products", href: `/c/${id}` },
      { id: `${id}-page`, label: `${title} Page`, href: `/collections/${id}` },
    ],
  };
}

export const MAKE_UP_MENU: MegaMenuContent = {
  columns: [
    [
      group("lip-makeup", "Lip Makeup", [
        "Lipstick",
        "Liquid Lipstick",
        "Lip Pencil",
        "Lip Liner",
        "Lip Gloss",
      ]),
      group("eye-makeup", "Eye Makeup", ["Mascara", "Eyeliner", "Eye Pencil", "Eyebrow"]),
    ],
    [
      group("face-makeup", "Face Makeup", [
        "Highlighter",
        "Blush",
        "Bronzer",
        "Foundation",
        "BB-CC Creams",
        "Concealer",
        "Contour",
        "Powder",
        "Makeup Primer",
        "Makeup Setting Spray",
      ]),
    ],
    [
      group("nail-care", "Nail Care", [
        "Nail Polish",
        "Nail Care Products",
        "False Nails",
        "Nail Decorations",
        "Nail Polish Remover",
      ]),
      group("manicure", "Manicure & Pedicure Supplies", [
        "Cuticle Scissors",
        "Nail File",
        "Manicure & Pedicure Sets",
      ]),
    ],
    [
      group("shampoo", "Shampoo & Conditioners", ["Shampoo", "Conditioner", "Dry Shampoo"]),
      group("treatments", "Treatments", [
        "Hair Masks",
        "Hair Growth",
        "Hair Oils",
        "Hair Serums",
        "Supplements",
      ]),
    ],
    [
      {
        id: "trending",
        title: "Trending Now",
        links: links("trending", ["Best Sellers", "Accessories", "Makeup Primer", "Mascara"]),
      },
    ],
  ],
  footer: "Free shipping on all EU orders over €100",
};

const SKIN_CARE_MENU: MegaMenuContent = {
  columns: [
    [group("cleansers", "Cleansers", ["Cleansing Oil", "Foam Cleanser", "Micellar Water"])],
    [group("serums", "Serums", ["Vitamin C", "Hyaluronic Acid", "Retinol"])],
    [group("moisturisers", "Moisturisers", ["Day Cream", "Night Cream", "Eye Cream"])],
  ],
  footer: "Free shipping on all EU orders over €100",
};

export const NAVIGATION: readonly NavigationItem[] = [
  { id: "categories", label: "Shop by Categories", menu: MAKE_UP_MENU },
  { id: "best-sellers", label: "Best Sellers", menu: SKIN_CARE_MENU },
  { id: "skin-care", label: "Skin Care", menu: SKIN_CARE_MENU },
  { id: "make-up", label: "Make Up", menu: MAKE_UP_MENU },
  { id: "hair-care", label: "Hair Care", href: "/c/hair-care" },
  { id: "on-sale", label: "On Sale", href: "/collections/on-sale", featured: true },
];

/** Figma drawer `Secondary Group` (30677:13459). */
export const SECONDARY_LINKS: readonly NavigationLink[] = [
  { id: "profile", label: "My Profile", href: "/account" },
  { id: "stores", label: "Find a Store", href: "/stores" },
  { id: "help", label: "Help Centre", href: "/help" },
];
