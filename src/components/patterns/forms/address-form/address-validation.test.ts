import { describe, expect, it } from "vitest";
import {
  ADDRESS_ERROR_MESSAGES,
  EMPTY_ADDRESS,
  isValidPhone,
  isValidPostalCode,
  validateAddress,
  validateAddressField,
  type AddressFormValues,
} from "./address-validation";

const VALID: AddressFormValues = {
  firstName: "Ada",
  lastName: "Smith",
  countryCode: "GB",
  postalCode: "NW1 8AB",
  line1: "42 Camden Lock Place",
  line2: "",
  city: "London",
  phone: "+44 7700 900245",
};

describe("isValidPostalCode", () => {
  it("checks the country's postcode shape", () => {
    expect(isValidPostalCode("NW1 8AB", "GB")).toBe(true);
    expect(isValidPostalCode("nw18ab", "GB")).toBe(true);
    expect(isValidPostalCode("EC1A 1AA", "GB")).toBe(true);
    expect(isValidPostalCode("12345", "GB")).toBe(false);
    expect(isValidPostalCode("10969", "DE")).toBe(true);
    expect(isValidPostalCode("1096", "DE")).toBe(false);
    expect(isValidPostalCode("1016 DV", "NL")).toBe(true);
    expect(isValidPostalCode(" 1016dv ", "NL")).toBe(true);
  });

  it("falls back to a generic shape for other countries", () => {
    expect(isValidPostalCode("SW-1234", "PL")).toBe(true);
    expect(isValidPostalCode("!", "PL")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts one field with separators and 7–15 digits", () => {
    expect(isValidPhone("+44 7700 900245")).toBe(true);
    expect(isValidPhone("(030) 123-4567")).toBe(true);
    expect(isValidPhone("123456")).toBe(false);
    expect(isValidPhone("+1234567890123456")).toBe(false);
    expect(isValidPhone("call me")).toBe(false);
  });
});

describe("validateAddress", () => {
  it("returns no errors for a complete address", () => {
    expect(validateAddress(VALID)).toEqual({});
  });

  it("flags every required field, not the optional second line", () => {
    const errors = validateAddress(EMPTY_ADDRESS);
    expect(Object.keys(errors)).toEqual([
      "firstName",
      "lastName",
      "countryCode",
      "postalCode",
      "line1",
      "city",
      "phone",
    ]);
    expect(errors.line2).toBeUndefined();
  });

  it("treats whitespace as empty", () => {
    expect(validateAddressField("city", { ...VALID, city: "   " })).toBe(
      ADDRESS_ERROR_MESSAGES.cityRequired,
    );
  });

  it("explains a malformed postcode with the country's example", () => {
    expect(validateAddressField("postalCode", { ...VALID, postalCode: "ABC" })).toBe(
      "Enter a real postcode, like NW1 8AB",
    );
    expect(
      validateAddressField("postalCode", { ...VALID, countryCode: "PL", postalCode: "!" }),
    ).toBe("Enter a real postcode");
  });

  it("limits length and uses the caller's messages", () => {
    const long = "x".repeat(71);
    expect(validateAddressField("line2", { ...VALID, line2: long })).toBe(
      "Use 70 characters or fewer",
    );
    expect(
      validateAddressField(
        "firstName",
        { ...VALID, firstName: "" },
        { ...ADDRESS_ERROR_MESSAGES, firstNameRequired: "Vorname eingeben" },
      ),
    ).toBe("Vorname eingeben");
  });
});
