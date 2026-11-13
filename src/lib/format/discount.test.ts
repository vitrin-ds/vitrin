import { describe, expect, it } from "vitest";
import { formatDiscount } from "./discount";

describe("formatDiscount", () => {
  it("formats the discount with Intl", () => {
    expect(formatDiscount(20)).toBe("20%");
    expect(formatDiscount(20, "tr")).toBe("%20");
  });
});
