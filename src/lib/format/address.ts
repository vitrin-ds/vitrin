import type { Address } from "@/lib/api/types/customer";

// Address lines for display: street, optional second line, then postcode + city and the country
// name in the reader's language (Intl.DisplayNames). Postcode-before-city fits the EU mocks.

export function countryName(countryCode: string, locale = "en"): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(countryCode) ?? countryCode;
}

/** ["Lindenstraße 12", "2nd floor", "10969 Berlin, Germany"] */
export function formatAddressLines(address: Address, locale = "en"): string[] {
  const city = [address.postalCode, address.city].filter(Boolean).join(" ");
  const country = countryName(address.countryCode, locale);
  return [address.line1, address.line2, `${city}, ${country}`].filter((line): line is string =>
    Boolean(line),
  );
}
