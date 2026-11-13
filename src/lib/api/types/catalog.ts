/** ISO 4217. The mocks use EUR. */
/** ISO 4217 code. Mocks use EUR; an adapter passes through what the shop sells in. */
export type CurrencyCode = string;

/** Money in minor units (cents), so sums never round. Format with Intl.NumberFormat. */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface ImageAsset {
  src: string;
  /** Describes the image; "" for decorative ones. */
  alt: string;
  width: number;
  height: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Null for a top-level category (3 levels: Skin Care › Face › Serums). */
  parentId: string | null;
  image?: ImageAsset;
  /** A cut-out product on transparent, for the small thumbnail cards (Square.Small). */
  thumb?: ImageAsset;
}

export interface Brand {
  id: string;
  slug: string;
  /** Placeholder brand names only, never real brands. */
  name: string;
  logo?: ImageAsset;
}

/** Promotional labels shown on product cards (Figma Label colours). */
export type ProductBadge = "new" | "sale" | "bestseller" | "limited" | "vegan" | "online-only";

/** A variant axis, e.g. shade (image swatches) or size (pills). */
export interface VariantOption {
  /** "shade", "size" … */
  name: string;
  value: string;
  /** Swatch image for image-based options. */
  swatch?: ImageAsset;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  options: VariantOption[];
  price: Money;
  /** The price before a discount; set only when the variant is on sale. */
  compareAtPrice?: Money;
  stock: StockStatus;
  /** Units left, for low-stock messages and quantity limits. */
  quantityAvailable: number;
  /**
   * The gallery for this variant when it differs from the product's (a shade: its packshot and
   * texture swatch). Missing: the product's `images`.
   */
  images?: ImageAsset[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  /** The first one is the primary category, shown on cards. */
  categoryIds: string[];
  description: string;
  /** The first one is the card image (1:1, white background). */
  images: ImageAsset[];
  /** Average, 0–5. */
  rating: number;
  reviewCount: number;
  badges: ProductBadge[];
  variants: ProductVariant[];
  attributes: Record<string, string>;
  /**
   * Lifecycle. Missing means "active". A "discontinued" product is out of every listing
   * (listProducts) but getProduct(slug) still returns it, so its URL can answer 410 Gone with
   * similar products instead of a 404 (Figma 14.02).
   */
  status?: ProductStatus;
  /** How many shoppers saved it to a wishlist (PDP "26,418 saved"). */
  savedCount?: number;
  /** PDP copy: Key Benefits and the Description / How to use / Ingredients tabs. */
  content?: ProductContent;
}

/** A Description block: a short heading and its paragraph. */
export interface ProductStorySection {
  heading: string;
  body: string;
}

export interface ProductContent {
  /** Key Benefits: one short line each. */
  benefits: string[];
  /** Description tab, in order. */
  story: ProductStorySection[];
  /** How to use: the steps, in order. */
  howToUse: string[];
  /** Ingredients: the INCI list as printed on the pack. */
  ingredients: string;
}

export type ProductStatus = "active" | "discontinued";

export type ProductSort =
  "relevance" | "newest" | "best-sellers" | "price-asc" | "price-desc" | "discount" | "top-rated";

/**
 * PLP query: the same parameters the real API will take (`?category=…&brand=…&sort=…&page=2`).
 * Filters combine with AND across keys and OR within a key.
 */
export interface ProductQuery {
  /** Category slug; includes its descendants. */
  category?: string;
  /** Brand slugs. */
  brands?: string[];
  /** Minor units. */
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  onSale?: boolean;
  badges?: ProductBadge[];
  /** Shade slugs (see shadeSlug); a product matches when any of its variants has one. */
  shades?: string[];
  sort?: ProductSort;
  /** 1-based. */
  page?: number;
  pageSize?: number;
  /**
   * Free-text search (08 Search, `/search?q=…`): every word must match the product's name, brand
   * or one of its categories (case and accent insensitive, a word matches from its start). With
   * `sort: "relevance"` the best matches come first.
   */
  q?: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Merchandising content: Header Top Bar messages, hero slides and banners (Figma Promotions). */
export type Promotion =
  | {
      id: string;
      kind: "message";
      text: string;
      href?: string;
    }
  | {
      id: string;
      kind: "hero" | "banner";
      /** Where it runs, e.g. "home-hero", "home-sale", "home-wide". */
      placement: string;
      overline?: string;
      title: string;
      copy?: string;
      image: ImageAsset;
      action?: { label: string; href: string };
      /** Percentage off, for the sale sticker. */
      discount?: number;
      /** ISO 8601, for a countdown. */
      endsAt?: string;
    };

// ── My Account (03) ──────────────────────────────────────────────────────────────────────────
