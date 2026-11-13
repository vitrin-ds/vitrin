import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a type style and a text colour together", () => {
    expect(cn("text-title-md", "text-text-primary")).toBe("text-title-md text-text-primary");
  });

  it("lets a later type style replace an earlier one", () => {
    expect(cn("text-body-md", "text-body-sm")).toBe("text-body-sm");
  });

  it("lets a later colour replace an earlier one", () => {
    expect(cn("text-text-primary", "text-text-secondary")).toBe("text-text-secondary");
  });

  it("merges the numeric radius and custom shadow scales", () => {
    expect(cn("rounded-4 shadow-sm", "rounded-8 shadow-base")).toBe("rounded-8 shadow-base");
  });

  it("merges radius roles with the numeric scale, on every side", () => {
    expect(cn("rounded-card", "rounded-0")).toBe("rounded-0");
    expect(cn("rounded-8", "rounded-control")).toBe("rounded-control");
    expect(cn("rounded-t-card", "rounded-t-0")).toBe("rounded-t-0");
  });

  it("drops falsy values", () => {
    expect(cn("p-16", false, undefined, null, "gap-8")).toBe("p-16 gap-8");
  });
});
