// Footer [Compact]'s data: placeholder content from Figma (31696:1373) with the "Vitrin"
// placeholder brand, until the CMS (src/lib/content) provides it. Kept apart from the component
// so a page passes its own.

export interface FooterCompactLink {
  label: string;
  href: string;
}

/** A labelled row of links: "Products", "Pages". Each list is a block of links, 12px apart. */
export interface FooterCompactLinkGroup {
  label: string;
  lists: readonly (readonly FooterCompactLink[])[];
}

/** A labelled contact line: "Phone", "Email", "Instagram". */
export interface FooterCompactContact {
  label: string;
  value: string;
  href?: string;
}

export interface FooterCompactContent {
  /** The brand's wordmark, set as text. */
  brand: string;
  linkGroups: readonly FooterCompactLinkGroup[];
  contacts: readonly FooterCompactContact[];
  copyright: string;
}

export const FOOTER_COMPACT_CONTENT: FooterCompactContent = {
  brand: "Vitrin",
  linkGroups: [
    {
      label: "Products",
      lists: [
        [
          { label: "Rose Body Cream", href: "/p/rose-body-cream" },
          { label: "Hammam Body Scrub", href: "/p/hammam-body-scrub" },
          { label: "Clay Body Powder", href: "/p/clay-body-powder" },
          { label: "The Ritual Bag", href: "/p/the-ritual-bag" },
        ],
      ],
    },
    {
      label: "Pages",
      lists: [
        [
          { label: "Home", href: "/" },
          { label: "Our story", href: "/about" },
          { label: "Shop", href: "/c/all" },
        ],
        [
          { label: "Shipping & returns", href: "/help/delivery" },
          { label: "Privacy policy", href: "/legal/privacy" },
          { label: "Terms & conditions", href: "/legal/terms" },
        ],
      ],
    },
  ],
  contacts: [
    { label: "Phone", value: "+44 20 7946 0321", href: "tel:+442079460321" },
    { label: "Email", value: "hello@vitrin.example", href: "mailto:hello@vitrin.example" },
    { label: "Instagram", value: "@vitrin", href: "https://www.instagram.com/vitrin" },
  ],
  copyright: "© Vitrin. All rights reserved",
};
