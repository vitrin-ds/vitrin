import { describe, expect, it } from "vitest";
import type { Address } from "@/lib/api/types/customer";
import { formatAddressLines } from "./address";

const ADDRESS: Address = {
  id: "a1",
  label: "Home",
  firstName: "Jane",
  lastName: "Doe",
  line1: "Lindenstraße 12",
  postalCode: "10969",
  city: "Berlin",
  countryCode: "DE",
  phone: "+49 30 1234567",
  isDefaultShipping: true,
  isDefaultBilling: false,
};

describe("formatAddressLines", () => {
  it("skips an empty second line and names the country in the locale", () => {
    expect(formatAddressLines(ADDRESS)).toEqual(["Lindenstraße 12", "10969 Berlin, Germany"]);
    expect(formatAddressLines({ ...ADDRESS, line2: "2nd floor" }, "de")).toEqual([
      "Lindenstraße 12",
      "2nd floor",
      "10969 Berlin, Deutschland",
    ]);
  });
});
