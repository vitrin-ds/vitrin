import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CardCartItemDetailed } from "./card-cart-item-detailed";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  type: "list" | "card";
  productName: string;
  showOverline: boolean;
  overlineText: string;
  priceText: number;
  showBeforeDiscountText: boolean;
  beforeDiscountPriceText: number;
  itemCountText: number;
  showStrapperActions: boolean;
  showLabels: boolean;
  showLabel1: boolean;
  showLabel2: boolean;
  showDisclaimer: boolean;
  disclaimerText: string;
};

const TYPES = ["list", "card"] as const;

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const BASE = {
  name: "Glow Serum",
  href: "/p/glow-serum",
  overline: "Serein",
  image: {
    src: "/brand/add-image.svg",
    alt: "Glow Serum bottle",
    width: 1024,
    height: 1024,
  },
  variantLabels: ["30 ml", "Rosewood"],
  price: eur(3920),
  compareAt: eur(5600),
  quantity: 2,
};
const noop = () => undefined;

/** The card follows the controls; the stepper works. */
function Playground({
  type,
  productName,
  showOverline,
  overlineText,
  priceText,
  showBeforeDiscountText,
  beforeDiscountPriceText,
  itemCountText,
  showStrapperActions,
  showLabels,
  showLabel1,
  showLabel2,
  showDisclaimer,
  disclaimerText,
}: Args) {
  const [quantity, setQuantity] = useState(itemCountText);
  const labels = showLabels
    ? [showLabel1 ? "30 ml" : undefined, showLabel2 ? "Rosewood" : undefined].filter(
        (label): label is string => label !== undefined,
      )
    : [];
  return (
    <div className="max-w-676">
      <CardCartItemDetailed
        name={productName}
        href={BASE.href}
        image={BASE.image}
        type={type}
        overline={showOverline ? overlineText : undefined}
        variantLabels={labels}
        price={eur(priceText)}
        compareAt={showBeforeDiscountText ? eur(beforeDiscountPriceText) : undefined}
        quantity={quantity}
        maxQuantity={99}
        onQuantityChange={showStrapperActions ? setQuantity : undefined}
        disclaimer={showDisclaimer ? { tone: "success", text: disclaimerText } : undefined}
        onSaveForLater={noop}
        onRemove={noop}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/Account & Cart & Checkout/Cart Items/Cart Item Detailed",
  // The defaults of Figma's `.Base.Card.CartItem.Detailed`. Money is in euro cents: €2.000.00 and
  // €22.00.
  args: {
    type: "list",
    productName: "[Product Name]",
    showOverline: true,
    overlineText: "[Overline Text]",
    priceText: 200000,
    showBeforeDiscountText: true,
    beforeDiscountPriceText: 2200,
    itemCountText: 3,
    showStrapperActions: true,
    showLabels: true,
    showLabel1: true,
    showLabel2: true,
    showDisclaimer: true,
    disclaimerText: "In stock",
  },
  // `key` restarts the stepper when the count control changes.
  render: (args) => <Playground key={args.itemCountText} {...args} />,
  parameters: {
    // The Figma properties of Card.CartItem.Detailed: Type, then the Base ones. Hover & Tap is a CSS
    // state. The Labels are nested instances, so their text is fixed; the stock icon follows the tone.
    controls: {
      include: [
        "type",
        "productName",
        "showOverline",
        "overlineText",
        "priceText",
        "showBeforeDiscountText",
        "beforeDiscountPriceText",
        "itemCountText",
        "showStrapperActions",
        "showLabels",
        "showLabel1",
        "showLabel2",
        "showDisclaimer",
        "disclaimerText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use on the cart page and order review where the stock disclaimer and full pricing matter; use the compact CartItem for the mini-cart and order-summary strips",
        'Pair the Disclaimer Icon with its meaning — check for in-stock, an alert icon for low-stock, and shift Disclaimer Text to match ("Only 2 left")',
        "Show Before Discount Text only when the item is actually discounted",
        "Keep the two variant labels for distinct attributes (shade and size), not one attribute split across both",
      ],
      dont: [
        "Don't hide Show Prices or Product Name — they are the line item's core identity",
        'Don\'t leave Disclaimer Text as "In stock" on an out-of-stock or low-stock item; the line exists to tell the truth about availability',
        "Don't enable Show Before Discount Text with the same value as Price Text",
        "Don't disable Show Strapper Actions in an editable cart — the user needs to change quantity inline",
      ],
    },
    docs: {
      description: {
        component:
          "A full cart line item for the cart page and order review — product image, code, name, variant labels, a stock disclaimer line, pricing, and a quantity stepper. The detailed counterpart to the compact CartItem used in the mini-cart. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    type: {
      description: "Figma `Type`: List is borderless for stacked rows; Card is a bordered surface.",
      control: "inline-radio",
      options: TYPES,
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    productName: {
      description: "Figma `Product Name`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Product Name]" } },
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
      table: { type: { summary: "string" }, defaultValue: { summary: "[Overline Text]" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price.amount`, in euro cents.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "200000" } },
    },
    showBeforeDiscountText: {
      description: "Figma `Show Before Discount Text`. In code: pass `compareAt`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    beforeDiscountPriceText: {
      description:
        "Figma `Before Discount Price Text`. In code: `compareAt.amount`, in euro cents.",
      control: "number",
      if: { arg: "showBeforeDiscountText" },
      table: { type: { summary: "number" }, defaultValue: { summary: "2200" } },
    },
    itemCountText: {
      description: "Figma `Item Count Text`. In code: `quantity`.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "3" } },
    },
    showStrapperActions: {
      description:
        "Figma `Show Strapper Actions`: the add and remove buttons of the quantity. In code: pass `onQuantityChange`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabels: {
      description: "Figma `Show Labels`. In code: pass `variantLabels`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabel1: {
      description:
        "Figma `Show Label [1]`: the example shows “30 ml”. In code: `variantLabels[0]`.",
      control: "boolean",
      if: { arg: "showLabels" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabel2: {
      description:
        "Figma `Show Label [2]`: the example shows “Rosewood”. In code: `variantLabels[1]`.",
      control: "boolean",
      if: { arg: "showLabels" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showDisclaimer: {
      description: "Figma `Show Disclaimer`. In code: pass `disclaimer`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    disclaimerText: {
      description: "Figma `Disclaimer Text`. In code: `disclaimer.text`.",
      control: "text",
      if: { arg: "showDisclaimer" },
      table: { type: { summary: "string" }, defaultValue: { summary: "In stock" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. The stepper works. */
export const Default: Story = {};

/** Figma `Card.CartItem.Detailed`: List · Card, in stock / low / out of stock. */
export const Detailed: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-676 flex-col gap-16">
      <CardCartItemDetailed
        {...BASE}
        disclaimer={{ tone: "success", text: "In stock" }}
        onQuantityChange={noop}
        onSaveForLater={noop}
        onRemove={noop}
      />
      <CardCartItemDetailed
        {...BASE}
        type="card"
        maxQuantity={2}
        disclaimer={{ tone: "warning", text: "Only 2 left" }}
        onQuantityChange={noop}
        onSaveForLater={noop}
        onRemove={noop}
      />
      <CardCartItemDetailed
        {...BASE}
        type="card"
        compareAt={undefined}
        disclaimer={{ tone: "error", text: "Out of stock" }}
        onRemove={noop}
      />
    </div>
  ),
};
