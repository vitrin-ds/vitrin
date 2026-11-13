"use client";

import { useState } from "react";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu/action-menu";
import { Button } from "@/components/ui/button/button";
import { CARD_ADDRESS_LABELS, CardAddress } from "@/components/ui/card-address/card-address";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import type { AddressBookInput } from "@/lib/api/types/account";
import type { Address } from "@/lib/api/types/customer";
import type { AddressBookAdapter } from "@/lib/commerce/address-book-adapter";
import { CommerceError } from "@/lib/commerce/commerce-error";
import { ConfirmDialog } from "../account/confirm-dialog";
import {
  ACCOUNT_ADDRESSES_LOCALE,
  addressCardProps,
  addressTitle,
} from "./account-addresses-helpers";
import { ACCOUNT_ADDRESSES_LABELS, type AccountAddressesLabels } from "./account-addresses-labels";
import { AddressSheet } from "./address-sheet";

// 03.02 My Address (Figma WD 30951:591858 · WT 30951:591809 · WM 30951:591760; contextual menus
// P0O2 30951:605770), the column under the page header, gap 12: Add a new address (Ghost Small,
// on the right), then the Card.Address cards one under the other, gap 12. Tapping a card edits
// it; its more_vert opens Edit, Set as / Remove default shipping and billing, and Delete. Add and
// Edit open the address sheet; Delete asks first (destructive Dialog). Every change goes through
// an AddressBookAdapter and the list redraws from its answer; the outcome goes to `onNotice`
// (e.g. a Toast).

export interface AccountAddressesNotice {
  tone: "success" | "error";
  text: string;
}

export interface AccountAddressesProps {
  /** The saved addresses; the list follows the adapter's answers after each change. */
  addresses: readonly Address[];
  adapter: AddressBookAdapter;
  /** The outcome of a change, to announce (a Toast is a polite live region). */
  onNotice: (notice: AccountAddressesNotice) => void;
  /** Open the add form at once (e.g. `?add=1` from an overview's "Add new"). */
  defaultAdding?: boolean;
  /** The add / edit form closed. */
  onEditorClose?: () => void;
  locale?: string;
  labels?: AccountAddressesLabels;
}

type Editing = { address?: Address } | null;

export function AccountAddresses({
  addresses: initial,
  adapter,
  onNotice,
  defaultAdding = false,
  onEditorClose,
  locale = ACCOUNT_ADDRESSES_LOCALE,
  labels: L = ACCOUNT_ADDRESSES_LABELS,
}: AccountAddressesProps) {
  const [addresses, setAddresses] = useState(initial);
  const [source, setSource] = useState(initial);
  const [editing, setEditing] = useState<Editing>(() => (defaultAdding ? {} : null));
  const [deleting, setDeleting] = useState<Address | null>(null);

  // A new list from the caller (e.g. the session refreshed) replaces the local one.
  if (initial !== source) {
    setSource(initial);
    setAddresses(initial);
  }

  const title = (address: Address) => addressTitle(address, L.labelFallback);

  async function run(call: () => Promise<Address[]>, success: string): Promise<boolean> {
    try {
      setAddresses(await call());
      onNotice({ tone: "success", text: success });
      return true;
    } catch (error) {
      const code = error instanceof CommerceError ? error.code : "unavailable";
      onNotice({ tone: "error", text: L.error(code) });
      return false;
    }
  }

  function save(input: AddressBookInput, address?: Address) {
    const name = input.label;
    return address
      ? run(() => adapter.updateAddress(address.id, input), L.updated(name))
      : run(() => adapter.addAddress(input), L.added(name));
  }

  function closeEditor() {
    setEditing(null);
    onEditorClose?.();
  }

  function menuItems(address: Address): ActionMenuItem[] {
    const name = title(address);
    return [
      { label: L.menu.edit, icon: "edit_square", onSelect: () => setEditing({ address }) },
      address.isDefaultShipping
        ? {
            label: L.menu.removeShipping,
            icon: "cancel",
            onSelect: () =>
              void run(
                () => adapter.removeDefaultAddress(address.id, "shipping"),
                L.removedShipping(name),
              ),
          }
        : {
            label: L.menu.setShipping,
            icon: "delivery_truck_speed",
            onSelect: () =>
              void run(
                () => adapter.setDefaultAddress(address.id, "shipping"),
                L.defaultedShipping(name),
              ),
          },
      address.isDefaultBilling
        ? {
            label: L.menu.removeBilling,
            icon: "cancel",
            onSelect: () =>
              void run(
                () => adapter.removeDefaultAddress(address.id, "billing"),
                L.removedBilling(name),
              ),
          }
        : {
            label: L.menu.setBilling,
            icon: "receipt_long",
            onSelect: () =>
              void run(
                () => adapter.setDefaultAddress(address.id, "billing"),
                L.defaultedBilling(name),
              ),
          },
      { label: L.menu.delete, icon: "delete", onSelect: () => setDeleting(address) },
    ];
  }

  return (
    <>
      {addresses.length === 0 ? (
        <EmptyState
          icon="location_on"
          title={L.emptyTitle}
          body={L.emptyBody}
          primaryAction={{ label: L.add, onClick: () => setEditing({}) }}
        />
      ) : (
        <div className="flex flex-col gap-12">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" leftIcon="add" onClick={() => setEditing({})}>
              {L.add}
            </Button>
          </div>
          <ul aria-label={L.list} className="flex flex-col gap-12">
            {addresses.map((address) => {
              const card = addressCardProps(address, locale, L);
              return (
                <li key={address.id}>
                  <CardAddress
                    {...card}
                    type="card"
                    headingLevel={2}
                    onOpen={() => setEditing({ address })}
                    menu={
                      <ActionMenu
                        label={CARD_ADDRESS_LABELS.more(card.title)}
                        items={menuItems(address)}
                      />
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <AddressSheet
        open={editing !== null}
        address={editing?.address}
        onClose={closeEditor}
        onSave={save}
        locale={locale}
        labels={L}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={L.deleteTitle}
        body={deleting ? L.deleteBody(title(deleting)) : ""}
        confirmLabel={L.delete}
        labels={{ saving: L.saving, cancel: L.cancel }}
        onConfirm={async () => {
          if (!deleting) return;
          await run(() => adapter.deleteAddress(deleting.id), L.deleted(title(deleting)));
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
