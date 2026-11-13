import { render, screen, within } from "@testing-library/react";
import NextLink from "next/link";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ProductCarousel } from "./product-carousel";

describe("ProductCarousel", () => {
  it("is a region named by its heading, holding one list item per card", async () => {
    const { container } = render(
      <ProductCarousel
        title="New Arrivals"
        description="Fresh drops."
        action={{ label: "View All", href: "/new" }}
      >
        <NextLink key="a" href="/p/a">
          Card A
        </NextLink>
        <NextLink key="b" href="/p/b">
          Card B
        </NextLink>
        {null}
      </ProductCarousel>,
    );
    const region = screen.getByRole("region", { name: "New Arrivals" });
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole("link")).toHaveAccessibleName("Card A");
    expect(within(region).getByRole("list")).toHaveClass("snap-x", "overflow-x-auto");
    await expectNoAxeViolations(container);
  });

  it("shows no pagination while nothing overflows (server HTML, jsdom has no layout)", () => {
    render(
      <ProductCarousel title="Edit">
        <span>One</span>
      </ProductCarousel>,
    );
    expect(screen.queryByRole("button", { name: "Scroll forward" })).toBeNull();
  });

  it("passes the header size through (Medium in the Intermediary's narrower column)", () => {
    render(
      <ProductCarousel title="Best Sellers In Make Up" headerSize="md">
        <span>One</span>
      </ProductCarousel>,
    );
    expect(screen.getByRole("heading", { name: "Best Sellers In Make Up" })).toHaveClass(
      "text-headline-sm",
    );
  });

  it("renders nothing without cards", () => {
    const { container } = render(<ProductCarousel title="Empty">{[]}</ProductCarousel>);
    expect(container).toBeEmptyDOMElement();
  });
});
