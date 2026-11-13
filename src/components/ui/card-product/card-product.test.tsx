import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardProductHorizontal } from "./card-product-horizontal";
import { CardProductMinimal } from "./card-product-minimal";
import { CardProductVertical } from "./card-product-vertical";
import { CardProductVerticalSmall } from "./card-product-vertical-small";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const IMAGE = {
  src: "/brand/add-image.svg",
  alt: "Glow Serum bottle",
  width: 1024,
  height: 1024,
};
const BASE = {
  name: "Glow Serum",
  href: "/p/glow-serum",
  category: "Serums",
  image: IMAGE,
  price: eur(5600),
  compareAt: eur(7000),
};

describe("CardProductVertical", () => {
  it("is an article whose name links to the product, with rating, price and label", async () => {
    const { container } = render(
      <CardProductVertical {...BASE} label="New" rating={{ value: 4.2, reviewCount: 129 }} />,
    );
    const link = screen.getByRole("link", { name: "Glow Serum" });
    expect(link).toHaveAttribute("href", "/p/glow-serum");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(container).toHaveTextContent("Rated 4.2 out of 5");
    expect(screen.getByText("129 reviews")).toHaveClass("sr-only");
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(container).toHaveTextContent("Original price: €70");
    await expectNoAxeViolations(container);
  });

  it("toggles the wishlist with a named, pressed button", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <CardProductVertical {...BASE} wishlist={{ saved: false, count: 35000, onToggle }} />,
    );
    const like = screen.getByRole("button", { name: "Save Glow Serum to wishlist" });
    expect(like).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("35K")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Saved by 35000")).toHaveClass("sr-only");
    await userEvent.click(like);
    expect(onToggle).toHaveBeenCalled();
    rerender(<CardProductVertical {...BASE} wishlist={{ saved: true, onToggle }} />);
    const saved = screen.getByRole("button", { name: "Save Glow Serum to wishlist" });
    expect(saved).toHaveAttribute("aria-pressed", "true");
    expect(saved.querySelector(".icon-filled")).not.toBeNull();
  });

  it("summarises variants (five swatches, then +N) and offers a variant select", () => {
    const swatches = Array.from({ length: 8 }, (_, i) => ({
      src: IMAGE.src,
      name: `Shade ${i + 1}`,
    }));
    render(
      <CardProductVertical
        {...BASE}
        swatches={swatches}
        variantSummary="4 sizes"
        variantSelect={{ label: "Size", options: [{ value: "30", label: "30 ml" }] }}
      />,
    );
    expect(screen.getAllByRole("img", { name: /^Shade/ })).toHaveLength(5);
    expect(screen.getByText("3 more")).toHaveClass("sr-only");
    expect(screen.getByText("4 sizes")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Size" })).toBeInTheDocument();
  });

  it("offers Add to cart as a named button that only takes clicks while visible", async () => {
    const onAddToCart = vi.fn();
    render(<CardProductVertical {...BASE} onAddToCart={onAddToCart} />);
    const add = screen.getByRole("button", { name: "Add to cart: Glow Serum" });
    expect(add).toHaveTextContent("Add to cart");
    expect(add).toHaveClass("opacity-0", "pointer-events-none", "focus-visible:opacity-100");
    await userEvent.click(add, { pointerEventsCheck: 0 });
    expect(onAddToCart).toHaveBeenCalled();
  });

  it("uses the Brand background and shows a placeholder when the image is missing", () => {
    const { container } = render(<CardProductVertical {...BASE} image={undefined} color="brand" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-secondary");
    expect(container.querySelector("[data-placeholder]")).not.toBeNull();
  });
});

describe("CardProductVerticalSmall", () => {
  it("shows category, linked name and price, with a 4:3 image", async () => {
    const { container } = render(<CardProductVerticalSmall {...BASE} label="Sale" />);
    expect(screen.getByRole("link", { name: "Glow Serum" })).toBeInTheDocument();
    expect(container.querySelector(".aspect-4\\/3")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe("CardProductHorizontal", () => {
  it("shows the variant chip and trailing icon, with an 80px image", async () => {
    const { container } = render(<CardProductHorizontal {...BASE} variant="50 ml" />);
    expect(screen.getByText("50 ml")).toBeInTheDocument();
    expect(container.querySelector('[data-icon="keyboard_arrow_right"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.firstElementChild).toHaveClass(
      "inset-ring-border-default",
      "hover:inset-ring-2",
    );
    await expectNoAxeViolations(container);
  });
});

describe("CardProductMinimal", () => {
  const MINIMAL = {
    name: "Rose Body Cream",
    href: "/p/rose-body-cream",
    price: eur(2800),
    description: "Daily moisture with rose and olive oil",
    image: IMAGE,
  };

  it("links the whole card to the product and shows price and description", async () => {
    const { container } = render(<CardProductMinimal {...MINIMAL} />);
    const link = screen.getByRole("link", { name: "Rose Body Cream" });
    expect(link).toHaveAttribute("href", "/p/rose-body-cream");
    expect(link).toHaveClass("after:absolute", "after:inset-0", "group-hover/card:underline");
    expect(screen.getByText("€28")).toBeInTheDocument();
    expect(screen.getByText(MINIMAL.description)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps the tinted 4:5 area when there is no image, and hides an empty description", () => {
    const { container } = render(
      <CardProductMinimal {...MINIMAL} image={undefined} description={undefined} />,
    );
    expect(container.querySelector(".aspect-4\\/5")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByText(MINIMAL.description)).toBeNull();
  });
});
