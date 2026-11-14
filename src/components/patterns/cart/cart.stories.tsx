import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Cart as CartData } from "@/lib/api/types/cart";
import { createMockCartAdapter, emptyCart } from "@/lib/commerce/mock-cart-adapter";
import { Cart } from "./cart";
import { ConnectedCart } from "./connected-cart";

// The cart page as it installs: the block on its own, and the connected version on
// createMockCartAdapter. The previews on vitrin.design/blocks/cart.

const euro = (amount: number) => ({ amount, currency: "EUR" });
const image = { src: "/dev/sample-square.webp", alt: "", width: 1024, height: 1024 };

const CART: CartData = {
  ...emptyCart(),
  lines: [
    {
      id: "line-1",
      productId: "sample-serum",
      variantId: "sample-serum-30",
      name: "Sample Serum",
      slug: "sample-serum",
      brandName: "Sample",
      variantTitle: "30 ml",
      image,
      quantity: 1,
      maxQuantity: 10,
      unitPrice: euro(1900),
      lineTotal: euro(1900),
    },
    {
      id: "line-2",
      productId: "sample-cream",
      variantId: "sample-cream-50",
      name: "Sample Night Cream",
      slug: "sample-cream",
      brandName: "Sample",
      variantTitle: "50 ml",
      image,
      quantity: 2,
      maxQuantity: 3,
      unitPrice: euro(2800),
      lineTotal: euro(5600),
    },
  ],
  subtotal: euro(7500),
  total: euro(7500),
  freeShippingThreshold: euro(10000),
};

const meta = {
  title: "Blocks/Cart",
  component: Cart,
  parameters: { layout: "fullscreen" },
  args: {
    cart: CART,
    onQuantityChange: fn(),
    onRemove: fn(),
    onApplyCoupon: () => ({ ok: false, error: "This code isn't valid." }),
    onRemoveCoupon: fn(),
  },
} satisfies Meta<typeof Cart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two lines, the free-delivery progress and the order summary. */
export const Default: Story = {};

/** An empty cart: the empty state and a way back to the shop. */
export const Empty: Story = { args: { cart: emptyCart() } };

/** The connected version: the lines come from the cart adapter, and changes go back to it. */
export const Connected: Story = {
  render: () => <ConnectedCart adapter={createMockCartAdapter(CART)} onError={fn()} />,
};
