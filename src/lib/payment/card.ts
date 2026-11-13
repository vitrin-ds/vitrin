import type { CardNetwork } from "@/lib/api/types/customer";

// Payment card checks shared by the checkout card form (client-side validation) and the mock
// payment call: digits only, the Luhn checksum, the network from the number's prefix, expiry and
// CVC length. Pure functions; nothing here keeps a card number.

const CARD_LENGTHS: Record<CardNetwork, readonly number[]> = {
  visa: [13, 16, 19],
  mastercard: [16],
  amex: [15],
  jcb: [16, 17, 18, 19],
};

/** The number as digits only (spaces and dashes typed by the shopper dropped). */
export function cardDigits(value: string): string {
  return value.replace(/[\s-]/g, "");
}

/** Luhn (mod 10) checksum over a digits-only number. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** The card network from the IIN prefix, or null when it isn't one the shop accepts. */
export function cardNetwork(digits: string): CardNetwork | null {
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^35(2[89]|[3-8])/.test(digits)) return "jcb";
  const two = Number(digits.slice(0, 2));
  const four = Number(digits.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720)) return "mastercard";
  return null;
}

/** A number the shop can charge: digits, an accepted network, its length and the checksum. */
export function cardNumberValid(value: string): boolean {
  const digits = cardDigits(value);
  const network = cardNetwork(digits);
  return network !== null && CARD_LENGTHS[network].includes(digits.length) && luhnValid(digits);
}

/** Groups the digits as printed on the card: 4-6-5 for Amex, fours otherwise. */
export function formatCardNumber(value: string): string {
  const digits = cardDigits(value).replace(/\D/g, "").slice(0, 19);
  if (cardNetwork(digits) === "amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "08 / 28", "0828", "8/28" → { month: 8, year: 2028 }; null when it isn't MM / YY. */
export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^\s*(\d{1,2})\s*\/?\s*(\d{2})\s*$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return { month, year: 2000 + Number(match[2]) };
}

/** A card is valid to the last day of its expiry month. */
export function expiryValid(month: number, year: number, now: Date = new Date()): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) return false;
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return year * 12 + (month - 1) >= current;
}

/** Types the expiry as MM / YY while the shopper writes digits. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

/** Amex prints four digits on the front; every other network three on the back. */
export function cvcValid(value: string, network: CardNetwork | null): boolean {
  return network === "amex" ? /^\d{4}$/.test(value) : /^\d{3}$/.test(value);
}
