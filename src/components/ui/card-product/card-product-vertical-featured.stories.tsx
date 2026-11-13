import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardProductVerticalFeatured } from "./card-product-vertical-featured";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  productNameText: string;
  showBeforeDiscount: boolean;
  beforeDiscountText: number;
  priceText: number;
  showOverline: boolean;
  overlineText: string;
  showTitle: boolean;
  titleText: string;
};

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const SCENE = {
  src: "/brand/add-image.svg",
  alt: "Serums scene",
  width: 1024,
  height: 1024,
};
const PRODUCT_IMAGE = {
  src: "/brand/add-image.svg",
  alt: "Glow Serum, product shot",
  width: 1024,
  height: 1024,
};
const PRODUCT = {
  name: "Glow Serum",
  href: "/p/glow-serum",
  image: PRODUCT_IMAGE,
  price: eur(5600),
  compareAt: eur(7000),
};
const ITEM = { overline: "Serums", title: "Velora", image: SCENE, cta: "Shop", product: PRODUCT };

const meta = {
  title: "Patterns/Discovery/Product Cards/Product Card Vertical Featured",
  // The defaults of Figma's `.Base.Card.Product.Vertical.Featured`, with a realistic name, price and
  // copy: the placeholders are "Product Name Text" and €70 twice, which would hide the discount.
  args: {
    productNameText: "Product Name Text",
    showBeforeDiscount: true,
    beforeDiscountText: 7000,
    priceText: 7000,
    showOverline: true,
    overlineText: "Overline Text",
    showTitle: true,
    titleText: "Title Text",
  },
  render: ({
    productNameText,
    showBeforeDiscount,
    beforeDiscountText,
    priceText,
    showOverline,
    overlineText,
    showTitle,
    titleText,
  }) => (
    <div className="max-w-327">
      <CardProductVerticalFeatured
        {...ITEM}
        overline={showOverline ? overlineText : undefined}
        title={showTitle ? titleText : undefined}
        product={{
          ...PRODUCT,
          name: productNameText,
          price: eur(priceText),
          compareAt: showBeforeDiscount ? eur(beforeDiscountText) : undefined,
        }}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Product.Vertical.Featured: Base only. State (Default, Hover & Tap)
    // is a CSS state. The "Shop" Button is a nested Button, not a property.
    controls: {
      include: [
        "productNameText",
        "showBeforeDiscount",
        "beforeDiscountText",
        "priceText",
        "showOverline",
        "overlineText",
        "showTitle",
        "titleText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for hero banners, featured product spotlights, and editorial-driven layouts",
        'Use Overline for contextual labeling like "New Collection", "Best Seller", or "Staff Pick"',
        "Use Title for campaign-driven messaging that adds storytelling beyond the product name",
        "Place in prominent positions — homepage hero, collection headers, or single-product highlights",
      ],
      dont: [
        "Don't use in standard product grids — use Card.Product.Vertical for listing pages",
        "Don't show Before Discount with the same value as Price — hide it when there's no discount",
        "Don't use for compact placements — this card demands visual prominence",
        "Don't overload Overline and Title with lengthy text — keep the editorial tone punchy and concise",
      ],
    },
    docs: {
      description: {
        component:
          "A premium vertical product card with editorial-style text overlays — featuring an overline, title, product name, and pricing — designed for hero placements, featured collections, and curated spotlights. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    productNameText: {
      description: "Figma `Product Name Text`. In code: `product.name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Product Name Text" } },
    },
    showBeforeDiscount: {
      description:
        "Figma `Show Before Discount`. In code: pass `product.compareAt`; only when it is higher than the price.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    beforeDiscountText: {
      description:
        "Figma `Before Discount Text`. In code: `product.compareAt.amount`, in euro cents.",
      control: "number",
      if: { arg: "showBeforeDiscount" },
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `product.price.amount`, in euro cents.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    showOverline: {
      description: "Figma `Show Overline`. In code: pass `overline`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    overlineText: {
      description: "Figma `Overline Text`. In code: `overline`.",
      control: "text",
      if: { arg: "showOverline" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Overline Text" } },
    },
    showTitle: {
      description: "Figma `Show Title`. In code: pass `title`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      if: { arg: "showTitle" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Title Text" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults, with realistic copy. */
export const Default: Story = {};

/** Card.Product.Vertical.Featured alone (Figma 30108:205016), at the desktop card width. */
export const FeaturedCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-4">
      <CardProductVerticalFeatured {...ITEM} />
      <CardProductVerticalFeatured {...ITEM} overline={undefined} title={undefined} />
      <CardProductVerticalFeatured {...ITEM} cta={undefined} />
      <CardProductVerticalFeatured
        {...ITEM}
        image={undefined}
        product={{ ...PRODUCT, name: "Overnight Renewal Cream with Ceramides" }}
      />
    </div>
  ),
};
