import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { CardCartItemMinimal } from "./card-cart-item-minimal";

/** Figma's `.Base.Card.CartItem.Minimal` properties. Storybook only: in code Remove shows when `onRemove` is given. */
type Args = {
  showRemove: boolean;
  productNameText: string;
  priceText: number;
  onRemove: () => void;
};

function Playground({ showRemove, productNameText, priceText, onRemove }: Args) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="w-384">
      <CardCartItemMinimal
        name={productNameText}
        href="/p/rose-body-cream"
        price={{ amount: priceText * quantity, currency: "EUR" }}
        quantity={quantity}
        maxQuantity={5}
        onQuantityChange={setQuantity}
        onRemove={showRemove ? onRemove : undefined}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/Account & Cart & Checkout/Cart Items/Cart Item Minimal",
  // The defaults of Figma's `.Base.Card.CartItem.Minimal`. Money is in euro cents: €28.
  args: { showRemove: true, productNameText: "Rose Body Cream", priceText: 2800, onRemove: fn() },
  render: (args) => <Playground {...args} />,
  parameters: {
    // The Figma properties: State has Default only; then the Base ones.
    controls: { include: ["showRemove", "productNameText", "priceText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use it in the single-brand cart drawer, one line per product",
        "Keep the product name short so name and price stay on one row",
        "Show Remove so a line can be taken out in one step",
      ],
      dont: [
        "Don't use it in the multibrand cart — use Card.CartItem.Compact or Detailed",
        "Don't hide the price",
        "Don't add variant labels — use Card.CartItem.Compact when a product has variants",
      ],
    },
    docs: {
      description: {
        component:
          "A minimal cart line item for single-brand stores: product image, name, price, a small quantity Stepper and a Remove link.",
      },
    },
  },
  argTypes: {
    showRemove: {
      description: "Figma `Show Remove`. In code: pass `onRemove`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    productNameText: {
      description: "Figma `Product Name Text`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Rose Body Cream" } },
    },
    priceText: {
      description:
        "Figma `Price Text`: the unit price in euro cents. In code: `price`, the line price.",
      control: { type: "number", min: 0, step: 100 },
      table: { type: { summary: "Money" }, defaultValue: { summary: "€28" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Card.CartItem.Minimal`, State=Default (20.04 Cart drawer). */
export const Default: Story = {};

/** Show Remove off: quantity only. */
export const WithoutRemove: Story = { args: { showRemove: false } };
