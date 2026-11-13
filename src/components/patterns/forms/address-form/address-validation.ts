// Pure client-side checks for the Address Form. They catch typos before the order is placed;
// the server stays the authority. Messages come from the caller (i18n), keyed by the rule.

export const ADDRESS_FIELDS = [
  "firstName",
  "lastName",
  "countryCode",
  "postalCode",
  "line1",
  "line2",
  "city",
  "phone",
] as const;

export type AddressField = (typeof ADDRESS_FIELDS)[number];

export interface AddressFormValues {
  firstName: string;
  lastName: string;
  /** ISO 3166-1 alpha-2; "" until chosen. */
  countryCode: string;
  postalCode: string;
  line1: string;
  line2: string;
  city: string;
  phone: string;
}

export type AddressErrors = Partial<Record<AddressField, string>>;

export interface AddressErrorMessages {
  firstNameRequired: string;
  lastNameRequired: string;
  countryRequired: string;
  postalCodeRequired: string;
  /** e.g. "Enter a real postcode, like NW1 8AB". The example is per country. */
  postalCodeInvalid: (example: string | undefined) => string;
  line1Required: string;
  cityRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  tooLong: (max: number) => string;
}

export const ADDRESS_ERROR_MESSAGES: AddressErrorMessages = {
  firstNameRequired: "Enter your first name",
  lastNameRequired: "Enter your last name",
  countryRequired: "Select a country",
  postalCodeRequired: "Enter a postcode",
  postalCodeInvalid: (example) =>
    example ? `Enter a real postcode, like ${example}` : "Enter a real postcode",
  line1Required: "Enter the first line of the address",
  cityRequired: "Enter a town or city",
  phoneRequired: "Enter a phone number",
  phoneInvalid: "Enter a phone number with 7 to 15 digits, like +44 7700 900245",
  tooLong: (max) => `Use ${max} characters or fewer`,
};

export const EMPTY_ADDRESS: AddressFormValues = {
  firstName: "",
  lastName: "",
  countryCode: "",
  postalCode: "",
  line1: "",
  line2: "",
  city: "",
  phone: "",
};

const MAX_LENGTH = 70;

/** Postcode shapes for the countries we ship to; others only get the generic check. */
const POSTCODE_RULES: Record<string, { pattern: RegExp; example: string }> = {
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, example: "NW1 8AB" },
  IE: { pattern: /^[A-Z]\d[\dW] ?[A-Z\d]{4}$/i, example: "D02 X285" },
  DE: { pattern: /^\d{5}$/, example: "10969" },
  FR: { pattern: /^\d{5}$/, example: "75011" },
  IT: { pattern: /^\d{5}$/, example: "20121" },
  ES: { pattern: /^\d{5}$/, example: "28013" },
  NL: { pattern: /^\d{4} ?[A-Z]{2}$/i, example: "1016 DV" },
  BE: { pattern: /^\d{4}$/, example: "1000" },
  AT: { pattern: /^\d{4}$/, example: "1010" },
  DK: { pattern: /^\d{4}$/, example: "1050" },
  SE: { pattern: /^\d{3} ?\d{2}$/, example: "114 55" },
};
const GENERIC_POSTCODE = /^[A-Z\d][A-Z\d -]{1,9}$/i;

/** Countries whose postcodes are digits only: the field asks for the numeric keypad. */
export function isNumericPostalCode(countryCode: string): boolean {
  const rule = POSTCODE_RULES[countryCode];
  return rule !== undefined && /^\d[\d ]*$/.test(rule.example);
}

/** Valid postcode for the country (generic shape when the country has no rule). */
export function isValidPostalCode(value: string, countryCode: string): boolean {
  const trimmed = value.trim();
  const rule = POSTCODE_RULES[countryCode];
  return (rule?.pattern ?? GENERIC_POSTCODE).test(trimmed);
}

export function postalCodeExample(countryCode: string): string | undefined {
  return POSTCODE_RULES[countryCode]?.example;
}

/** One field, as typed (spaces, brackets and dashes allowed), with 7–15 digits (E.164). */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

/** The error for one field, or undefined when it is valid. */
export function validateAddressField(
  field: AddressField,
  values: AddressFormValues,
  messages: AddressErrorMessages = ADDRESS_ERROR_MESSAGES,
): string | undefined {
  const value = values[field].trim();
  if (value.length > MAX_LENGTH) return messages.tooLong(MAX_LENGTH);

  switch (field) {
    case "firstName":
      return value ? undefined : messages.firstNameRequired;
    case "lastName":
      return value ? undefined : messages.lastNameRequired;
    case "countryCode":
      return value ? undefined : messages.countryRequired;
    case "postalCode":
      if (!value) return messages.postalCodeRequired;
      return isValidPostalCode(value, values.countryCode)
        ? undefined
        : messages.postalCodeInvalid(postalCodeExample(values.countryCode));
    case "line1":
      return value ? undefined : messages.line1Required;
    case "line2":
      return undefined;
    case "city":
      return value ? undefined : messages.cityRequired;
    case "phone":
      if (!value) return messages.phoneRequired;
      return isValidPhone(value) ? undefined : messages.phoneInvalid;
  }
}

/** Every field's error, in form order; an empty object when the address is valid. */
export function validateAddress(
  values: AddressFormValues,
  messages: AddressErrorMessages = ADDRESS_ERROR_MESSAGES,
): AddressErrors {
  const errors: AddressErrors = {};
  for (const field of ADDRESS_FIELDS) {
    const error = validateAddressField(field, values, messages);
    if (error) errors[field] = error;
  }
  return errors;
}
