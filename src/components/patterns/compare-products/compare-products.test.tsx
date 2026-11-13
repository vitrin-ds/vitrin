import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CompareBar } from "./compare-bar";
import { COMPARE_ATTRIBUTES, COMPARE_PRODUCTS } from "./compare-products.fixtures";
import { CompareTable } from "./compare-table";
import { attributeDiffers, COMPARE_MAX, toggleCompare } from "./compare-types";

describe("toggleCompare", () => {
  it("adds, removes and refuses past the limit", () => {
    expect(toggleCompare([], "a")).toEqual({ ids: ["a"], status: "added" });
    expect(toggleCompare(["a", "b"], "a")).toEqual({ ids: ["b"], status: "removed" });
    const full = ["a", "b", "c"];
    expect(toggleCompare(full, "d")).toEqual({ ids: full, status: "full" });
    expect(toggleCompare(["a", "b"], "c", COMPARE_MAX.mobile).status).toBe("full");
  });

  it("detects rows that differ", () => {
    expect(attributeDiffers(COMPARE_PRODUCTS, "size")).toBe(true);
    expect(attributeDiffers(COMPARE_PRODUCTS, "vegan")).toBe(false);
  });
});

describe("CompareBar", () => {
  it("shows the selection, named remove buttons and a same-tab Compare link", async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <CompareBar
        products={COMPARE_PRODUCTS.slice(0, 2)}
        onRemove={onRemove}
        onClear={vi.fn()}
        compareHref="/compare?ids=p1,p2"
      />,
    );
    const bar = screen.getByRole("region", { name: "Compare products" });
    expect(within(bar).getByRole("status")).toHaveTextContent("2 of 3 products selected");
    const compare = within(bar).getByRole("link", { name: "Compare" });
    expect(compare).toHaveAttribute("href", "/compare?ids=p1,p2");
    expect(compare).not.toHaveAttribute("target");
    await userEvent.click(
      within(bar).getByRole("button", { name: "Remove Hydra Calm Gel from comparison" }),
    );
    expect(onRemove).toHaveBeenCalledWith("p1");
    await expectNoAxeViolations(container);
  });

  it("needs two products to compare and hides when empty", async () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <CompareBar products={COMPARE_PRODUCTS.slice(0, 1)} onRemove={vi.fn()} onClear={onClear} />,
    );
    expect(screen.getByRole("button", { name: "Compare" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Clear comparison" }));
    expect(onClear).toHaveBeenCalled();
    rerender(<CompareBar products={[]} onRemove={vi.fn()} onClear={onClear} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

describe("CompareTable", () => {
  it("is a real table: products as column headers, attributes as row headers", async () => {
    const { container } = render(
      <CompareTable products={COMPARE_PRODUCTS} attributes={COMPARE_ATTRIBUTES} />,
    );
    const table = screen.getByRole("table", { name: "Product comparison" });
    const columns = within(table).getAllByRole("columnheader");
    expect(columns).toHaveLength(3);
    expect(within(columns[0]).getByRole("link", { name: "Hydra Calm Gel" })).toBeInTheDocument();
    const rows = within(table)
      .getAllByRole("rowheader")
      .map((h) => h.textContent);
    expect(rows).toEqual([
      "Price",
      "Rating",
      "Size",
      "Skin type",
      "Key ingredient",
      "Finish",
      "Vegan",
    ]);
    const priceRow = within(table).getByRole("row", { name: /^Price/ });
    expect(
      within(priceRow)
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["€24", "€29", "€32"]);
    // The scroll container is keyboard reachable.
    expect(screen.getByRole("region", { name: "Product comparison" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    await expectNoAxeViolations(container);
  });

  it("can show only the rows that differ", async () => {
    render(<CompareTable products={COMPARE_PRODUCTS} attributes={COMPARE_ATTRIBUTES} />);
    await userEvent.click(screen.getByRole("switch", { name: "Only show differences" }));
    expect(screen.queryByRole("rowheader", { name: "Vegan" })).not.toBeInTheDocument();
    // Price and rating always stay (Figma Don't: "hide price or rating").
    expect(screen.getByRole("rowheader", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Rating" })).toBeInTheDocument();
  });

  it("removes a product from its column", async () => {
    const onRemove = vi.fn();
    render(
      <CompareTable
        products={COMPARE_PRODUCTS}
        attributes={COMPARE_ATTRIBUTES}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Barrier Repair Cream" }));
    expect(onRemove).toHaveBeenCalledWith("p3");
  });
});
