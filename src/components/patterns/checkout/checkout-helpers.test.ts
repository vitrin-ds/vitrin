import { describe, expect, it } from "vitest";
import type { Customer } from "@/lib/api/types/checkout";
import type { PaymentMethod } from "@/lib/api/types/customer";
import {
  defaultAddress,
  defaultPaymentMethod,
  emailError,
  expiresSoon,
  expiryText,
  isExpired,
  paymentTitle,
  toAddressInput,
} from "./checkout-helpers";

const NOW = new Date("2026-10-31T12:00:00Z");

const card = (id: string, month: number, year: number, isDefault = false): PaymentMethod => ({
  id,
  type: "card",
  network: "visa",
  last4: "4242",
  holderName: "Ada Smith",
  expiryMonth: month,
  expiryYear: year,
  isDefault,
});

const customer = (paymentMethods: PaymentMethod[]): Customer => ({
  id: "u",
  firstName: "Ada",
  lastName: "Smith",
  email: "ada@example.com",
  loyaltyPoints: 0,
  addresses: [
    {
      id: "a1",
      label: "Office",
      firstName: "Ada",
      lastName: "Smith",
      line1: "1 Road",
      postalCode: "N1",
      city: "London",
      countryCode: "GB",
      phone: "+44 1",
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
    {
      id: "a2",
      label: "Home",
      firstName: "Ada",
      lastName: "Smith",
      line1: "2 Road",
      line2: "",
      postalCode: "N2",
      city: "London",
      countryCode: "GB",
      phone: "+44 2",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  ],
  paymentMethods,
});

describe("checkout view helpers", () => {
  it("checks the e-mail", () => {
    expect(emailError("")).toBe("Enter your e-mail address.");
    expect(emailError("ada@")).toMatch(/valid e-mail/);
    expect(emailError(" ada@example.com ")).toBeUndefined();
  });

  it("maps an address to the API input without ids, labels or empty line 2", () => {
    const home = defaultAddress(customer([]));
    expect(home?.id).toBe("a2");
    expect(home && toAddressInput(home)).toEqual({
      firstName: "Ada",
      lastName: "Smith",
      line1: "2 Road",
      postalCode: "N2",
      city: "London",
      countryCode: "GB",
      phone: "+44 2",
    });
  });

  it("dates saved cards and picks a usable default", () => {
    const expired = card("old", 9, 2026, true);
    const soon = card("soon", 11, 2026);
    const later = card("later", 1, 2030);
    expect(isExpired(expired, NOW)).toBe(true);
    expect(isExpired(soon, NOW)).toBe(false);
    expect(expiresSoon(soon, NOW)).toBe(true);
    expect(expiresSoon(later, NOW)).toBe(false);
    expect(defaultPaymentMethod(customer([expired, soon, later]), NOW)?.id).toBe("soon");
    expect(expiryText(later as Extract<PaymentMethod, { type: "card" }>)).toBe("01/30");
  });

  it("names saved methods", () => {
    expect(paymentTitle(card("v", 1, 2030))).toBe("Visa ending in 4242");
    expect(paymentTitle({ id: "p", type: "paypal", isDefault: false })).toBe("PayPal");
  });
});
