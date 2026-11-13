import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CardProductVerticalSmall,
  type CardProductVerticalSmallProps,
} from "./card-product-vertical-small";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: CardProductVerticalSmallProps["color"];
  productNameText: string;
  showBeforeDiscount: boolean;
  beforeDiscountText: number;
  priceText: number;
  showLabel: boolean;
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
const noop = () => undefined;

const COLORS = ["brand", "white"] as const;

const meta = {
  title: "Patterns/Discovery/Product Cards/Product Card Vertical Small",
  // The defaults of Figma's `.Base.Card.Product.Vertical.Small`, with a realistic name and price: the
  // placeholders are "Product Name Text" and €70 twice, which would hide the discount.
  args: {
    color: "brand",
    productNameText: "Product Name Text",
    showBeforeDiscount: true,
    beforeDiscountText: 7000,
    priceText: 7000,
    showLabel: true,
    showCategoryName: true,
    categoryNameText: "Category Name Text",
  },
  render: ({
    productNameText,
    showBeforeDiscount,
    beforeDiscountText,
    priceText,
    showLabel,
    showCategoryName,
    categoryNameText,
    color,
  }) => (
    <div className="max-w-240">
      <CardProductVerticalSmall
        name={productNameText}
        href={BASE.href}
        image={IMAGE}
        color={color}
        price={eur(priceText)}
        compareAt={showBeforeDiscount ? eur(beforeDiscountText) : undefined}
        category={showCategoryName ? categoryNameText : undefined}
        label={showLabel ? "New" : undefined}
        onAddToCart={noop}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Product.Vertical.Small: Color, then the Base ones. State
    // (Default, Hover) is a CSS state.
    controls: {
      include: [
        "color",
        "productNameText",
        "showBeforeDiscount",
        "beforeDiscountText",
        "priceText",
        "showLabel",
        "showCategoryName",
        "categoryNameText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        'Use in carousels, mega menu product showcases, and "You May Also Like" sections',
        "Use as the compact alternative to Card.Product.Vertical when variant selection isn't needed",
        "Show Label for promotional badges to drive attention in browsing contexts",
        "Use the Brand color variant to distinguish featured items within a carousel",
      ],
      dont: [
        "Don't use on primary product listing pages — use Card.Product.Vertical for full-featured grids",
        "Don't show Before Discount with the same value as Price — hide it when there's no discount",
        "Don't hide Product Name or Price — even in simplified cards, these are essential",
        "Don't add custom variant selectors — if variants are needed, switch to Card.Product.Vertical",
      ],
    },
    docs: {
      description: {
        component:
          "A lightweight vertical product card with essential product information only — no variants, ratings, or wishlist actions — designed for secondary placements like carousels, mega menus, and recommendation widgets. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    color: {
      description: "Figma `Color`. In code: `color`. The card background theme.",
      control: "inline-radio",
      options: COLORS,
      table: { type: { summary: '"brand" | "white"' }, defaultValue: { summary: "brand" } },
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
      description: "Figma `Before Discount Text`. In code: `compareAt.amount`, in euro cents.",
      control: "number",
      if: { arg: "showBeforeDiscount" },
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price.amount`, in euro cents.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
    },
    showLabel: {
      description: "Figma `Show Label`. In code: pass `label`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
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

/** Figma `Card.Product.Vertical.Small`: the compact alternative for carousels, mega menus and "You May Also Like". */
export const VerticalSmall: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-8 tablet:grid-cols-3 desktop:grid-cols-4">
      <CardProductVerticalSmall {...BASE} label="New" onAddToCart={noop} />
      <CardProductVerticalSmall {...BASE} color="white" compareAt={undefined} />
      <CardProductVerticalSmall {...BASE} image={undefined} />
    </div>
  ),
};
