"use client";

import { useState } from "react";
import { SavedAddressList } from "@/components/patterns/forms/address-form/saved-address-list";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import { Button } from "@/components/ui/button/button";
import { CardAddress } from "@/components/ui/card-address/card-address";
import { CardPaymentMethodExtended } from "@/components/ui/card-payment-method/card-payment-method-extended";
import type { Address, PaymentMethod } from "@/lib/api/types/customer";
import { formatAddressLines } from "@/lib/format/address";
import { isoToDate, useToday } from "@/lib/use-today";
import { CHECKOUT_LABELS as L } from "./checkout-labels";
import { expiresSoon, expiryText, isExpired, paymentTitle } from "./checkout-helpers";
import { CheckoutSheet } from "./checkout-sheet";

// Signed-in checkout (Figma WD.09.03.01): the chosen saved address and payment method as cards,
// each changed in a sheet (WD.09.03.05 Change delivery address, WD.09.03.06 Change payment
// method). The sheet keeps its own pending choice; the footer button confirms it.

/** The value of "pay with a new card" in the payment choice. */
export const NEW_CARD = "new-card";

export function SavedAddressCard({ address }: { address: Address }) {
  return (
    <CardAddress
      type="card"
      title={address.label}
      roles={{
        defaultShipping: address.isDefaultShipping,
        defaultBilling: address.isDefaultBilling,
      }}
      name={`${address.firstName} ${address.lastName}`}
      lines={formatAddressLines(address)}
      phone={address.phone}
    />
  );
}

export interface AddressSheetProps {
  open: boolean;
  addresses: readonly Address[];
  value: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function AddressSheet({ open, addresses, value, onClose, onConfirm }: AddressSheetProps) {
  const [pending, setPending] = useState(value);
  const chosen = addresses.find((address) => address.id === pending);
  return (
    <CheckoutSheet
      open={open}
      onClose={onClose}
      title={L.address.sheetTitle}
      subtitle={L.address.sheetSubtitle(addresses.length)}
      footer={
        <Button size="lg" className="w-full" onClick={() => onConfirm(pending)}>
          {L.address.deliverTo(chosen?.label ?? "")}
        </Button>
      }
    >
      <SavedAddressList
        className="p-16"
        label={L.address.sheetTitle}
        addresses={addresses}
        value={pending}
        onValueChange={setPending}
      />
    </CheckoutSheet>
  );
}

/** The date card expiry is checked against: null until the browser knows it (useToday). */
function useExpiryDate(): Date | null {
  const today = useToday();
  return today ? isoToDate(today) : null;
}

function paymentCardProps(method: PaymentMethod, now: Date | null) {
  const title = paymentTitle(method);
  if (method.type !== "card") {
    return {
      network: method.type,
      title,
      holderDetail: method.label,
      label: method.isDefault ? L.payment.defaultLabel : undefined,
    } as const;
  }
  const expired = isExpired(method, now);
  const date = expiryText(method);
  return {
    network: method.network,
    title,
    last4: method.last4,
    holderDetail: method.holderName,
    holderIcon: "account_circle",
    label: method.isDefault ? L.payment.defaultLabel : undefined,
    additionalDetails: expired ? L.payment.expired(date) : L.payment.expires(date),
    state: expired ? "expired" : expiresSoon(method, now) ? "warning" : "default",
    disabled: expired,
  } as const;
}

export function SavedPaymentCard({ method }: { method: PaymentMethod }) {
  const now = useExpiryDate();
  return <CardPaymentMethodExtended type="card" {...paymentCardProps(method, now)} />;
}

export interface PaymentSheetProps {
  open: boolean;
  methods: readonly PaymentMethod[];
  value: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function PaymentSheet({ open, methods, value, onClose, onConfirm }: PaymentSheetProps) {
  const [pending, setPending] = useState(value);
  const now = useExpiryDate();
  const chosen = methods.find((method) => method.id === pending);
  const expired = methods.filter((method) => isExpired(method, now)).length;
  return (
    <CheckoutSheet
      open={open}
      onClose={onClose}
      title={L.payment.sheetTitle}
      subtitle={L.payment.sheetSubtitle(methods.length - expired, expired)}
      footer={
        <Button size="lg" className="w-full" onClick={() => onConfirm(pending)}>
          {chosen ? L.payment.payWith(paymentTitle(chosen)) : L.payment.newCard}
        </Button>
      }
    >
      <div className="flex flex-col gap-12 p-16">
        <RadioCardGroup
          label={L.payment.sheetTitle}
          value={pending === NEW_CARD ? undefined : pending}
          onValueChange={setPending}
          className="flex flex-col gap-12"
        >
          {methods.map((method) => (
            <CardPaymentMethodExtended
              key={method.id}
              value={method.id}
              type="card"
              {...paymentCardProps(method, now)}
            />
          ))}
        </RadioCardGroup>
        <Button variant="outline" className="w-full" onClick={() => onConfirm(NEW_CARD)}>
          {L.payment.newCard}
        </Button>
      </div>
    </CheckoutSheet>
  );
}
