import type { SessionErrorCode } from "@/lib/api/types/errors";

// UI strings of the account-addresses block (03.02 My Address): the list, the card menu, the
// delete confirmation, the toasts and the add / edit form. British English placeholder copy; pass
// `labels` to translate. The site's ADDRESSES_LABELS spreads these.

export const ACCOUNT_ADDRESSES_LABELS = {
  subtitle: (count: number) =>
    `${count} saved ${count === 1 ? "address" : "addresses"}${count > 0 ? " · Tap any to edit." : ""}`,
  add: "Add a new address",
  emptyTitle: "No addresses yet",
  emptyBody: "Save your shipping and billing addresses for a quicker checkout.",
  list: "Saved addresses",
  labelFallback: "Address",
  personalInvoice: (name: string) => `${name} · Personal invoice`,
  vat: (number: string) => `VAT ${number}`,
  menu: {
    edit: "Edit",
    setShipping: "Set as default shipping",
    removeShipping: "Remove default shipping",
    setBilling: "Set as default billing",
    removeBilling: "Remove default billing",
    delete: "Delete",
  },
  deleteTitle: "Delete this address?",
  deleteBody: (label: string) =>
    `${label} will be removed from your address book. This can't be undone.`,
  delete: "Delete address",
  added: (label: string) => `${label} added to your addresses.`,
  updated: (label: string) => `${label} updated.`,
  deleted: (label: string) => `${label} deleted.`,
  defaultedShipping: (label: string) => `${label} is now your default shipping address.`,
  defaultedBilling: (label: string) => `${label} is now your default billing address.`,
  removedShipping: (label: string) => `${label} is no longer your default shipping address.`,
  removedBilling: (label: string) => `${label} is no longer your default billing address.`,
  form: {
    addTitle: "Add new address",
    editTitle: "Edit address",
    heading: "Where should we send your orders?",
    hint: "You can use this address for invoicing too — just toggle it on below.",
    label: "Address Label",
    labelHelper: "A short name to recognise this address — like Home, Office, or Mum's place.",
    firstName: "First Name",
    lastName: "Last Name",
    phoneCode: "Country Code",
    phone: "Phone Number",
    phoneHelper: "We'll only use this if the courier needs to reach you.",
    country: "Country",
    postalCode: "Postcode",
    line1: "Address line 1",
    line2: "Address line 2",
    line2Placeholder: "Apartment, flat, building",
    city: "Town / City",
    region: "County",
    instructions: "Delivery instructions",
    instructionsPlaceholder: "e.g. Leave with the concierge if I'm not home",
    preferences: "Preferences",
    defaultShipping: "Default shipping address",
    defaultShippingBody: "Use this as your default for new orders.",
    invoicing: "Also use this address for invoicing",
    invoicingBody:
      "We'll send invoices to this address. Add tax details below if you need them on the invoice.",
    recipient: "Invoice recipient name",
    recipientHelper: "This name will appear on your invoice.",
    business: "This is a business address",
    businessBody: "For company invoices with VAT details.",
    company: "Company name",
    companyError: "Enter the company name",
    vatNumber: "VAT Number",
    vatHelper: "Required for VAT-registered businesses claiming back tax.",
    vatError: "Enter the VAT number",
    defaultBilling: "Default billing address",
    defaultBillingBody: "Send invoices here unless you choose another address.",
    privacy:
      "Your address and tax details are encrypted and used only for orders, shipping, and legal invoicing.",
    save: "Save Address",
    cancel: "Cancel",
  },
  /** Copy for a refused call, by error code. */
  error: (code: SessionErrorCode): string =>
    code === "sign-in-required"
      ? "Your session has ended. Sign in again to continue."
      : "Something went wrong. Please try again in a moment.",
  saving: "Saving…",
  cancel: "Cancel",
};

export type AccountAddressesLabels = typeof ACCOUNT_ADDRESSES_LABELS;
