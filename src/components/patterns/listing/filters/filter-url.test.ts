import { describe, expect, it } from "vitest";
import { formatPriceRange } from "./filter-format";
import { EMPTY_FILTERS } from "./filter-types";
import {
  appliedFilters,
  clearFacet,
  countActiveFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  normalisePrice,
  parseWhole,
  removeAppliedFilter,
  setFlag,
  toggleOption,
} from "./filter-url";
import { FILTER_FACETS, FILTERS_APPLIED } from "./filters.fixtures";

const price = (range: Parameters<typeof formatPriceRange>[0]) =>
  formatPriceRange(range, "EUR", "en");

describe("filtersToSearchParams / filtersFromSearchParams", () => {
  it("writes a stable, crawlable query string in facet order", () => {
    const params = filtersToSearchParams(
      { ...FILTERS_APPLIED, selected: { brand: ["velora", "aurell"], color: ["plum"] } },
      FILTER_FACETS,
    );
    expect(params.toString()).toBe(
      "in_stock=1&brand=aurell%2Cvelora&price_min=25&price_max=50&color=plum",
    );
  });

  it("round-trips the value", () => {
    const params = filtersToSearchParams(FILTERS_APPLIED, FILTER_FACETS);
    expect(filtersFromSearchParams(params, FILTER_FACETS)).toEqual(FILTERS_APPLIED);
  });

  it("keeps unrelated params, drops page and empty facets", () => {
    const base = new URLSearchParams("sort=newest&page=3&brand=aurell&q=serum");
    const params = filtersToSearchParams(EMPTY_FILTERS, FILTER_FACETS, base);
    expect(params.toString()).toBe("sort=newest&q=serum");
    expect(base.get("page")).toBe("3"); // the input is not mutated
  });

  it("ignores unknown facets, options and malformed prices", () => {
    const params = new URLSearchParams(
      "brand=aurell,acme&size=xl&price_min=abc&price_max=-4&in_stock=yes",
    );
    expect(filtersFromSearchParams(params, FILTER_FACETS)).toEqual({
      selected: { brand: ["aurell"] },
      price: { min: null, max: null },
      flags: [],
    });
  });

  it("swaps a reversed price range", () => {
    const params = new URLSearchParams("price_min=80&price_max=20");
    expect(filtersFromSearchParams(params, FILTER_FACETS).price).toEqual({ min: 20, max: 80 });
    expect(normalisePrice({ min: 5, max: null })).toEqual({ min: 5, max: null });
  });
});

describe("value helpers", () => {
  it("parses whole, non-negative numbers only", () => {
    expect(parseWhole("25")).toBe(25);
    expect(parseWhole(" ")).toBeNull();
    expect(parseWhole("2.5")).toBeNull();
    expect(parseWhole("-1")).toBeNull();
  });

  it("toggles options and flags without mutating", () => {
    const added = toggleOption(EMPTY_FILTERS, "brand", "nuve");
    expect(added.selected).toEqual({ brand: ["nuve"] });
    expect(EMPTY_FILTERS.selected).toEqual({});
    expect(toggleOption(added, "brand", "nuve").selected).toEqual({});
    const flagged = setFlag(EMPTY_FILTERS, "in_stock", true);
    expect(flagged.flags).toEqual(["in_stock"]);
    expect(setFlag(flagged, "in_stock", false).flags).toEqual([]);
  });

  it("counts and clears facets", () => {
    expect(countActiveFilters(FILTERS_APPLIED, FILTER_FACETS)).toBe(5);
    const cleared = FILTER_FACETS.reduce(clearFacet, FILTERS_APPLIED);
    expect(cleared).toEqual(EMPTY_FILTERS);
  });

  it("lists applied filters as chips and removes them by id", () => {
    const items = appliedFilters(FILTERS_APPLIED, FILTER_FACETS, (range) => price(range));
    expect(items.map((i) => i.label)).toEqual([
      "Only in stock",
      "Aurell",
      "Velora",
      "€25 – €50",
      "Plum",
    ]);
    const withoutVelora = removeAppliedFilter(FILTERS_APPLIED, FILTER_FACETS, "brand:velora");
    expect(withoutVelora.selected.brand).toEqual(["aurell"]);
    expect(removeAppliedFilter(FILTERS_APPLIED, FILTER_FACETS, "price").price).toEqual({
      min: null,
      max: null,
    });
    expect(removeAppliedFilter(FILTERS_APPLIED, FILTER_FACETS, "nope")).toBe(FILTERS_APPLIED);
  });
});

describe("formatPriceRange", () => {
  it("formats whole amounts with Intl", () => {
    expect(price({ min: 25, max: 50 })).toBe("€25 – €50");
    expect(price({ min: 25, max: null })).toBe("From €25");
    expect(price({ min: null, max: 50 })).toBe("Up to €50");
    expect(price({ min: null, max: null })).toBe("");
    expect(formatPriceRange({ min: 25, max: null }, "EUR", "de")).toMatch(/^From 25\s€$/);
  });
});
