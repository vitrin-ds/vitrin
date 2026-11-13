import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { BOTTOM_NAVIGATION_ITEMS, BottomNavigation } from "./bottom-navigation";

const WITH_CART = BOTTOM_NAVIGATION_ITEMS.map((item) =>
  item.id === "basket" ? { ...item, count: 2 } : item,
);

describe("BottomNavigation", () => {
  it("is a labelled nav with the five Figma tabs as links", async () => {
    const { container } = render(<BottomNavigation activeTab="home" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Home",
      "Categories",
      "Cart",
      "Favourites",
      "Account",
    ]);
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
    await expectNoAxeViolations(container);
  });

  it("marks only the active tab as the current page, with a filled glyph", () => {
    const { container } = render(<BottomNavigation activeTab="categories" />);
    const active = screen.getByRole("link", { name: "Categories" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(active.querySelector('[data-icon="dashboard"]')).toHaveClass("icon-filled");
    expect(
      screen.getByRole("link", { name: "Home" }).querySelector('[data-icon="home"]'),
    ).not.toHaveClass("icon-filled");
  });

  it("shows the cart count as a decorative badge and puts it in the link's name", async () => {
    const { container } = render(<BottomNavigation activeTab="home" items={WITH_CART} />);
    const cart = screen.getByRole("link", { name: "Cart, 2 items" });
    const badge = cart.querySelector('[aria-hidden="true"].rounded-full');
    expect(badge).toHaveTextContent("2");
    await expectNoAxeViolations(container);
  });

  it("hides the badge at zero (Figma Do: only when items are present)", () => {
    render(
      <BottomNavigation
        items={BOTTOM_NAVIGATION_ITEMS.map((i) => (i.id === "basket" ? { ...i, count: 0 } : i))}
      />,
    );
    expect(screen.getByRole("link", { name: "Cart" }).querySelector(".rounded-full")).toBeNull();
  });

  it("caps the count at 99+", () => {
    render(
      <BottomNavigation
        items={BOTTOM_NAVIGATION_ITEMS.map((i) => (i.id === "basket" ? { ...i, count: 120 } : i))}
      />,
    );
    expect(screen.getByRole("link", { name: "Cart, 99+ items" })).toHaveTextContent("99+");
  });

  it("keeps hidden labels as accessible names", () => {
    render(<BottomNavigation showLabels={false} />);
    expect(screen.getByText("Account")).toHaveClass("sr-only");
    expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument();
  });

  it("is fixed to the bottom with shadow-up, mobile/tablet only, with the bottom spacer", () => {
    const { rerender } = render(<BottomNavigation />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed", "bottom-0", "shadow-up", "desktop:hidden", "pb-20");
    rerender(<BottomNavigation bottomSpacer={false} />);
    expect(screen.getByRole("navigation")).not.toHaveClass("pb-20");
  });

  it("grows each tab's hit area to the 56px bar (44px minimum)", () => {
    render(<BottomNavigation />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("w-full", "before:-inset-y-12");
  });

  it("renders a tab without href as a button that calls onSelect", async () => {
    const onSelect = vi.fn();
    const items = BOTTOM_NAVIGATION_ITEMS.map((item) =>
      item.id === "categories" ? { ...item, href: undefined, onSelect } : item,
    );
    const { container } = render(<BottomNavigation items={items} />);
    const tab = screen.getByRole("button", { name: "Categories" });
    expect(tab).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("link", { name: "Categories" })).toBeNull();
    fireEvent.click(tab);
    expect(onSelect).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });
});
