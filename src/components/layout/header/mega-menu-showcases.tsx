import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { CardCategoryCircle } from "@/components/ui/card-category/card-category-circle";
import { CardCategoryHorizontal } from "@/components/ui/card-category/card-category-horizontal";
import { CardProductVerticalSmall } from "@/components/ui/card-product/card-product-vertical-small";

// The card grids the Mega Menu showcases hold (MegaMenu `aside` / `showcase` content):
// - Trending Product Showcase: Card.Product.Vertical.Small × 3 in a row (gap 20).
// - Trending Brand Showcase: Card.Category.Circle × 12 with the brand logos (media="logo", on
//   white), four to a row (gap 12 · 40).
// - Subcategory Showcase: Card.Category.Horizontal × 8, four to a row (gap 20).
// Each list is named, so a screen reader hears what the zone holds.

export interface MegaMenuProduct {
  id: string;
  name: string;
  href: string;
  image?: ImageAsset;
  price: Money;
  compareAt?: Money;
  /** Figma `Label` ("New"). */
  label?: string;
}

export function MegaMenuProductList({
  label,
  products,
  locale,
}: {
  label: string;
  products: readonly MegaMenuProduct[];
  locale?: string;
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-3 gap-20">
      {products.map(({ id, ...product }) => (
        <li key={id} className="flex">
          <CardProductVerticalSmall {...product} locale={locale} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export interface MegaMenuTile {
  id: string;
  title: string;
  href: string;
  image?: ImageAsset;
}

export function MegaMenuBrandGrid({
  label,
  brands,
}: {
  label: string;
  brands: readonly MegaMenuTile[];
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-4 gap-x-12 gap-y-40">
      {brands.map(({ id, ...brand }) => (
        <li key={id} className="flex justify-center">
          <CardCategoryCircle {...brand} media="logo" />
        </li>
      ))}
    </ul>
  );
}

export function MegaMenuCategoryGrid({
  label,
  categories,
}: {
  label: string;
  categories: readonly (MegaMenuTile & { productCount: number })[];
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-4 gap-20">
      {categories.map(({ id, ...category }) => (
        <li key={id} className="flex">
          <CardCategoryHorizontal {...category} headingLevel={2} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
