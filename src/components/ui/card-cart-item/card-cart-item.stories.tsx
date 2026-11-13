import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CardCartItemCompact } from "./card-cart-item-compact";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  type: "list" | "card";
  disabled: boolean;
  productName: string;
  showLeftIcon: boolean;
  showOverline: boolean;
  overlineText: string;
  showProductSubtitle: boolean;
  productSubtitleText: string;
  showLabels: boolean;
  showLabel1: boolean;
  showLabel2: boolean;
  showBeforeDiscountPrice: boolean;
  beforeDiscountPriceText: number;
  priceText: number;
  itemCountText: number;
  showStrapperActions: boolean;
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

/** The card follows the controls; the stepper and the checkbox work. */
function Playground({
  type,
  disabled,
  productName,
  showLeftIcon,
  showOverline,
  overlineText,
  showProductSubtitle,
  productSubtitleText,
  showLabels,
  showLabel1,
  showLabel2,
  showBeforeDiscountPrice,
  beforeDiscountPriceText,
  priceText,
  itemCountText,
  showStrapperActions,
}: Args) {
  const [quantity, setQuantity] = useState(itemCountText);
  const [checked, setChecked] = useState(true);
  const labels = showLabels
    ? [showLabel1 ? "30 ml" : undefined, showLabel2 ? "Rosewood" : undefined].filter(
        (label): label is string => label !== undefined,
      )
    : [];
  return (
    <div className="max-w-445">
      <CardCartItemCompact
        name={productName}
        href={BASE.href}
        image={BASE.image}
        type={type}
        disabled={disabled}
        overline={showOverline ? overlineText : undefined}
        subtitle={showProductSubtitle ? productSubtitleText : undefined}
        variantLabels={labels}
        price={eur(priceText)}
        compareAt={showBeforeDiscountPrice ? eur(beforeDiscountPriceText) : undefined}
        quantity={quantity}
        maxQuantity={99}
        onQuantityChange={showStrapperActions ? setQuantity : undefined}
        selection={showLeftIcon ? { checked, onCheckedChange: setChecked } : undefined}
      />
    </div>
  );
}

function Editable({ type }: { type: "list" | "card" }) {
  const [quantity, setQuantity] = useState(2);
  const [checked, setChecked] = useState(true);
  return (
    <CardCartItemCompact
      {...BASE}
      type={type}
      subtitle="Brightening vitamin C serum"
      quantity={quantity}
      maxQuantity={5}
      onQuantityChange={setQuantity}
      selection={{ checked, onCheckedChange: setChecked }}
      minQuantity={0}
    />
  );
}

const meta = {
  title: "Patterns/Account & Cart & Checkout/Cart Items/Cart Item Compact",
  // The defaults of Figma's `.Base.Card.CartItem.Compact`. Money is in euro cents: €20.00 and €22.
  args: {
    type: "list",
    disabled: false,
    productName: "[Product Name]",
    showLeftIcon: true,
    showOverline: true,
    overlineText: "[Overline Text]",
    showProductSubtitle: true,
    productSubtitleText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    showLabels: true,
    showLabel1: true,
    showLabel2: true,
    showBeforeDiscountPrice: true,
    beforeDiscountPriceText: 2200,
    priceText: 2000,
    itemCountText: 3,
    showStrapperActions: true,
  },
  // `key` restarts the stepper when the count control changes.
  render: (args) => <Playground key={args.itemCountText} {...args} />,
  parameters: {
    // The Figma properties of Card.CartItem.Compact: State=Disabled, Type, then the Base ones.
    // Hover & Tap is a CSS state. The two Labels are nested instances, so their text is fixed.
    controls: {
      include: [
        "type",
        "disabled",
        "productName",
        "showLeftIcon",
        "showOverline",
        "overlineText",
        "showProductSubtitle",
        "productSubtitleText",
        "showLabels",
        "showLabel1",
        "showLabel2",
        "showBeforeDiscountPrice",
        "beforeDiscountPriceText",
        "priceText",
        "itemCountText",
        "showStrapperActions",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Labels to display selected variants like size, color, or other product options",
        "Show Before Discount Price only when the item has an active discount",
        "Use the Card type in full cart pages, List type in mini cart side panels",
        "Show Strapper Actions to allow inline quantity adjustments directly in the cart",
      ],
      dont: [
        "Don't hide Product Name or Price — they are essential for cart identification",
        "Don't show both Labels when the product has no variants — hide unused ones",
        "Don't display Before Discount Price with the same value as Price",
        "Don't hide Strapper in editable cart contexts — users need to adjust quantities without navigating away",
      ],
    },
    docs: {
      description: {
        component:
          "A comprehensive cart line item displaying product image, details, variant labels, pricing, and quantity controls — used in shopping cart pages, mini cart panels, and checkout order summaries. Hover and Tap are CSS states: use the pointer on the example to see them.",
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
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    productName: {
      description: "Figma `Product Name`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Product Name]" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`: the selection checkbox. In code: pass `selection`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
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
    showProductSubtitle: {
      description: "Figma `Show Product Subtitle`. In code: pass `subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    productSubtitleText: {
      description: "Figma `Product Subtitle Text`. In code: `subtitle`.",
      control: "text",
      if: { arg: "showProductSubtitle" },
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " },
      },
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
    showBeforeDiscountPrice: {
      description: "Figma `Show Before Discount Price`. In code: pass `compareAt`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    beforeDiscountPriceText: {
      description:
        "Figma `Before Discount Price Text`. In code: `compareAt.amount`, in euro cents.",
      control: "number",
      if: { arg: "showBeforeDiscountPrice" },
      table: { type: { summary: "number" }, defaultValue: { summary: "2200" } },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price.amount`, in euro cents.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "2000" } },
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
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. The stepper and the checkbox work. */
export const Default: Story = {};

/**
 * Figma `Card.CartItem.Compact`: Type × Default · Disabled; read-only in the order summary. The
 * editable lines remove themselves with "−" at quantity 1 (given `minQuantity={0}`).
 */
export const Compact: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid max-w-760 grid-cols-1 gap-16 tablet:grid-cols-2">
      <Editable type="list" />
      <Editable type="card" />
      <CardCartItemCompact {...BASE} type="card" disabled onQuantityChange={noop} />
      <CardCartItemCompact {...BASE} type="list" compareAt={undefined} image={undefined} />
    </div>
  ),
};

/**
 * The states Return Items (03.01.05) gives the Compact card: a toned overline for a reason, a
 * number or mark in the `leading` slot while an item waits for one, and `done` once it has it.
 */
export const CompactReturn: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-445 flex-col gap-8">
      <CardCartItemCompact {...BASE} type="card" overline="FINAL SALE" overlineTone="error" />
      <CardCartItemCompact
        {...BASE}
        type="card"
        leading={<span className="text-label-md text-text-primary">1</span>}
      />
      <CardCartItemCompact {...BASE} type="card" overline="Doesn't fit" done />
    </div>
  ),
};
