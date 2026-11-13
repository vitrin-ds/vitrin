import type { AddressFormSubmit } from "@/components/patterns/forms/address-form/address-form";
import { paymentNetworkName } from "@/components/ui/payment-network/payment-network";
import type { AddressInput, Customer } from "@/lib/api/types/checkout";
import type { Address, PaymentMethod } from "@/lib/api/types/customer";
import { CHECKOUT_LABELS as L } from "./checkout-labels";

// Checkout view helpers: e-mail check, form values → the API's AddressInput, the saved
// address / payment defaults and how a saved method is named and dated.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The e-mail field's error, or undefined when it is valid. */
export function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return L.contact.emailRequired;
  return EMAIL_PATTERN.test(email) ? undefined : L.contact.emailInvalid;
}

/** Address Form values (or a saved address) as the placeOrder input. */
export function toAddressInput(values: AddressFormSubmit | Address): AddressInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    line1: values.line1,
    ...(values.line2 ? { line2: values.line2 } : {}),
    postalCode: values.postalCode,
    city: values.city,
    countryCode: values.countryCode,
    phone: values.phone,
  };
}

export function defaultAddress(customer: Customer): Address | undefined {
  return customer.addresses.find((a) => a.isDefaultShipping) ?? customer.addresses[0];
}

// `now` is null while rendering on the server (useToday): no card counts as expired until the
// browser knows the date.

/** The default method, unless it can't be used; then the first usable one. */
export function defaultPaymentMethod(customer: Customer, now: Date | null) {
  const usable = customer.paymentMethods.filter((method) => !isExpired(method, now));
  return usable.find((method) => method.isDefault) ?? usable[0];
}

/** A card past the end of its expiry month. Wallets never expire. */
export function isExpired(method: PaymentMethod, now: Date | null): boolean {
  if (method.type !== "card" || now === null) return false;
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return method.expiryYear * 12 + (method.expiryMonth - 1) < current;
}

/** Expires this month or next (Figma Card.PaymentMethod State=Warning, "Expires soon"). */
export function expiresSoon(method: PaymentMethod, now: Date | null): boolean {
  if (method.type !== "card" || now === null || isExpired(method, now)) return false;
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return method.expiryYear * 12 + (method.expiryMonth - 1) - current <= 1;
}

/** "01/30". */
export function expiryText(method: Extract<PaymentMethod, { type: "card" }>): string {
  return `${String(method.expiryMonth).padStart(2, "0")}/${String(method.expiryYear).slice(-2)}`;
}

/** "Visa ending in 5012", "PayPal". */
export function paymentTitle(method: PaymentMethod): string {
  return method.type === "card"
    ? L.payment.savedCard(paymentNetworkName(method.network), method.last4)
    : paymentNetworkName(method.type);
}
