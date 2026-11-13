// The phone field of the account forms (Figma 03.02, 03.05): a country code with its flag, and the
// number. The API keeps them as one string, "+44 7700 900245".

/** Countries the shop ships to with their dialling codes, in the Address Form's order. */
export const PHONE_CODES = [
  ["GB", "+44"],
  ["IE", "+353"],
  ["DE", "+49"],
  ["FR", "+33"],
  ["NL", "+31"],
  ["BE", "+32"],
  ["ES", "+34"],
  ["IT", "+39"],
  ["AT", "+43"],
  ["DK", "+45"],
  ["SE", "+46"],
] as const;

export const flagOf = (code: string) => `/brand/flags/${code.toLowerCase()}.svg`;

export const phoneOptions = PHONE_CODES.map(([code, dial]) => ({
  value: code,
  label: dial,
  image: flagOf(code),
}));

/** "+44 7700 900245" → the country whose code it starts with, and the rest. */
export function splitPhone(phone: string): { country: string; number: string } {
  const match = PHONE_CODES.find(([, dial]) => phone.startsWith(dial));
  return match
    ? { country: match[0], number: phone.slice(match[1].length).trim() }
    : { country: "GB", number: phone };
}

export function joinPhone(country: string, number: string): string {
  const dial = PHONE_CODES.find(([code]) => code === country)?.[1];
  return number.trim() ? `${dial ?? ""} ${number.trim()}`.trim() : "";
}
