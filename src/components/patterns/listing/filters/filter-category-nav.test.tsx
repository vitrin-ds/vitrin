import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { currentCategoryLabel, FilterCategoryNav, holdsCurrent } from "./filter-category-nav";
import { FilterSheet } from "./filter-sheet";
import { FilterSidebar } from "./filter-sidebar";
import { EMPTY_FILTERS } from "./filter-types";
import { FILTER_CATEGORIES, FILTER_FACETS } from "./filters.fixtures";

/** The fixture facets without their Categories checkbox facet (the links replace it). */
const FACETS = FILTER_FACETS.filter((facet) => facet.id !== "category");

describe("FilterCategoryNav", () => {
  it("links every category with its count and marks the current one", async () => {
    const { container } = render(<FilterCategoryNav items={FILTER_CATEGORIES} />);
    const nav = screen.getByRole("navigation", { name: "Categories" });
    expect(within(nav).getByRole("link", { name: "Lip Makeup (2,300)" })).toHaveAttribute(
      "href",
      "/c/make-up/lip-makeup",
    );
    const current = within(nav).getByRole("link", { name: "Liquid Lipstick (840)" });
    expect(current).toHaveAttribute("aria-current", "page");
    await expectNoAxeViolations(container);
  });

  it("opens the branch holding the current category and toggles the others", async () => {
    render(<FilterCategoryNav items={FILTER_CATEGORIES} />);
    const lips = screen.getByRole("button", { name: "Lip Makeup subcategories" });
    const eyes = screen.getByRole("button", { name: "Eye Makeup subcategories" });
    expect(lips).toHaveAttribute("aria-expanded", "true");
    expect(eyes).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /Mascara/ })).not.toBeInTheDocument();

    await userEvent.click(eyes);
    expect(eyes).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Mascara (920)" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Face Makeup subcategories" })).toBeNull();
  });

  it("finds the current item", () => {
    expect(currentCategoryLabel(FILTER_CATEGORIES)).toBe("Liquid Lipstick");
    expect(holdsCurrent(FILTER_CATEGORIES[0]!)).toBe(true);
    expect(holdsCurrent(FILTER_CATEGORIES[1]!)).toBe(false);
  });
});

describe("Categories in the filter panel", () => {
  it("adds a Categories section to the sidebar", () => {
    render(
      <FilterSidebar
        facets={FACETS}
        value={EMPTY_FILTERS}
        onChange={vi.fn()}
        categories={{ items: FILTER_CATEGORIES }}
      />,
    );
    expect(screen.getByRole("button", { name: "Categories" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Categories" })).toBeInTheDocument();
  });

  it("adds a Categories row to the sheet that opens the links", async () => {
    render(
      <FilterSheet
        open
        onClose={vi.fn()}
        facets={FACETS}
        value={EMPTY_FILTERS}
        onApply={vi.fn()}
        resultCount={10}
        categories={{ items: FILTER_CATEGORIES }}
      />,
    );
    const row = screen.getByRole("button", { name: /^Categories/ });
    expect(row).toHaveTextContent("Liquid Lipstick");
    await userEvent.click(row);
    expect(screen.getByRole("dialog", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lip Makeup (2,300)" })).toHaveFocus();
  });
});
