import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { CardOrderHistory } from "./card-order-history";
import { CardOrderHistoryEmpty } from "./card-order-history-empty";

const image = (alt: string): ImageAsset => ({
  src: "/brand/add-image.svg",
  alt,
  width: 1024,
  height: 1024,
});

const PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  name: `Product ${i + 1}`,
  image: i === 2 ? undefined : image(`Product ${i + 1}`),
}));

const BASE = {
  href: "/account/orders/o-1",
  orderNumber: "TH-48211",
  date: "2026-10-27T09:14:00Z",
  timeZone: "UTC",
  title: "Home · Lindenstraße 12, Berlin",
};

describe("CardOrderHistory", () => {
  it("links the whole card from the order number and shows total and status", async () => {
    const { container } = render(
      <CardOrderHistory
        {...BASE}
        products={PRODUCTS}
        productCount={8}
        total={{ amount: 41200, currency: "EUR" }}
        status="delivered"
      />,
    );
    const link = screen.getByRole("link", { name: "#TH-48211 27.10.2026" });
    expect(link).toHaveAttribute("href", "/account/orders/o-1");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(screen.getByRole("heading", { level: 3 })).toContainElement(link);
    expect(screen.getByText("€412").parentElement).toHaveTextContent("Total: €412");
    expect(screen.getByText("Delivered")).toHaveClass("bg-(--th-indicator-success-soft-bg)");
    await expectNoAxeViolations(container);
  });

  it("shows five thumbnails at most and counts the rest", () => {
    render(<CardOrderHistory {...BASE} products={PRODUCTS} productCount={8} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByAltText("Product 1")).toBeInTheDocument();
    // Missing image: the Add Image placeholder is named after the product.
    expect(screen.getByRole("img", { name: "Product 3" })).toHaveAttribute("data-placeholder");
    expect(screen.getByText("+ 3 Products")).toBeInTheDocument();
    // Figma's 1px inside stroke, drawn above the image so the packshot can't cover it.
    expect(screen.getByAltText("Product 1").closest("li")?.firstElementChild).toHaveClass(
      "after:inset-ring",
      "after:inset-ring-border-default",
    );
  });

  it("hides the empty slots: no product list, no bottom section", () => {
    render(<CardOrderHistory {...BASE} />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByText(/Total/)).toBeNull();
  });

  it("uses the error chip for a cancelled order and the card border for type card", () => {
    render(<CardOrderHistory {...BASE} status="cancelled" type="card" />);
    expect(screen.getByText("Cancelled")).toHaveClass("bg-(--th-indicator-error-soft-bg)");
    expect(screen.getByRole("article")).toHaveClass("rounded-card", "inset-ring");
  });

  it("drops the link and greys out when disabled", async () => {
    const { container } = render(
      <CardOrderHistory {...BASE} disabled total={{ amount: 100, currency: "EUR" }} />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(screen.getByRole("article")).toHaveClass("bg-surface-disabled");
    await expectNoAxeViolations(container);
  });

  it("shows Figma's Focus inside the card and can hide the order line and right icon", () => {
    const { container } = render(
      <CardOrderHistory href="/account/orders/1" title="Home" type="card" rightIcon={null} />,
    );
    expect(container.firstChild).toHaveClass(
      "has-[a:focus-visible]:inset-ring-interactive-focus-ring",
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/account/orders/1");
    expect(container.querySelector('[data-icon="keyboard_arrow_right"]')).toBeNull();
  });
});

describe("CardOrderHistoryEmpty", () => {
  it("shows the message and a link that looks like a button", async () => {
    const { container } = render(
      <CardOrderHistoryEmpty action={{ label: "Start shopping", href: "/" }} />,
    );
    expect(screen.getByText(/haven’t placed any orders/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start shopping" })).toHaveAttribute("href", "/");
    expect(container.querySelector('[data-icon="shopping_bag_speed"]')).toHaveAttribute(
      "aria-hidden",
    );
    await expectNoAxeViolations(container);
  });

  it("hides the message when it is empty", () => {
    render(<CardOrderHistoryEmpty message="" action={{ label: "Shop", href: "/" }} />);
    expect(screen.queryByText(/orders/)).toBeNull();
  });
});
