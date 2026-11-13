import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { keyToMove, moveIndex } from "./list-navigation";
import { isTypeaheadKey, useTypeahead } from "./use-typeahead";

const items = [
  { label: "Apple" },
  { label: "Banana", disabled: true },
  { label: "Blueberry" },
  { label: "Cherry" },
  { label: "Blackcurrant" },
];

describe("moveIndex", () => {
  it("skips disabled items and stops at the ends", () => {
    expect(moveIndex(items, 0, "next")).toBe(2);
    expect(moveIndex(items, 2, "previous")).toBe(0);
    expect(moveIndex(items, 4, "next")).toBe(4);
    expect(moveIndex(items, 0, "previous")).toBe(0);
  });

  it("goes to the first and last enabled item", () => {
    const edge = [{ disabled: true }, { label: "a" }, { label: "b" }, { disabled: true }];
    expect(moveIndex(edge, 2, "first")).toBe(1);
    expect(moveIndex(edge, 1, "last")).toBe(2);
  });

  it("starts from nothing selected (-1)", () => {
    expect(moveIndex(items, -1, "next")).toBe(0);
  });

  it("maps the APG keys", () => {
    expect(keyToMove("ArrowDown")).toBe("next");
    expect(keyToMove("ArrowUp")).toBe("previous");
    expect(keyToMove("Home")).toBe("first");
    expect(keyToMove("PageDown")).toBe("last");
    expect(keyToMove("Enter")).toBeNull();
  });
});

describe("useTypeahead", () => {
  const label = (item: { label?: string }) => item.label ?? "";

  it("finds the next enabled match and cycles on a repeated letter", () => {
    const { result } = renderHook(() => useTypeahead(items, label));
    const search = result.current;
    expect(search("b", 0)).toBe(2); // Banana is disabled
    expect(search("b", 2)).toBe(4); // "bb": next item starting with b
  });

  it("matches a growing prefix", () => {
    const { result } = renderHook(() => useTypeahead(items, label));
    expect(result.current("c", -1)).toBe(3);
    expect(result.current("h", 3)).toBe(3);
  });

  it("returns null without a match", () => {
    const { result } = renderHook(() => useTypeahead(items, label));
    expect(result.current("z", 0)).toBeNull();
  });

  it("accepts single printable keys only", () => {
    const plain = { ctrlKey: false, metaKey: false, altKey: false };
    expect(isTypeaheadKey({ key: "a", ...plain })).toBe(true);
    expect(isTypeaheadKey({ key: " ", ...plain })).toBe(false);
    expect(isTypeaheadKey({ key: "ArrowDown", ...plain })).toBe(false);
    expect(isTypeaheadKey({ key: "a", ...plain, metaKey: true })).toBe(false);
  });
});
