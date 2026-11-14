import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { emptyCart } from "@/lib/commerce/mock-cart-adapter";
import { createMockCheckoutAdapter } from "@/lib/commerce/mock-checkout-adapter";
import { SAMPLE_SHIPPING_METHODS } from "@/lib/commerce/mock-samples";
import { Checkout } from "./checkout";

// The checkout block as it installs: on createMockCheckoutAdapter, a guest with two delivery
// options and one line in the cart. The preview on vitrin.design/blocks/checkout.

const euro = (amount: number) => ({ amount, currency: "EUR" });

const CART = {
  ...emptyCart(),
  lines: [
    {
      id: "line-1",
      productId: "sample-serum",
      variantId: "sample-serum-30",
      name: "Sample Serum",
      slug: "sample-serum",
      variantTitle: "30 ml",
      image: { src: "/dev/sample-square.webp", alt: "", width: 1024, height: 1024 },
      quantity: 1,
      maxQuantity: 10,
      unitPrice: euro(1900),
      lineTotal: euro(1900),
    },
  ],
  subtotal: euro(1900),
  total: euro(1900),
};

const meta = {
  title: "Blocks/Checkout",
  component: Checkout,
  parameters: { layout: "fullscreen" },
  args: {
    initial: { cart: CART, customer: null, methods: SAMPLE_SHIPPING_METHODS },
    cart: CART,
    adapter: createMockCheckoutAdapter(),
    onPlaced: fn(),
    onNotice: fn(),
    onApplyCoupon: () => ({ ok: false, error: "This code isn't valid." }),
    onRemoveCoupon: fn(),
  },
} satisfies Meta<typeof Checkout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A guest checkout: contact, delivery, payment and the order summary. */
export const Default: Story = {};
