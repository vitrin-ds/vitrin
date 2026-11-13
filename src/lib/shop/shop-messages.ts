import type { SessionErrorCode } from "@/lib/api/types/errors";

// Copy for the shop session's feedback (Toast) and the Add to cart / wishlist controls. Kept in
// a client-safe module: the provider needs functions, which a Server Component can't pass down.

export interface ShopLabels {
  savedToWishlist: (name: string) => string;
  removedFromWishlist: (name: string) => string;
  undo: string;
  /** The message for a refused call. `max` is the quantity limit, when there is one. */
  error: (code: SessionErrorCode, max?: number) => string;
}

const ERRORS: Record<SessionErrorCode, string> = {
  "invalid-email": "Enter a valid e-mail address, like name@example.com.",
  "already-subscribed": "This e-mail address is already signed up.",
  "unknown-product": "This product is no longer available.",
  "unknown-variant": "This option is no longer available.",
  "unknown-line": "This item is no longer in your cart.",
  "invalid-quantity": "Choose a quantity of 1 or more.",
  "out-of-stock": "Sorry, this option is out of stock.",
  "quantity-limit": "You've reached the limit for this item.",
  "invalid-coupon": "This code isn't valid. Check it and try again.",
  "coupon-not-eligible": "Your order doesn't meet this code's conditions yet.",
  "coupon-limit": "Only one code can be used per order.",
  "unknown-review": "This review is no longer available.",
  "already-voted": "You've already rated this review.",
  "invalid-review": "Check your review and try again.",
  "empty-cart": "Your cart is empty. Add something before you check out.",
  "invalid-address": "Check the delivery address and try again.",
  "invalid-shipping-method": "Choose a delivery method.",
  "invalid-payment": "Check your payment details and try again.",
  "sign-in-required": "Sign in to pay with a saved payment method.",
  "payment-declined":
    "Your bank declined the payment. You haven't been charged. Check the details, or try another card.",
  "authentication-failed":
    "Your bank couldn't verify the payment. You haven't been charged. Try again or use another card.",
  "unknown-payment": "This payment has expired. Please place your order again.",
  "invalid-credentials": "The e-mail or password you entered is incorrect. Please try again.",
  "invalid-name": "Enter your first and last name.",
  "invalid-code": "The code you entered is incorrect. Please check it and try again.",
  "code-expired": "This code has expired. Request a new one.",
  unavailable: "Something went wrong. Please try again in a moment.",
  "wrong-password": "Your current password isn't right. Check it and try again.",
  "invalid-password": "Use at least 8 characters, with a letter and a number.",
  "invalid-profile": "Check your details and try again.",
  "email-in-use": "Another account already uses this e-mail address.",
  "unknown-address": "This address is no longer in your address book.",
  "unknown-payment-method": "This payment method is no longer saved.",
  "unknown-order": "We couldn't find this order.",
  "invalid-cancellation": "Choose why you're cancelling and try again.",
  "invalid-gift-card": "We couldn't find this gift card. Check the code and try again.",
  "invalid-return": "Some of these items can't be returned any more. Check them and try again.",
};

export const SHOP_LABELS: ShopLabels = {
  savedToWishlist: (name) => `${name} saved to your wishlist.`,
  removedFromWishlist: (name) => `${name} removed from your wishlist.`,
  undo: "Undo",
  error: (code, max) =>
    code === "quantity-limit" && max !== undefined
      ? `You can add up to ${max} of this item.`
      : ERRORS[code],
};
