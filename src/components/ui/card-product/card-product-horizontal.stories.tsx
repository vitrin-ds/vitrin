import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardProductHorizontal, type CardProductHorizontalProps } from "./card-product-horizontal";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: CardProductHorizontalProps["color"];
  showRightIcon: boolean;
  rightIcon: IconName;
  productNameText: string;
  showCategoryName: boolean;
  categoryNameText: string;
  priceText: number;
  showBeforeDiscount: boolean;
  beforeDiscountText: number;
  showChipVariant: boolean;
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

const COLORS = ["brand", "white"] as const;

const meta = {
  title: "Patterns/Discovery/Product Cards/Product Card Horizontal",
  // The defaults of Figma's `.Base.Card.Product.Horizontal`, with a realistic name and price: the
  // placeholders are "Product Name" and €70 twice, which would hide the discount.
  args: {
    color: "brand",
    showRightIcon: true,
    rightIcon: "keyboard_arrow_right",
    productNameText: "Product Name",
    showCategoryName: true,
    categoryNameText: "Category Name",
    priceText: 7000,
    showBeforeDiscount: true,
    beforeDiscountText: 7000,
    showChipVariant: true,
  },
  render: ({
    color,
    showRightIcon,
    rightIcon,
    productNameText,
    showCategoryName,
    categoryNameText,
    priceText,
    showBeforeDiscount,
    beforeDiscountText,
    showChipVariant,
  }) => (
    <div className="max-w-448">
      <CardProductHorizontal
        name={productNameText}
        href={BASE.href}
        image={IMAGE}
        color={color}
        price={eur(priceText)}
        compareAt={showBeforeDiscount ? eur(beforeDiscountText) : undefined}
        category={showCategoryName ? categoryNameText : undefined}
        variant={showChipVariant ? "50 ml" : undefined}
        rightIcon={showRightIcon ? rightIcon : null}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Product.Horizontal: Color, then the Base ones. State (Default,
    // Hover & Tap) is a CSS state. The Chip's text is a nested Chip, not a property.
    controls: {
      include: [
        "color",
        "showRightIcon",
        "rightIcon",
        "productNameText",
        "showCategoryName",
        "categoryNameText",
        "priceText",
        "showBeforeDiscount",
        "beforeDiscountText",
        "showChipVariant",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use in cart, wishlist, and order history where products are listed vertically",
        "Show Before Discount only when the product is actually discounted",
        "Use Chip [Variant] to display the selected variant (size, color) at a glance",
        "Use the Brand color variant to highlight featured or promoted items",
      ],
      dont: [
        "Don't hide Product Name — it's the primary identifier",
        "Don't show both price fields with the same value — hide Before Discount when there's no discount",
        "Don't use for product discovery grids — use Card.Product.Vertical variants instead",
        "Don't overload with long category names — keep them short or hide when context is clear",
      ],
    },
    docs: {
      description: {
        component:
          "A horizontal product card displaying product details in a compact row layout — ideal for cart items, order summaries, wishlists, and search results where vertical space is limited. Hover and Tap are CSS states: use the pointer on the example to see them.",
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
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: `rightIcon` (`null` hides it).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_right" } },
    },
    productNameText: {
      description: "Figma `Product Name Text`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Product Name" } },
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
      table: { type: { summary: "string" }, defaultValue: { summary: "Category Name" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price.amount`, in euro cents.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "7000" } },
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
    showChipVariant: {
      description:
        "Figma `Show Chip [Variant]`. In code: pass `variant` (the example shows “50 ml”).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults, with a realistic name and price. */
export const Default: Story = {};

/** Figma `Card.Product.Horizontal`: a compact row for cart, wishlist, order history and search results. */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-448 flex-col gap-16">
      <CardProductHorizontal {...BASE} variant="50 ml" />
      <CardProductHorizontal {...BASE} color="white" variant="Rosewood" compareAt={undefined} />
      <CardProductHorizontal {...BASE} image={undefined} rightIcon={null} />
    </div>
  ),
};
