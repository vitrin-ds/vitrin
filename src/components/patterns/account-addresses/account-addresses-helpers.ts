import type { IconName } from "@/components/ui/icon/icon-names";
import type { Address } from "@/lib/api/types/customer";
import { countryName } from "@/lib/format/address";
import { ACCOUNT_ADDRESSES_LABELS, type AccountAddressesLabels } from "./account-addresses-labels";

// Pure helpers of the account-addresses block: an address's title and its Card.Address props.
// Unit-tested through the site's account-view tests.

export const ACCOUNT_ADDRESSES_LOCALE = "en-GB";

/** An address's title on its card; unnamed ones fall back to `fallback`. */
export function addressTitle(address: Address, fallback: string): string {
  return address.label.trim() || fallback;
}

type CardLabels = Pick<AccountAddressesLabels, "labelFallback" | "vat" | "personalInvoice">;

/** Card.Address props for an address (Figma 03.02). */
export function addressCardProps(
  address: Address,
  locale: string = ACCOUNT_ADDRESSES_LOCALE,
  labels: CardLabels = ACCOUNT_ADDRESSES_LABELS,
) {
  const invoice = address.invoice;
  const lines = [
    address.line1,
    [address.line2, [address.city, address.postalCode].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    countryName(address.countryCode, locale),
  ];
  return {
    title: addressTitle(address, labels.labelFallback),
    // A workplace, by what the customer calls it or by invoicing a company.
    icon: (invoice?.company || /office|work|studio/i.test(address.label)
      ? "business_center"
      : "home") as IconName,
    roles: {
      defaultShipping: address.isDefaultShipping,
      defaultBilling: address.isDefaultBilling,
      business: Boolean(invoice?.company),
    },
    name: invoice?.company ?? `${address.firstName} ${address.lastName}`,
    lines,
    phone: address.phone,
    invoice:
      invoice &&
      (invoice.company
        ? {
            name: invoice.company,
            vatNumber: invoice.vatNumber && labels.vat(invoice.vatNumber),
          }
        : { name: labels.personalInvoice(invoice.recipient) }),
  };
}
