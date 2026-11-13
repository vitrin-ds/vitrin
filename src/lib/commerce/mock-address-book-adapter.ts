import type { AddressBookInput } from "@/lib/api/types/account";
import type { Address } from "@/lib/api/types/customer";
import type { AddressBookAdapter, AddressRole } from "./address-book-adapter";
import { CommerceError } from "./commerce-error";
import { SAMPLE_ADDRESS } from "./mock-samples";

const FLAG: Record<AddressRole, "isDefaultShipping" | "isDefaultBilling"> = {
  shipping: "isDefaultShipping",
  billing: "isDefaultBilling",
};

/** An in-memory address book for a first install: the sample address, or the ones it is given. */
export function createMockAddressBookAdapter(
  seed: readonly Address[] = [SAMPLE_ADDRESS],
): AddressBookAdapter {
  let book: Address[] = [...seed];
  let next = book.length + 1;

  const find = (addressId: string) => {
    const address = book.find((item) => item.id === addressId);
    if (!address) throw new CommerceError("unknown-address");
    return address;
  };
  /** One default per role: setting it on one address takes it off the others. */
  const withDefaults = (list: Address[], id: string, input: Partial<AddressBookInput>) =>
    list.map((item) => ({
      ...item,
      isDefaultShipping: input.isDefaultShipping ? item.id === id : item.isDefaultShipping,
      isDefaultBilling: input.isDefaultBilling ? item.id === id : item.isDefaultBilling,
    }));

  return {
    addAddress: async (input) => {
      const id = `address-${next++}`;
      const first = book.length === 0;
      const address: Address = {
        ...input,
        id,
        isDefaultShipping: first || Boolean(input.isDefaultShipping),
        isDefaultBilling: first || Boolean(input.isDefaultBilling),
      };
      book = withDefaults([...book, address], id, address);
      return book;
    },
    updateAddress: async (addressId, input) => {
      const current = find(addressId);
      const updated: Address = {
        ...current,
        ...input,
        isDefaultShipping: input.isDefaultShipping ?? current.isDefaultShipping,
        isDefaultBilling: input.isDefaultBilling ?? current.isDefaultBilling,
      };
      book = withDefaults(
        book.map((item) => (item.id === addressId ? updated : item)),
        addressId,
        input,
      );
      return book;
    },
    deleteAddress: async (addressId) => {
      find(addressId);
      book = book.filter((item) => item.id !== addressId);
      return book;
    },
    setDefaultAddress: async (addressId, role) => {
      find(addressId);
      book = book.map((item) => ({ ...item, [FLAG[role]]: item.id === addressId }));
      return book;
    },
    removeDefaultAddress: async (addressId, role) => {
      find(addressId);
      book = book.map((item) => (item.id === addressId ? { ...item, [FLAG[role]]: false } : item));
      return book;
    },
  };
}
