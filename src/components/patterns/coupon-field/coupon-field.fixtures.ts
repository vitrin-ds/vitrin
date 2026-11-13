import type { CouponFieldApplyResult } from "./coupon-field";

// Mock promotion rules for stories and tests: WELCOME10 (10%) and FREESHIP are valid, every other
// code is invalid or expired (Figma Alert (Negative) copy).

export const MOCK_COUPONS = {
  WELCOME10: { label: "Promo · WELCOME10 (10%)", percent: 10 },
  SPRING15: { label: "Promo · SPRING15 (15%)", percent: 15 },
} as const;

export function validateMockCoupon(code: string): CouponFieldApplyResult {
  return code in MOCK_COUPONS
    ? { ok: true }
    : { ok: false, error: "This code is invalid or has expired." };
}

/** Async variant with a network-like delay for the pending state. */
export function validateMockCouponLater(
  code: string,
  delayMs = 800,
): Promise<CouponFieldApplyResult> {
  return new Promise((resolve) => setTimeout(() => resolve(validateMockCoupon(code)), delayMs));
}
