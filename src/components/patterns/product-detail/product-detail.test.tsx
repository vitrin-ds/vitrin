import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Product, ProductVariant } from "@/lib/api/types/catalog";
import { expectNoAxeViolations } from "@/test/axe";
import { ConnectedProductDetail } from "./connected-product-detail";
import { ProductDetail, initialVariant, type ProductDetailProps } from "./product-detail";

const eur = (amount: number) => ({ amount, currency: "EUR" });
const image = (alt: string) => ({ src: "/dev/sample-square.webp", alt, width: 1024, height: 1024 });

function variant(
  id: string,
  size: string,
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id,
    productId: "p1",
    sku: id,
    options: [{ name: "size", value: size }],
    price: eur(5400),
    stock: "in-stock",
    quantityAvailable: 20,
    ...overrides,
  };
}

const PRODUCT: Product = {
  id: "p1",
  slug: "gel-cream",
  name: "Hydrating Gel Cream",
  brandId: "b1",
  categoryIds: ["c1"],
  description: "A light cream.",
  images: [image("Hydrating Gel Cream, front")],
  rating: 4.2,
  reviewCount: 12,
  badges: ["new"],
  attributes: {},
  variants: [
    variant("v50", "50 ml", { price: eur(2700), compareAtPrice: eur(3000) }),
    variant("v100", "100 ml"),
    variant("v200", "200 ml", { stock: "out-of-stock", quantityAvailable: 0 }),
  ],
  content: {
    benefits: ["Hydrates for 24 hours"],
    story: [],
    howToUse: [],
    ingredients: "",
  },
} as Product;

function renderDetail(props: Partial<ProductDetailProps> = {}) {
  const onAddToCart = vi.fn(async () => true);
  const onVariantChange = vi.fn();
  const view = render(
    <div className="page-grid">
      <ProductDetail
        product={PRODUCT}
        brand={{ name: "Lumen", href: "/brands/lumen" }}
        reviewsHref="/p/gel-cream/reviews"
        onAddToCart={onAddToCart}
        onVariantChange={onVariantChange}
        {...props}
      />
    </div>,
  );
  return { ...view, onAddToCart, onVariantChange };
}

describe("ProductDetail", () => {
  it("shows the product, its first variant and the sale badge", () => {
    renderDetail();
    expect(screen.getByRole("heading", { level: 1, name: "Hydrating Gel Cream" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Lumen" })).toHaveAttribute("href", "/brands/lumen");
    expect(screen.getByRole("radio", { name: /^50 ml/ })).toBeChecked();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("Hydrates for 24 hours")).toBeInTheDocument();
  });

  it("adds the chosen variant and quantity", async () => {
    const { onAddToCart, onVariantChange } = renderDetail();
    await userEvent.click(screen.getByRole("radio", { name: /^100 ml/ }));
    expect(onVariantChange).toHaveBeenCalledWith("v100");
    await userEvent.click(screen.getByRole("button", { name: /increase/i }));
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(onAddToCart).toHaveBeenCalledWith(
      { variantId: "v100", quantity: 2 },
      { buyNow: false, title: "Hydrating Gel Cream, 100 ml" },
    );
  });

  it("shows Buy Now only with onBuyNow, and calls it after the add", async () => {
    const onBuyNow = vi.fn();
    renderDetail({ onBuyNow });
    await userEvent.click(screen.getByRole("button", { name: "Buy Now" }));
    await waitFor(() => expect(onBuyNow).toHaveBeenCalled());
  });

  it("doesn't go to checkout when the add was refused", async () => {
    const onBuyNow = vi.fn();
    renderDetail({ onBuyNow, onAddToCart: vi.fn(async () => false) });
    await userEvent.click(screen.getByRole("button", { name: "Buy Now" }));
    expect(onBuyNow).not.toHaveBeenCalled();
  });

  it("disables buying a sold-out variant and says why", () => {
    renderDetail({ initialVariantId: "v200" });
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Buy Now" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Out of stock").length).toBeGreaterThan(0);
  });

  it("starts on the first variant in stock", () => {
    const soldOutFirst = {
      variants: [PRODUCT.variants[2]!, PRODUCT.variants[1]!],
    };
    expect(initialVariant(soldOutFirst).id).toBe("v100");
    expect(initialVariant(soldOutFirst, "v200").id).toBe("v200");
  });

  it("has no axe violations", async () => {
    const { container } = renderDetail({ onBuyNow: () => {} });
    await expectNoAxeViolations(container);
  });
});

describe("ConnectedProductDetail", () => {
  it("adds through the adapter and reports refusals", async () => {
    const cart = { id: "cart" } as never;
    const addLine = vi.fn().mockResolvedValueOnce(cart).mockRejectedValueOnce(new Error("no"));
    const onAdded = vi.fn();
    const onError = vi.fn();
    const onBuyNow = vi.fn();
    render(
      <ConnectedProductDetail
        product={PRODUCT}
        adapter={{ addLine }}
        onAdded={onAdded}
        onError={onError}
        onBuyNow={onBuyNow}
        onVariantChange={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    await waitFor(() =>
      expect(onAdded).toHaveBeenCalledWith(cart, expect.objectContaining({ buyNow: false })),
    );
    // The page's view of the variant goes along, for an adapter without a catalogue.
    expect(addLine).toHaveBeenCalledWith(
      "v50",
      1,
      expect.objectContaining({
        preview: expect.objectContaining({
          productId: expect.any(String),
          unitPrice: expect.any(Object),
        }),
      }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Buy Now" }));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onBuyNow).not.toHaveBeenCalled();
  });
});
