import { describe, expect, it } from "vitest";
import { shipped, toDarkSelector, toDefaultScale } from "../../../scripts/build-registry.mjs";

describe("toDefaultScale", () => {
  it("divides spacing classes by four, with variants and negatives", () => {
    expect(toDefaultScale("p-16 gap-8 tablet:px-20 -mt-8 h-18 min-h-144")).toBe(
      "p-4 gap-2 tablet:px-5 -mt-2 h-4.5 min-h-36",
    );
  });

  it("leaves everything that is not a spacing number alone", () => {
    const untouched = "w-full top-1/2 left-(--pin-x) rounded-8 text-body-md icon-16 border-2 z-10";
    expect(toDefaultScale(untouched)).toBe(untouched);
  });

  it("moves our shadows and blurs to their own names", () => {
    expect(toDefaultScale("shadow-md backdrop-blur-base shadow-up")).toBe(
      "shadow-vitrin-md backdrop-blur-vitrin-base shadow-vitrin-up",
    );
  });
});

describe("shipped", () => {
  it("uses the product's name, not the project's", () => {
    expect(shipped("bg-(--th-surface-primary) animate-[th-fade-in_1s] /* TH-001 */")).toBe(
      "bg-(--vitrin-surface-primary) animate-[vitrin-fade-in_1s] /* Vitrin */",
    );
  });

  it("leaves words that only contain th alone", () => {
    expect(shipped("width-th path-thing method-th")).toBe("width-th path-thing method-th");
  });
});

describe("shipped imports", () => {
  it("points imports between blocks at components/patterns, where they are installed", () => {
    expect(
      shipped(
        'import { AddressForm } from "@/components/patterns/forms/address-form/address-form";',
      ),
    ).toBe('import { AddressForm } from "@/components/patterns/forms/address-form/address-form";');
  });
});

describe("toDarkSelector", () => {
  it("follows both our attribute and the common .dark class", () => {
    expect(toDarkSelector('[data-theme="dark"] {\n  --a: 1;\n}')).toBe(
      '[data-theme="dark"], .dark {\n  --a: 1;\n}',
    );
  });
});
