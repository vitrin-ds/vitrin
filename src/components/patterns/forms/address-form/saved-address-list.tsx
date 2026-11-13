"use client";

import type { Address } from "@/lib/api/types/customer";
import { cn } from "@/lib/cn";
import { formatAddressLines } from "@/lib/format/address";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import { CardAddress, type CardAddressLabels } from "@/components/ui/card-address/card-address";

// Saved-address selection (Figma WD.09.03.05 Checkout — Change delivery address, 31396:14427):
// the signed-in shopper's saved addresses as Card.Address (Card type) in a RadioCardGroup, gap
// 12, each with Edit. The sheet around it and its "Deliver to …" button belong to the page.

export interface SavedAddressListProps {
  addresses: readonly Address[];
  /** The selected address id. */
  value: string | undefined;
  onValueChange: (id: string) => void;
  /** Accessible name of the group, e.g. "Delivery address". */
  label: string;
  /** Figma `Edit` on each card. */
  onEdit?: (id: string) => void;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  cardLabels?: CardAddressLabels;
  className?: string;
}

export function SavedAddressList({
  addresses,
  value,
  onValueChange,
  label,
  onEdit,
  headingLevel = 3,
  locale = "en",
  cardLabels,
  className,
}: SavedAddressListProps) {
  return (
    <RadioCardGroup
      label={label}
      value={value}
      onValueChange={onValueChange}
      className={cn("flex flex-col gap-12", className)}
    >
      {addresses.map((address) => (
        <CardAddress
          key={address.id}
          value={address.id}
          type="card"
          title={address.label}
          roles={{
            defaultShipping: address.isDefaultShipping,
            defaultBilling: address.isDefaultBilling,
          }}
          name={`${address.firstName} ${address.lastName}`}
          lines={formatAddressLines(address, locale)}
          phone={address.phone}
          onEdit={onEdit ? () => onEdit(address.id) : undefined}
          headingLevel={headingLevel}
          labels={cardLabels}
        />
      ))}
    </RadioCardGroup>
  );
}
