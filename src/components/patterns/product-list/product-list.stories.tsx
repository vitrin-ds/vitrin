import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { createMockCartAdapter } from "@/lib/commerce/mock-cart-adapter";
import { FILTER_FACETS } from "../listing/filters/filters.fixtures";
import { EMPTY_FILTERS } from "../listing/filters/filter-types";
import { ConnectedProductList } from "./connected-product-list";
import { ProductList, type ProductListItem } from "./product-list";

// The category page's listing as it installs: the block on its own, and the connected version
// adding to createMockCartAdapter. The previews on vitrin.design/blocks/product-list.

const euro = (amount: number) => ({ amount, currency: "EUR" });

const NAMES = [
  "Serum",
  "Night Cream",
  "Cleanser",
  "Toner",
  "Face Oil",
  "Eye Cream",
  "Mask",
  "Mist",
];
const ITEMS: ProductListItem[] = NAMES.map((name, index) => ({
  id: `sample-${index + 1}`,
  variantId: `sample-${index + 1}-v1`,
  inStock: index !== 5,
  name: `Sample ${name}`,
  href: `/p/sample-${index + 1}`,
  category: "Skincare",
  image: { src: "/dev/sample-square.webp", alt: `Sample ${name}`, width: 1024, height: 1024 },
  price: euro(1900 + index * 300),
  ...(index === 1 ? { compareAt: euro(3200), label: "Sale" } : {}),
  rating: { value: 4 + (index % 2) / 2, reviewCount: 10 + index * 3 },
}));

const meta = {
  title: "Blocks/Product List",
  component: ProductList,
  parameters: { layout: "fullscreen" },
  args: {
    items: ITEMS,
    total: ITEMS.length,
    page: 1,
    pageCount: 1,
    pageSize: 24,
    pageHref: () => "/c/skincare",
    facets: FILTER_FACETS,
    filters: EMPTY_FILTERS,
    sort: "relevance",
    onFiltersChange: fn(),
    onSortChange: fn(),
    onAddToCart: fn(),
    heading: "Skincare",
    empty: { title: "No products match these filters" },
  },
} satisfies Meta<typeof ProductList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Eight products with the filters, sorting and Add to cart. */
export const Default: Story = {};

/** No product matches the filters. */
export const Empty: Story = { args: { items: [], total: 0 } };

/** The connected version: Add to cart adds the product through the cart adapter. */
export const Connected: Story = {
  render: () => (
    <ConnectedProductList
      items={ITEMS}
      total={ITEMS.length}
      page={1}
      pageCount={1}
      pageSize={24}
      pageHref={() => "/c/skincare"}
      facets={FILTER_FACETS}
      filters={EMPTY_FILTERS}
      sort="relevance"
      onFiltersChange={fn()}
      onSortChange={fn()}
      heading="Skincare"
      empty={{ title: "No products match these filters" }}
      adapter={createMockCartAdapter()}
      onError={fn()}
    />
  ),
};
