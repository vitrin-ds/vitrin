import { describe, expect, it } from "vitest";
import {
  cardDigits,
  cardNetwork,
  cardNumberValid,
  cvcValid,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  parseExpiry,
} from "./card";

describe("card checks", () => {
  it("drops spaces and dashes", () => {
    expect(cardDigits("4242 4242-4242 4242")).toBe("4242424242424242");
  });

  it("runs the Luhn checksum", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4000000000000002")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("42a2")).toBe(false);
  });

  it("reads the network from the prefix", () => {
    expect(cardNetwork("4242424242424242")).toBe("visa");
    expect(cardNetwork("5555555555554444")).toBe("mastercard");
    expect(cardNetwork("2221000000000009")).toBe("mastercard");
    expect(cardNetwork("378282246310005")).toBe("amex");
    expect(cardNetwork("3530111333300000")).toBe("jcb");
    expect(cardNetwork("6011111111111117")).toBeNull();
  });

  it("accepts a number only with an accepted network, its length and the checksum", () => {
    expect(cardNumberValid("4242 4242 4242 4242")).toBe(true);
    expect(cardNumberValid("378282246310005")).toBe(true);
    expect(cardNumberValid("4242 4242 4242")).toBe(false);
    expect(cardNumberValid("6011111111111117")).toBe(false);
    expect(cardNumberValid("4242424242424241")).toBe(false);
  });

  it("groups the digits as printed", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
    expect(formatCardNumber("42a4")).toBe("424");
  });

  it("parses and formats MM / YY", () => {
    expect(parseExpiry("08 / 28")).toEqual({ month: 8, year: 2028 });
    expect(parseExpiry("0828")).toEqual({ month: 8, year: 2028 });
    expect(parseExpiry("13/28")).toBeNull();
    expect(parseExpiry("8")).toBeNull();
    expect(formatExpiry("0828")).toBe("08 / 28");
    expect(formatExpiry("08")).toBe("08");
  });

  it("treats a card as valid to the end of its expiry month", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    expect(expiryValid(10, 2026, now)).toBe(true);
    expect(expiryValid(9, 2026, now)).toBe(false);
    expect(expiryValid(1, 2030, now)).toBe(true);
    expect(expiryValid(0, 2030, now)).toBe(false);
  });

  it("asks Amex for four CVC digits and other networks for three", () => {
    expect(cvcValid("123", "visa")).toBe(true);
    expect(cvcValid("1234", "visa")).toBe(false);
    expect(cvcValid("1234", "amex")).toBe(true);
    expect(cvcValid("12a", "mastercard")).toBe(false);
  });
});
