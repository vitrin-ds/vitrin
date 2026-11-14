import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Cart } from "@/lib/api/types/cart";
import { createMockCartAdapter, emptyCart } from "@/lib/commerce/mock-cart-adapter";
import { ConnectedMiniCart } from "./connected-mini-cart";
import { MiniCart } from "./mini-cart";
import { eur, MINI_CART_LINES } from "./mini-cart.fixtures";

// The mini cart as it installs: the sheet on its own, and the connected version on
// createMockCartAdapter. The previews on vitrin.design/blocks/mini-cart.

const CART: Cart = {
  ...emptyCart(),
  lines: MINI_CART_LINES.map((line) => ({
    id: line.id,
    productId: line.id,
    variantId: `${line.id}-variant`,
    name: line.name,
    slug: line.href.replace("/p/", ""),
    brandName: line.overline,
    variantTitle: line.subtitle,
    image: line.image,
    quantity: line.quantity,
    maxQuantity: line.maxQuantity ?? 10,
    unitPrice: line.unitPrice,
    lineTotal: line.price,
  })),
  subtotal: eur(10800),
  total: eur(10800),
  freeShippingThreshold: eur(15000),
};

const meta = {
  title: "Blocks/Mini Cart",
  component: MiniCart,
  parameters: { layout: "fullscreen" },
  // The sheet is fixed over the page: the story gives it a page of the screen's height behind it.
  decorators: [
    (Story) => (
      <div className="min-h-dvh">
        <Story />
      </div>
    ),
  ],
  args: {
    open: true,
    onClose: fn(),
    lines: MINI_CART_LINES,
    subtotal: eur(10800),
    freeShippingThreshold: eur(15000),
    onQuantityChange: fn(),
    onRemove: fn(),
    checkoutHref: "/checkout",
    cartHref: "/cart",
    shopHref: "/",
  },
} satisfies Meta<typeof MiniCart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two lines, the free-delivery progress, and the way to the cart and checkout. */
export const Default: Story = {};

/** Nothing in the cart yet. */
export const Empty: Story = { args: { lines: [], subtotal: eur(0) } };

/** The connected version: the lines come from the cart adapter, and changes go back to it. */
export const Connected: Story = {
  render: () => (
    <ConnectedMiniCart
      adapter={createMockCartAdapter(CART)}
      onError={fn()}
      open
      onClose={fn()}
      checkoutHref="/checkout"
      cartHref="/cart"
      shopHref="/"
    />
  ),
};
