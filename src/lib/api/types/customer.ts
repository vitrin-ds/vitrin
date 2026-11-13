export interface Address {
  id: string;
  /** "Home", "Office" … */
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  region?: string;
  /** ISO 3166-1 alpha-2. */
  countryCode: string;
  phone: string;
  /** Figma 03.02 `Delivery instructions`. */
  deliveryInstructions?: string;
  /** Figma 03.02 "Also use this address for invoicing": absent when it isn't used for that. */
  invoice?: AddressInvoice;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

/** What an invoice to this address says. A company makes it a business address. */
export interface AddressInvoice {
  recipient: string;
  company?: string;
  vatNumber?: string;
}

export type CardNetwork = "visa" | "mastercard" | "amex" | "jcb";

/** Saved cards carry the last four digits only, never the full number. */
export type PaymentMethod =
  | {
      id: string;
      type: "card";
      network: CardNetwork;
      last4: string;
      holderName: string;
      /** 1–12. */
      expiryMonth: number;
      /** Four digits. */
      expiryYear: number;
      /** Figma 03.03 `Card nickname`: "Personal Visa", "Work Card". */
      nickname?: string;
      /** The saved address the card bills to. */
      billingAddressId?: string;
      isDefault: boolean;
    }
  | {
      id: string;
      type: "paypal" | "apple-pay" | "google-pay" | "klarna";
      /** Account hint shown on the card, e.g. a masked e-mail. */
      label?: string;
      isDefault: boolean;
    };
