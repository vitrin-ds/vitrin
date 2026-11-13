import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Address } from "@/lib/api/types/customer";
import type { AddressBookAdapter } from "@/lib/commerce/address-book-adapter";
import { CommerceError } from "@/lib/commerce/commerce-error";
import { expectNoAxeViolations } from "@/test/axe";
import { AccountAddresses } from "./account-addresses";

const address = (id: string, label: string, overrides: Partial<Address> = {}): Address => ({
  id,
  label,
  firstName: "Ada",
  lastName: "Smith",
  line1: "2 Road",
  postalCode: "N2",
  city: "London",
  countryCode: "GB",
  phone: "+44 7700 900245",
  isDefaultShipping: false,
  isDefaultBilling: false,
  ...overrides,
});

const HOME = address("a1", "Home", { isDefaultShipping: true });
const OFFICE = address("a2", "Office");

function adapter(overrides: Partial<AddressBookAdapter> = {}): AddressBookAdapter {
  return {
    addAddress: vi.fn(async () => [HOME, OFFICE]),
    updateAddress: vi.fn(async () => [HOME, OFFICE]),
    deleteAddress: vi.fn(async () => [HOME]),
    setDefaultAddress: vi.fn(async () => [
      { ...HOME, isDefaultShipping: false },
      { ...OFFICE, isDefaultShipping: true },
    ]),
    removeDefaultAddress: vi.fn(async () => [HOME, OFFICE]),
    ...overrides,
  };
}

async function openMenu(name: string) {
  await userEvent.click(
    screen.getByRole("button", { name: new RegExp(`more.*${name}|${name}.*more`, "i") }),
  );
}

describe("AccountAddresses", () => {
  it("lists the addresses as cards", () => {
    render(<AccountAddresses addresses={[HOME, OFFICE]} adapter={adapter()} onNotice={() => {}} />);
    const list = screen.getByRole("list", { name: "Saved addresses" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("deletes after the confirmation and redraws from the answer", async () => {
    const book = adapter();
    const onNotice = vi.fn();
    render(<AccountAddresses addresses={[HOME, OFFICE]} adapter={book} onNotice={onNotice} />);
    await openMenu("Office");
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete address" }));
    await waitFor(() => expect(book.deleteAddress).toHaveBeenCalledWith("a2"));
    await waitFor(() =>
      expect(
        within(screen.getByRole("list", { name: "Saved addresses" })).getAllByRole("listitem"),
      ).toHaveLength(1),
    );
    expect(onNotice).toHaveBeenCalledWith({ tone: "success", text: "Office deleted." });
  });

  it("sets a default and announces a refusal", async () => {
    const onNotice = vi.fn();
    const book = adapter({
      setDefaultAddress: vi.fn(async () => {
        throw new CommerceError("sign-in-required");
      }),
    });
    render(<AccountAddresses addresses={[HOME, OFFICE]} adapter={book} onNotice={onNotice} />);
    await openMenu("Office");
    await userEvent.click(screen.getByRole("menuitem", { name: "Set as default shipping" }));
    await waitFor(() =>
      expect(onNotice).toHaveBeenCalledWith({
        tone: "error",
        text: "Your session has ended. Sign in again to continue.",
      }),
    );
  });

  it("offers to add one when the book is empty", async () => {
    render(<AccountAddresses addresses={[]} adapter={adapter()} onNotice={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Add a new address" }));
    expect(await screen.findByRole("dialog", { name: "Add new address" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AccountAddresses addresses={[HOME, OFFICE]} adapter={adapter()} onNotice={() => {}} />,
    );
    await expectNoAxeViolations(container);
  });
});
