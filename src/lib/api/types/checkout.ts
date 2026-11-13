import type { CommunicationPreferences, LanguageRegion } from "./account";
import type { Money } from "./catalog";
import type { Address, PaymentMethod } from "./customer";
import type { Order } from "./orders";

export type CustomerGender = "female" | "male" | "non-binary";

/** The signed-in shopper (module 03), with the saved addresses and payment methods. */
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyPoints: number;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  // My Account (03) profile and settings; optional, so accounts stored before them still load.
  /** Personal Information, e.g. "+44 7700 900245". */
  phone?: string;
  /** Personal Information: ISO date, YYYY-MM-DD. */
  birthDate?: string;
  /** Edit Account; missing means "Prefer not to say". */
  gender?: CustomerGender;
  /** The account's photo, when it has one. */
  avatar?: string;
  /** ISO date the account was opened. */
  memberSince?: string;
  /** Communication Preferences; missing means the defaults (mock/account.ts). */
  communication?: CommunicationPreferences;
  /** Language & Region; missing means the store defaults. */
  languageRegion?: LanguageRegion;
}

/** What registration asks for (Figma 02.01): the account starts with no addresses or cards. */
export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** A delivery option at checkout, priced for the current cart. */
export interface ShippingMethod {
  id: string;
  /** "Standard", "Next day". */
  name: string;
  /** 0 once the cart passes the free-shipping threshold (standard only). */
  price: Money;
  /** "2–4 working days", "Order before 2pm". */
  description: string;
}

/** A postal address typed at checkout (no id or default flags yet). */
export type AddressInput = Omit<
  Address,
  "id" | "label" | "isDefaultShipping" | "isDefaultBilling" | "deliveryInstructions" | "invoice"
>;

/**
 * How the shopper pays. `card` carries the number once, to the payment call only: the mock (like a
 * gateway) keeps its network and last four digits and drops the rest; it is never stored.
 */
export type PaymentInput =
  | { type: "saved"; paymentMethodId: string }
  | {
      type: "card";
      number: string;
      holderName: string;
      /** 1–12. */
      expiryMonth: number;
      /** Four digits. */
      expiryYear: number;
      cvc: string;
    };

export interface PlaceOrderInput {
  email: string;
  shippingAddress: AddressInput;
  /** Defaults to the shipping address. */
  billingAddress?: AddressInput;
  shippingMethodId: string;
  payment: PaymentInput;
}

/** placeOrder: the order, or a bank challenge (3D Secure) to pass first. */
export type PlaceOrderOutcome =
  | { status: "placed"; order: Order }
  | { status: "requires-action"; paymentId: string; amount: Money };
