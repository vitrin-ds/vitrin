import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FILTER_CATEGORIES,
  FILTER_FACETS,
} from "@/components/patterns/listing/filters/filters.fixtures";
import { EMPTY_FILTERS } from "@/components/patterns/listing/filters/filter-types";
import { expectNoAxeViolations } from "@/test/axe";
import { ConnectedProductList } from "./connected-product-list";
import { ProductList, type ProductListItem, type ProductListProps } from "./product-list";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const item = (id: string, overrides: Partial<ProductListItem> = {}): ProductListItem => ({
  id,
  variantId: `${id}-v1`,
  inStock: true,
  name: `Lip Tint ${id}`,
  href: `/p/${id}`,
  category: "Lip Makeup",
  image: { src: "/dev/sample-square.webp", alt: `Lip Tint ${id}`, width: 1024, height: 1024 },
  price: eur(2400),
  ...overrides,
});

const ITEMS = [item("a"), item("b", { inStock: false })];

function renderList(props: Partial<ProductListProps> = {}) {
  const handlers = { onFiltersChange: vi.fn(), onSortChange: vi.fn(), onAddToCart: vi.fn() };
  const view = render(
    <ProductList
      items={ITEMS}
      total={26}
      page={2}
      pageCount={2}
      pageSize={24}
      pageHref={(page) => (page > 1 ? `/c/lips?page=${page}` : "/c/lips")}
      facets={FILTER_FACETS}
      filters={EMPTY_FILTERS}
      sort="relevance"
      categories={FILTER_CATEGORIES}
      heading="Lip Makeup products"
      empty={{
        title: "No products match these filters",
        action: { label: "Clear", href: "/c/lips" },
      }}
      {...handlers}
      {...props}
    />,
  );
  return { ...view, ...handlers };
}

describe("ProductList", () => {
  it("lists the cards with the count, range and page links", () => {
    renderList();
    const list = screen.getByRole("region", { name: "Lip Makeup products" });
    expect(within(list).getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("26 Products")).toBeInTheDocument();
    expect(screen.getByText("25–26 of 26")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /page 1/i })).toHaveAttribute("href", "/c/lips");
  });

  it("adds only cards in stock", async () => {
    const { onAddToCart } = renderList();
    const buttons = screen.getAllByRole("button", { name: /add to cart/i });
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]!);
    expect(onAddToCart).toHaveBeenCalledWith(ITEMS[0]);
  });

  it("reports a filter change", async () => {
    const { onFiltersChange } = renderList();
    const sidebar = screen.getAllByLabelText("Only in stock")[0]!;
    await userEvent.click(sidebar);
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it("shows the empty state instead of the grid", () => {
    renderList({ items: [], total: 0, page: 1, pageCount: 1 });
    expect(screen.getByRole("heading", { name: "No products match these filters" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Clear" })).toHaveAttribute("href", "/c/lips");
  });

  it("has no axe violations", async () => {
    const { container } = renderList();
    await expectNoAxeViolations(container);
  });
});

describe("ConnectedProductList", () => {
  it("adds the card's variant through the adapter", async () => {
    const cart = { id: "cart" } as never;
    const addLine = vi.fn(async () => cart);
    const onAdded = vi.fn();
    render(
      <ConnectedProductList
        items={ITEMS}
        total={2}
        page={1}
        pageCount={1}
        pageSize={24}
        pageHref={() => "/c/lips"}
        facets={FILTER_FACETS}
        filters={EMPTY_FILTERS}
        sort="relevance"
        onFiltersChange={() => {}}
        onSortChange={() => {}}
        heading="Lip Makeup products"
        empty={{ title: "Nothing" }}
        adapter={{ addLine }}
        onAdded={onAdded}
        onError={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    // The card's view of the product goes along, for an adapter without a catalogue.
    expect(addLine).toHaveBeenCalledWith(
      "a-v1",
      1,
      expect.objectContaining({ preview: expect.objectContaining({ name: expect.any(String) }) }),
    );
    await waitFor(() => expect(onAdded).toHaveBeenCalledWith(cart, ITEMS[0]));
  });
});
