import type { Money } from "./catalog";
import type { CustomerGender } from "./checkout";
import type { Address } from "./customer";

export type CommunicationChannel = "email" | "sms" | "push";
export type CommunicationTopic =
  "shipping" | "returns" | "reviews" | "offers" | "new-arrivals" | "recommendations" | "newsletter";

/** Marketing consent per channel and topic. Order and account e-mails are always sent. */
export interface CommunicationPreferences {
  channels: Record<CommunicationChannel, boolean>;
  topics: Record<CommunicationTopic, boolean>;
}

/**
 * The shopper's language, country and display currency. Stored only: storefront i18n and
 * multi-currency prices are not built yet (the mock always prices in EUR).
 */
export interface LanguageRegion {
  /** BCP 47, e.g. "en-GB". */
  language: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
  /** ISO 4217. */
  currency: string;
  /** "DD/MM/YYYY", "MM/DD/YYYY" or "YYYY-MM-DD". */
  dateFormat?: string;
  /** "metric" or "imperial". */
  units?: string;
}

/** Personal Information form: what updateProfile takes. */
export interface ProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  /** "" clears it. */
  phone?: string;
  /** ISO date, YYYY-MM-DD; "" clears it. */
  birthDate?: string;
  /** "" clears it. */
  gender?: CustomerGender | "";
}

/** An address-book entry to save (addAddress / updateAddress). */
export type AddressBookInput = Omit<Address, "id" | "isDefaultShipping" | "isDefaultBilling"> & {
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

/** A card to save. The number is read once (network + last four kept), never stored. */
export interface NewCardInput {
  number: string;
  holderName: string;
  /** 1–12. */
  expiryMonth: number;
  /** Four digits. */
  expiryYear: number;
  nickname?: string;
  billingAddressId?: string;
  makeDefault?: boolean;
}

/** Update expiry & CVV (03.03): everything but the number, which a saved card no longer has. */
export type CardUpdateInput = Omit<NewCardInput, "number">;

/** One reward in the wallet (Figma `Card.Rewards`). */
/** What a reward can and can't be used for (Figma 03.04 Terms & restrictions). */
export interface RewardTerms {
  /** `icon`: a Material Symbols name. */
  lines: { icon: string; title: string; body: string }[];
  note: string;
}

export type Reward =
  | {
      id: string;
      kind: "gift-card";
      /** "Birthday from Mum". */
      title: string;
      last4: string;
      /** The full code, to copy. */
      code?: string;
      /** A credit from the shop, not a bought card. */
      promotional?: boolean;
      /** ISO 8601; missing: no expiry. */
      expiresAt?: string;
      /** ISO 8601: when the balance ran out. */
      usedAt?: string;
      terms?: RewardTerms;
      balance: Money;
      /** The amount it was issued for. */
      initial: Money;
      /** The gift card used first at checkout. */
      isDefault?: boolean;
    }
  | {
      id: string;
      kind: "coupon";
      /** The promo code, e.g. "SUMMER25". */
      code: string;
      /** Exactly one of amountOff / percentOff. */
      amountOff?: Money;
      percentOff?: number;
      minSpend?: Money;
      /** "clothing" …; missing means the whole order. */
      scope?: string;
      singleUse?: boolean;
      /** ISO 8601. */
      expiresAt?: string;
      /** ISO 8601. */
      usedAt?: string;
      description?: string;
      /** What the value applies to, e.g. "on one item". */
      appliesTo?: string;
      /** Conditions beyond the minimum spend and single use, e.g. "First-time only". */
      conditions?: string[];
      terms?: RewardTerms;
    };

/** A gift card code that checks out, before it joins the wallet (03.04 Card Found). */
export interface GiftCardCheck {
  code: string;
  last4: string;
  balance: Money;
  /** ISO 8601. */
  issuedAt: string;
  /** ISO 8601. */
  expiresAt: string;
}

export interface LoyaltyTier {
  id: "member" | "silver" | "gold";
  name: string;
  /** Points needed to reach it. */
  minPoints: number;
}

/** A line of the points history: earned (positive) or redeemed (negative). */
export interface PointsEvent {
  id: string;
  title: string;
  points: number;
  /** ISO 8601. */
  occurredAt: string;
}

export interface RewardsSummary {
  points: number;
  tier: LoyaltyTier;
  /** Null at the top tier. */
  nextTier: LoyaltyTier | null;
  rewards: Reward[];
  /** Newest first. */
  history: PointsEvent[];
}
