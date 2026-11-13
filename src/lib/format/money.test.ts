import { describe, expect, it } from "vitest";
import { discountPercent, formatMoney } from "./money";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });

describe("formatMoney", () => {
  it("formats minor units per locale", () => {
    expect(formatMoney(eur(7000))).toBe("€70");
    expect(formatMoney(eur(2850))).toBe("€28.50");
    expect(formatMoney(eur(1999), "de")).toBe("19,99\u00a0€");
    expect(formatMoney(eur(5), "en")).toBe("€0.05");
  });
});

describe("discountPercent", () => {
  it("rounds the saving and ignores missing or higher prices", () => {
    expect(discountPercent(eur(5600), eur(7000))).toBe(20);
    expect(discountPercent(eur(6999), eur(9999))).toBe(30);
    expect(discountPercent(eur(7000), undefined)).toBe(0);
    expect(discountPercent(eur(7000), eur(6000))).toBe(0);
  });
});
