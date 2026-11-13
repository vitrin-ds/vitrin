import type { AddressBookInput } from "@/lib/api/types/account";
import type { Address } from "@/lib/api/types/customer";

export type AddressRole = "shipping" | "billing";

/**
 * What the account-addresses block needs from a backend: the signed-in customer's address book.
 * Every change resolves with the whole book after it, so the list redraws from the answer.
 * Methods reject with a `CommerceError` when the call did not go through.
 */
export interface AddressBookAdapter {
  addAddress(input: AddressBookInput): Promise<Address[]>;
  updateAddress(addressId: string, input: AddressBookInput): Promise<Address[]>;
  deleteAddress(addressId: string): Promise<Address[]>;
  setDefaultAddress(addressId: string, role: AddressRole): Promise<Address[]>;
  removeDefaultAddress(addressId: string, role: AddressRole): Promise<Address[]>;
}
