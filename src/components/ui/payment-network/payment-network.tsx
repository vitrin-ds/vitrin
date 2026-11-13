import { BrandImage } from "@/components/base/brand-image/brand-image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import type { CardNetwork, PaymentMethod } from "@/lib/api/types/customer";

// Figma asset `r-payment-methods` (Size=24): a 36×24 badge, radius 4, with a 1px border-neutral,
// holding the network logo. The logos are the Size=48 SVGs in the project's public/brand/payment
// (brand marks are never distributed with the code), shown with next/image, never inlined.
// The 48px artwork is drawn centred at 36px so it fits the 24px-high badge. The marks are raw
// brand colours drawn for white (Apple Pay is black), so the plate is surface-static-light, the
// same light surface in both themes. A network without a logo (Klarna), or a project without the
// logo files (they aren't distributed with the code), shows a short text mark instead.

export type PaymentNetworkId = CardNetwork | Exclude<PaymentMethod["type"], "card">;

const NETWORKS: Record<PaymentNetworkId, { name: string; logo?: string; mark: string }> = {
  visa: { name: "Visa", logo: "visa", mark: "Visa" },
  mastercard: { name: "Mastercard", logo: "mastercard", mark: "MC" },
  amex: { name: "American Express", logo: "amex", mark: "Amex" },
  jcb: { name: "JCB", logo: "jcb", mark: "JCB" },
  paypal: { name: "PayPal", logo: "paypal", mark: "PP" },
  "apple-pay": { name: "Apple Pay", logo: "apple-pay", mark: "Pay" },
  "google-pay": { name: "Google Pay", logo: "google-pay", mark: "GPay" },
  klarna: { name: "Klarna", mark: "K." },
};

export function paymentNetworkName(network: PaymentNetworkId): string {
  return NETWORKS[network].name;
}

export interface PaymentNetworkProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  network: PaymentNetworkId;
}

export function PaymentNetwork({ network, className, ...props }: PaymentNetworkProps) {
  const { name, logo, mark } = NETWORKS[network];
  const textMark = (
    <span
      role="img"
      aria-label={name}
      className="text-label-sm text-text-primary dark:text-text-inverse"
    >
      <span aria-hidden>{mark}</span>
    </span>
  );
  return (
    <span
      {...props}
      className={cn(
        "inline-flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-4",
        "bg-surface-static-light inset-ring inset-ring-border-neutral",
        className,
      )}
    >
      {logo ? (
        <BrandImage
          src={`/brand/payment/${logo}.svg`}
          alt={name}
          width={36}
          height={36}
          className="size-36 max-w-none"
          fallback={textMark}
        />
      ) : (
        textMark
      )}
    </span>
  );
}
