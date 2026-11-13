import type { Address } from "@/lib/api/types/customer";
import type { AddressFormValues } from "./address-validation";

// Figma WD.09.03.01 / .05 Checkout (signed in · change delivery address): Ada Smith's saved
// addresses in London.

export const SAVED_ADDRESSES: readonly Address[] = [
  {
    id: "home",
    label: "Home",
    firstName: "Ada",
    lastName: "Smith",
    line1: "42 Camden Lock Place",
    line2: "Camden Town",
    postalCode: "NW1 8AB",
    city: "London",
    countryCode: "GB",
    phone: "+44 7700 900245",
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: "studio",
    label: "Ada Studio",
    firstName: "Ada",
    lastName: "Smith",
    line1: "Unit 12, Hoxton Works",
    line2: "128 Old Street",
    postalCode: "EC1V 9BD",
    city: "London",
    countryCode: "GB",
    phone: "+44 20 7946 0825",
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
  {
    id: "office",
    label: "Office",
    firstName: "Ada",
    lastName: "Smith",
    line1: "c/o Whitman & Partners",
    line2: "5 Bishopsgate",
    postalCode: "EC2N 4AY",
    city: "London",
    countryCode: "GB",
    phone: "+44 7700 900245",
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
];

export const FILLED_ADDRESS: AddressFormValues = {
  firstName: "Ada",
  lastName: "Smith",
  countryCode: "GB",
  postalCode: "NW1 8AB",
  line1: "42 Camden Lock Place",
  line2: "",
  city: "London",
  phone: "+44 7700 900245",
};

/** A half-filled address with a malformed postcode and phone, for the error states. */
export const INVALID_ADDRESS: Partial<AddressFormValues> = {
  firstName: "Ada",
  countryCode: "GB",
  postalCode: "12345",
  line1: "42 Camden Lock Place",
  phone: "0770",
};
