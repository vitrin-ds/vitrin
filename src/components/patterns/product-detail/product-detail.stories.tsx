import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Product, ProductVariant } from "@/lib/api/types/catalog";
import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";
import { ConnectedProductDetail } from "./connected-product-detail";
import { ProductDetail } from "./product-detail";

// The product page's purchase area as it installs: the block on its own, and the connected
// version adding to createMockCartAdapter. The previews on vitrin.design/blocks/product-detail.

const euro = (amount: number) => ({ amount, currency: "EUR" });
const image = (alt: string) => ({ src: "/dev/sample-square.webp", alt, width: 1024, height: 1024 });

const variant = (id: string, size: string, more: Partial<ProductVariant> = {}): ProductVariant => ({
  id,
  productId: "sample-cream",
  sku: id.toUpperCase(),
  options: [{ name: "size", value: size }],
  price: euro(2800),
  stock: "in-stock",
  quantityAvailable: 20,
  ...more,
});

const PRODUCT: Product = {
  id: "sample-cream",
  slug: "sample-cream",
  name: "Sample Night Cream",
  brandId: "sample",
  categoryIds: [],
  description: "A rich night cream that restores the skin while you sleep.",
  images: [image("Sample Night Cream, front"), image("Sample Night Cream, texture")],
  rating: 4.5,
  reviewCount: 32,
  badges: ["new"],
  attributes: {},
  variants: [
    variant("sample-cream-30", "30 ml", { price: euro(1900) }),
    variant("sample-cream-50", "50 ml"),
    variant("sample-cream-100", "100 ml", { stock: "out-of-stock", quantityAvailable: 0 }),
  ],
};

const meta = {
  title: "Blocks/Product Detail",
  component: ProductDetail,
  parameters: { layout: "fullscreen" },
  args: {
    product: PRODUCT,
    brand: { name: "Sample", href: "/brands/sample" },
    reviewsHref: "/p/sample-cream/reviews",
    onAddToCart: fn(async () => true),
    onVariantChange: fn(),
  },
  // The block takes its columns from the page grid around it.
  render: (args) => (
    <div className="page-grid">
      <ProductDetail {...args} />
    </div>
  ),
} satisfies Meta<typeof ProductDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Gallery, price, sizes (one out of stock) and Add to cart. */
export const Default: Story = {};

/** The connected version: Add to cart adds the chosen size through the cart adapter. */
export const Connected: Story = {
  render: () => (
    <div className="page-grid">
      <ConnectedProductDetail
        product={PRODUCT}
        brand={{ name: "Sample", href: "/brands/sample" }}
        adapter={createMockCartAdapter()}
        onError={fn()}
        onVariantChange={fn()}
      />
    </div>
  ),
};
