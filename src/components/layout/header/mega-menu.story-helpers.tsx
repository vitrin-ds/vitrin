import type { ReactNode } from "react";

/**
 * The panel at its Figma width (1440). A narrower canvas or docs page scrolls sideways instead of
 * crushing the columns. It only appears from 1024px on the site.
 */
export function MegaMenuStage({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Main" className="overflow-x-auto">
      <div className="min-w-1440">{children}</div>
    </nav>
  );
}

const TRENDING_BRAND_NAMES = [
  "Velora",
  "Nuve",
  "Aurell",
  "Serein",
  "Vellum",
  "Lunara",
  "Olyss",
  "Fayen",
  "Haloa",
  "Everyn",
  "Pureline",
  "Marrel",
] as const;

/** Figma's twelve Trending Brands, with the mock wordmarks. */
export const TRENDING_BRANDS = TRENDING_BRAND_NAMES.map((title) => {
  const slug = title.toLowerCase();
  return {
    id: slug,
    title,
    href: `/collections/${slug}`,
    image: { src: `/mock/brands/${slug}.svg`, alt: title, width: 80, height: 40 },
  };
});
