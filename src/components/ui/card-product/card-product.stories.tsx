import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CardProductVertical, type CardProductVerticalProps } from "./card-product-vertical";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: CardProductVerticalProps["color"];
  showVariants: boolean;
  productNameText: string;
  showBeforeDiscount: boolean;
  beforeDiscountText: number;
  priceText: number;
  showVariantIsImage: boolean;
  swatchOverflowText: number;
  showVariantIsPill: boolean;
  variantSummaryText: string;
  showLikeButton: boolean;
  likeCountText: number;
  showLabel: boolean;
  showDropdown: boolean;
  showEvaluation: boolean;
  reviewCountText: number;
  showCategoryName: boolean;
  categoryNameText: string;
};

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const IMAGE = {
  src: "/brand/add-image.svg",
  alt: "Glow Serum, 30 ml dropper bottle",
  width: 1024,
  height: 1024,
};
const BASE = {
  name: "Glow Serum",
  href: "/p/glow-serum",
  category: "Serums",
  image: IMAGE,
  price: eur(5600),
  compareAt: eur(7000),
};
// The card shows the first five swatches, then "+N".
const SHOWN_SWATCHES = 5;
const SWATCHES = Array.from({ length: 31 }, (_, i) => ({
  src: "/dev/sample-square.webp",
  name: `Shade ${i + 1}`,
}));
const noop = () => undefined;

const COLORS = ["white", "brand"] as const;

/** The first card follows the controls; the heart toggles. */
function Playground({
  color,
  showVariants,
  productNameText,
  showBeforeDiscount,
  beforeDiscountText,
  priceText,
  showVariantIsImage,
  swatchOverflowText,
  showVariantIsPill,
  variantSummaryText,
  showLikeButton,
  likeCountText,
  showLabel,
  showDropdown,
  showEvaluation,
  reviewCountText,
  showCategoryName,
  categoryNameText,
}: Args) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-240">
      <CardProductVertical
        name={productNameText}
        href={BASE.href}
        image={IMAGE}
        color={color}
        price={eur(priceText)}
        compareAt={showBeforeDiscount ? eur(beforeDiscountText) : undefined}
        category={showCategoryName ? categoryNameText : undefined}
        label={showLabel ? "New" : undefined}
        rating={showEvaluation ? { value: 4.2, reviewCount: reviewCountText } : undefined}
        wishlist={
          showLikeButton
            ? {
                saved,
                count: saved ? likeCountText + 1 : likeCountText,
                onToggle: () => setSaved(!saved),
              }
            : undefined
        }
        swatches={
          showVariants && showVariantIsImage
            ? SWATCHES.slice(0, SHOWN_SWATCHES + swatchOverflowText)
            : undefined
        }
        variantSummary={showVariants && showVariantIsPill ? variantSummaryText : undefined}
        variantSelect={
          showVariants && showDropdown
            ? {
                label: "Size",
                options: [
                  { value: "30", label: "30 ml" },
                  { value: "50", label: "50 ml" },
                ],
              }
            : undefined
        }
        onAddToCart={noop}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/Discovery/Product Cards/Product Card Vertical",
  // The defaults of Figma's `.Base.Card.Product.Vertical`, with a realistic name and price: the
  // placeholders are "Product Name Text" and €70 twice, which would hide the discount.
  args: {
    color: "brand",
    showVariants: true,
    productNameText: "Product Name Text",
    showBeforeDiscount: true,
    beforeDiscountText: 7000,
    priceText: 7000,
    showVariantIsImage: true,
    swatchOverflowText: 26,
    showVariantIsPill: true,
    variantSummaryText: "4 Variants",
    showLikeButton: true,
    likeCountText: 35000,
    showLabel: true,
    showDropdown: true,
    showEvaluation: true,
    reviewCountText: 129,
    showCategoryName: true,
    categoryNameText: "Category Name Text",
  },
  render: (args) => <Playground {...args} />,
  parameters: {
    // The Figma properties of Card.Product.Vertical. State (Default, Hover) is a CSS state. Small,
    // Horizontal and Featured are separate Figma components, each with its own story file.
    controls: {
      include: [
        "color",
        "showVariants",
        "productNameText",
        "showBeforeDiscount",
        "beforeDiscountText",
        "priceText",
        "showVariantIsImage",
        "swatchOverflowText",
        "showVariantIsPill",
        "variantSummaryText",
        "showLikeButton",
        "likeCountText",
        "showLabel",
        "showDropdown",
        "showEvaluation",
        "reviewCountText",
        "showCategoryName",
        "categoryNameText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use as the primary card for product listing pages (PLP), search results, and category grids",
        'Show Label for promotional badges like "New", "Sale", or "Best Seller"',
        "Choose one variant display method per card — Image swatches for color, Pill for size, Dropdown for complex options",
        "Show Evaluation only when actual ratings data is available",
      ],
      dont: [
        "Don't enable all variant types simultaneously — pick the most relevant one for the product",
        "Don't show Before Discount with the same value as Price — hide it when there's no discount",
        "Don't hide Product Name or Price — these are essential for product cards",
        "Don't use the Brand color variant for entire grids — reserve it for featured or highlighted items",
      ],
    },
    docs: {
      description: {
        component:
          "The primary product card for grid-based product listings, featuring a rich set of content options including product image overlays, variant selectors, ratings, pricing, and a wishlist action. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    color: {
      description: "Figma `Color`. In code: `color`. The card background theme.",
      control: "inline-radio",
      options: COLORS,
      table: { type: { summary: '"white" | "brand"' }, defaultValue: { summary: "brand" } },
    },
    showVariants: {
      description:
        "Figma `Show Variants`. In code: show the variant displays below (`swatches`, `variantSummary`, `variantSelect`).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    productNameText: {
      description: "Figma `Product Name Text`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Product Name Text" } },
    },
    showBeforeDiscount: {
      description:
        "Figma `Show Before Discount`. In code: pass `compareAt`; only when it is higher than the price.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    beforeDiscountText: {
      description: "Figma `Before Discount Text`. In code: `compareAt.amount, in euro cents`.",
      control: "number",
      if: { arg: "showBeforeDiscount" },
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price.amount, in euro cents`.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    showVariantIsImage: {
      description:
        "Figma `Show Variant is Image`. In code: pass `swatches` (first five, then `+N`).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    swatchOverflowText: {
      description:
        "Figma `Swatch Overflow Text`. In code: `the number of `swatches` beyond the first five; shown as +N`.",
      control: "number",
      if: { arg: "showVariantIsImage" },
      table: { type: { summary: "number" }, defaultValue: { summary: "26" } },
    },
    showVariantIsPill: {
      description: "Figma `Show Variant is Pill`. In code: pass `variantSummary`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    variantSummaryText: {
      description: "Figma `Variant Summary Text`. In code: `variantSummary`.",
      control: "text",
      if: { arg: "showVariantIsPill" },
      table: { type: { summary: "string" }, defaultValue: { summary: "4 Variants" } },
    },
    showLikeButton: {
      description: "Figma `Show Like Button`. In code: pass `wishlist`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    likeCountText: {
      description: "Figma `Like Count Text`. In code: `wishlist.count, formatted compact (35K)`.",
      control: "number",
      if: { arg: "showLikeButton" },
      table: { type: { summary: "number" }, defaultValue: { summary: "35000" } },
    },
    showLabel: {
      description: "Figma `Show Label`. In code: pass `label`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showDropdown: {
      description: "Figma `Show Dropdown [Variant Selector]`. In code: pass `variantSelect`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showEvaluation: {
      description: "Figma `Show Evaluation`. In code: pass `rating`; only with real ratings.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    reviewCountText: {
      description: "Figma `Review Count Text`. In code: `rating.reviewCount, shown as (129)`.",
      control: "number",
      if: { arg: "showEvaluation" },
      table: { type: { summary: "number" }, defaultValue: { summary: "129" } },
    },
    showCategoryName: {
      description: "Figma `Show Category Name`. In code: pass `category`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    categoryNameText: {
      description: "Figma `Category Name Text`. In code: `category`.",
      control: "text",
      if: { arg: "showCategoryName" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Category Name Text" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults, with a realistic name and price. */
export const Default: Story = {};

/** The primary card of product lists. The first card follows the controls; Brand (default) · White; swatches, size summary, variant select. */
export const Vertical: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8 tablet:grid-cols-3 desktop:grid-cols-4">
      <Playground {...args} />
      <CardProductVertical
        {...BASE}
        color="white"
        rating={{ value: 4.7, reviewCount: 2140 }}
        variantSummary="4 sizes"
        wishlist={{ saved: true, count: 12, onToggle: noop }}
        onAddToCart={noop}
      />
      <CardProductVertical
        {...BASE}
        compareAt={undefined}
        price={eur(2400)}
        variantSelect={{
          label: "Size",
          options: [
            { value: "30", label: "30 ml" },
            { value: "50", label: "50 ml" },
          ],
        }}
      />
      <CardProductVertical
        {...BASE}
        name="Overnight Renewal Cream with Ceramides and Peptides for Dry Skin"
        image={undefined}
        compareAt={undefined}
        label="Limited"
      />
    </div>
  ),
};
