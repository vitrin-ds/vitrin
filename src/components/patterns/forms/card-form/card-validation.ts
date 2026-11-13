import {
  cardDigits,
  cardNetwork,
  cardNumberValid,
  cvcValid,
  expiryValid,
  parseExpiry,
} from "@/lib/payment/card";

// Card Form validation (client-side, before the payment call): Luhn and network for the number,
// MM / YY in the future for the expiry, 3 digits (4 for Amex) for the security code, a name.

export const CARD_FIELDS = ["number", "expiry", "cvc", "holderName"] as const;
export type CardField = (typeof CARD_FIELDS)[number];

export interface CardFormValues {
  number: string;
  /** As typed: "08 / 28". */
  expiry: string;
  cvc: string;
  holderName: string;
}

export type CardErrors = Partial<Record<CardField, string>>;

export interface CardErrorMessages {
  numberRequired: string;
  numberInvalid: string;
  expiryRequired: string;
  expiryInvalid: string;
  expiryPast: string;
  cvcRequired: string;
  cvcInvalid: (digits: number) => string;
  holderNameRequired: string;
}

export const CARD_ERROR_MESSAGES: CardErrorMessages = {
  numberRequired: "Enter your card number.",
  numberInvalid: "Enter a valid Visa, Mastercard, Amex or JCB card number.",
  expiryRequired: "Enter the expiry date.",
  expiryInvalid: "Enter the expiry date as MM / YY.",
  expiryPast: "This card has expired. Use another card.",
  cvcRequired: "Enter the security code.",
  cvcInvalid: (digits) => `Enter the ${digits}-digit security code.`,
  holderNameRequired: "Enter the name as shown on your card.",
};

export const EMPTY_CARD: CardFormValues = { number: "", expiry: "", cvc: "", holderName: "" };

export function validateCardField(
  field: CardField,
  values: CardFormValues,
  messages: CardErrorMessages = CARD_ERROR_MESSAGES,
  now: Date = new Date(),
): string | undefined {
  switch (field) {
    case "number": {
      if (!cardDigits(values.number)) return messages.numberRequired;
      return cardNumberValid(values.number) ? undefined : messages.numberInvalid;
    }
    case "expiry": {
      if (!values.expiry.trim()) return messages.expiryRequired;
      const expiry = parseExpiry(values.expiry);
      if (!expiry) return messages.expiryInvalid;
      return expiryValid(expiry.month, expiry.year, now) ? undefined : messages.expiryPast;
    }
    case "cvc": {
      if (!values.cvc.trim()) return messages.cvcRequired;
      const network = cardNetwork(cardDigits(values.number));
      return cvcValid(values.cvc.trim(), network)
        ? undefined
        : messages.cvcInvalid(network === "amex" ? 4 : 3);
    }
    case "holderName":
      return values.holderName.trim() ? undefined : messages.holderNameRequired;
  }
}

export function validateCard(
  values: CardFormValues,
  messages: CardErrorMessages = CARD_ERROR_MESSAGES,
  now: Date = new Date(),
): CardErrors {
  const errors: CardErrors = {};
  for (const field of CARD_FIELDS) {
    const error = validateCardField(field, values, messages, now);
    if (error) errors[field] = error;
  }
  return errors;
}
