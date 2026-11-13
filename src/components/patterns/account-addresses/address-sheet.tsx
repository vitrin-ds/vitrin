"use client";

import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { ADDRESS_FORM_LABELS } from "@/components/patterns/forms/address-form/address-form";
import {
  validateAddress,
  type AddressErrors,
  type AddressField,
  type AddressFormValues,
} from "@/components/patterns/forms/address-form/address-validation";
import { AdaptiveSheet } from "@/components/patterns/adaptive-sheet/adaptive-sheet";
import { ErrorSummary } from "@/components/patterns/error-summary/error-summary";
import { Accordion } from "@/components/ui/accordion/accordion";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Divider } from "@/components/ui/divider/divider";
import { Dropdown } from "@/components/ui/dropdown/dropdown";
import { TextInput } from "@/components/ui/text-input/text-input";
import type { AddressBookInput } from "@/lib/api/types/account";
import type { Address } from "@/lib/api/types/customer";
import { countryName } from "@/lib/format/address";
import { PreferenceBox } from "../account/preference-box";
import { ACCOUNT_ADDRESSES_LABELS, type AccountAddressesLabels } from "./account-addresses-labels";
import { ACCOUNT_ADDRESSES_LOCALE } from "./account-addresses-helpers";
import { flagOf, joinPhone, PHONE_CODES, phoneOptions, splitPhone } from "@/lib/format/phone";

// 03.02 Add new address (Figma WD 30951:594320 invoicing off · 30951:600229 on; WT, WM alike): a
// Right Sheet (a Full Bottom Sheet on mobile), padding 20, gap 32, as every add and edit in the
// account. Title; the form (Medium inputs, rows gap 20, two fields gap 8): label · name · country
// code + phone · country · postcode · lines · town + county · delivery instructions; Preferences:
// Default shipping, Also use for invoicing (opens recipient, business address with company and
// VAT, default billing), radius 12, surface-secondary while open; the Alert on privacy; Save
// Address + Cancel (Small, gap 4). Figma's second "Country Code" is the Country and its empty
// "Country" beside the town the County: copy slips, corrected here.

const countryOptions = (locale: string) =>
  PHONE_CODES.map(([code]) => ({
    value: code,
    label: countryName(code, locale),
    image: flagOf(code),
  }));

export interface AddressSheetProps {
  open: boolean;
  /** The address to edit; add a new one without it. */
  address?: Address;
  onClose: () => void;
  /** Saves the form (adds, or updates `address`); resolves true when it went through. */
  onSave: (input: AddressBookInput, address?: Address) => Promise<boolean>;
  locale?: string;
  labels?: AccountAddressesLabels;
}

export function AddressSheet({
  open,
  address,
  onClose,
  onSave,
  locale = ACCOUNT_ADDRESSES_LOCALE,
  labels = ACCOUNT_ADDRESSES_LABELS,
}: AddressSheetProps) {
  const L = labels.form;
  return (
    <AdaptiveSheet open={open} onClose={onClose} title={address ? L.editTitle : L.addTitle}>
      {/* A new key per address resets the fields. */}
      {open && (
        <AddressSheetForm
          key={address?.id ?? "new"}
          address={address}
          onClose={onClose}
          onSave={onSave}
          locale={locale}
          labels={labels}
        />
      )}
    </AdaptiveSheet>
  );
}

type InvoiceField = "company" | "vatNumber";

function AddressSheetForm({
  address,
  onClose,
  onSave,
  locale,
  labels,
}: Omit<AddressSheetProps, "open" | "locale" | "labels"> & {
  locale: string;
  labels: AccountAddressesLabels;
}) {
  const L = labels.form;
  const id = useId();
  const phone = splitPhone(address?.phone ?? "");
  const invoice = address?.invoice;
  const [label, setLabel] = useState(address?.label ?? "");
  const [values, setValues] = useState({
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    phoneCountry: phone.country,
    phoneNumber: phone.number,
    countryCode: address?.countryCode ?? "GB",
    postalCode: address?.postalCode ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    region: address?.region ?? "",
    instructions: address?.deliveryInstructions ?? "",
  });
  const [defaultShipping, setDefaultShipping] = useState(address?.isDefaultShipping ?? false);
  const [invoicing, setInvoicing] = useState(Boolean(invoice) || !!address?.isDefaultBilling);
  const [recipient, setRecipient] = useState(invoice?.recipient ?? "");
  const [business, setBusiness] = useState(Boolean(invoice?.company));
  const [company, setCompany] = useState(invoice?.company ?? "");
  const [vatNumber, setVatNumber] = useState(invoice?.vatNumber ?? "");
  const [defaultBilling, setDefaultBilling] = useState(address?.isDefaultBilling ?? false);
  const [errors, setErrors] = useState<AddressErrors & Partial<Record<InvoiceField, string>>>({});
  const [summary, setSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const summaryId = `${id}-errors`;
  const fieldId = (field: string) => `${id}-${field}`;

  type Name = keyof typeof values;
  const formValues = (from: typeof values): AddressFormValues => ({
    firstName: from.firstName,
    lastName: from.lastName,
    countryCode: from.countryCode,
    postalCode: from.postalCode,
    line1: from.line1,
    line2: from.line2,
    city: from.city,
    phone: joinPhone(from.phoneCountry, from.phoneNumber),
  });
  const invoiceErrors = () => ({
    company: invoicing && business && !company.trim() ? L.companyError : undefined,
    vatNumber: invoicing && business && !vatNumber.trim() ? L.vatError : undefined,
  });
  const check = (from: typeof values) => validateAddress(formValues(from));

  /** Figma Do: a field is checked when it loses focus, then on every change. */
  function refresh(field: AddressField, from: typeof values) {
    setErrors((current) => ({ ...current, [field]: check(from)[field] }));
  }

  function change(name: Name, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    const field = name === "phoneNumber" || name === "phoneCountry" ? "phone" : name;
    if (field in errors && errors[field as AddressField]) refresh(field as AddressField, next);
  }

  const text = (name: Name, field: AddressField = name as AddressField) => ({
    id: fieldId(field),
    value: values[name],
    errorText: errors[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) => change(name, event.target.value),
    onBlur: () => {
      if (values[name].trim() || errors[field]) refresh(field, values);
    },
  });

  const summaryItems = () => {
    const labels: Partial<Record<AddressField | InvoiceField, string>> = {
      firstName: L.firstName,
      lastName: L.lastName,
      phone: L.phone,
      countryCode: L.country,
      postalCode: L.postalCode,
      line1: L.line1,
      line2: L.line2,
      city: L.city,
      company: L.company,
      vatNumber: L.vatNumber,
    };
    return (Object.keys(labels) as (keyof typeof labels)[]).flatMap((field) => {
      const message = errors[field];
      return message ? [{ field, id: fieldId(field), label: labels[field] ?? "", message }] : [];
    });
  };

  const items = summaryItems();

  useEffect(() => {
    if (summary) document.getElementById(summaryId)?.focus();
  }, [summary, summaryId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = { ...check(values), ...invoiceErrors() };
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setSummary(false);
      window.requestAnimationFrame(() => setSummary(true));
      return;
    }
    setSummary(false);
    const name = label.trim() || labels.labelFallback;
    const { firstName, lastName, countryCode, postalCode, line1, line2, city, region } = values;
    const input: AddressBookInput = {
      label: name,
      firstName,
      lastName,
      countryCode,
      postalCode,
      line1,
      city,
      phone: joinPhone(values.phoneCountry, values.phoneNumber),
      ...(line2.trim() ? { line2 } : {}),
      ...(region.trim() ? { region } : {}),
      ...(values.instructions.trim() ? { deliveryInstructions: values.instructions } : {}),
      ...(invoicing
        ? {
            invoice: {
              recipient: recipient.trim() || `${firstName} ${lastName}`.trim(),
              ...(business ? { company: company.trim(), vatNumber: vatNumber.trim() } : {}),
            },
          }
        : {}),
      isDefaultShipping: defaultShipping,
      isDefaultBilling: invoicing && defaultBilling,
    };
    setBusy(true);
    const saved = await onSave(input, address);
    setBusy(false);
    if (saved) onClose();
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-32 p-20">
      <div className="flex flex-col">
        <h3 className="text-title-lg text-text-primary">{L.heading}</h3>
        <p className="text-body-sm text-text-primary">{L.hint}</p>
      </div>
      {summary && items.length > 0 && (
        <ErrorSummary id={summaryId} title={ADDRESS_FORM_LABELS.errorSummaryTitle} errors={items} />
      )}
      <div className="flex flex-col gap-20">
        <TextInput
          label={L.label}
          helperText={L.labelHelper}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-8">
          <TextInput
            {...text("firstName")}
            label={L.firstName}
            required
            autoComplete="shipping given-name"
          />
          <TextInput
            {...text("lastName")}
            label={L.lastName}
            required
            autoComplete="shipping family-name"
          />
        </div>
        <div className="flex items-start gap-8">
          <Dropdown
            label={L.phoneCode}
            options={phoneOptions}
            value={values.phoneCountry}
            onValueChange={(code) => change("phoneCountry", code)}
            required
            className="w-120 shrink-0"
          />
          <TextInput
            {...text("phoneNumber", "phone")}
            label={L.phone}
            helperText={L.phoneHelper}
            type="tel"
            required
            autoComplete="shipping tel-national"
            className="min-w-0 flex-1"
          />
        </div>
        <Dropdown
          id={fieldId("countryCode")}
          label={L.country}
          options={countryOptions(locale)}
          value={values.countryCode}
          onValueChange={(code) => change("countryCode", code)}
          errorText={errors.countryCode}
          autoComplete="shipping country"
          required
        />
        <TextInput
          {...text("postalCode")}
          label={L.postalCode}
          required
          autoComplete="shipping postal-code"
          autoCapitalize="characters"
        />
        <TextInput
          {...text("line1")}
          label={L.line1}
          required
          autoComplete="shipping address-line1"
        />
        <TextInput
          {...text("line2")}
          label={L.line2}
          placeholder={L.line2Placeholder}
          autoComplete="shipping address-line2"
        />
        <div className="grid grid-cols-2 gap-8">
          <TextInput
            {...text("city")}
            label={L.city}
            required
            autoComplete="shipping address-level2"
          />
          <TextInput
            id={fieldId("region")}
            label={L.region}
            value={values.region}
            onChange={(event) => change("region", event.target.value)}
            autoComplete="shipping address-level1"
          />
        </div>
        <TextInput
          id={fieldId("instructions")}
          label={L.instructions}
          placeholder={L.instructionsPlaceholder}
          value={values.instructions}
          onChange={(event) => change("instructions", event.target.value)}
        />
      </div>
      <Divider />
      <section className="flex flex-col gap-12">
        <h3 className="text-title-md text-text-primary">{L.preferences}</h3>
        <PreferenceBox
          title={L.defaultShipping}
          body={L.defaultShippingBody}
          checked={defaultShipping}
          onChange={setDefaultShipping}
        />
        <Accordion
          usage="card"
          indicator="toggle"
          title={L.invoicing}
          subtitle={L.invoicingBody}
          open={invoicing}
          onOpenChange={setInvoicing}
          headingLevel={4}
        >
          <div className="flex flex-col gap-20">
            <Divider />
            <TextInput
              id={fieldId("recipient")}
              label={L.recipient}
              helperText={L.recipientHelper}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              autoComplete="name"
            />
            <Accordion
              usage="card"
              indicator="toggle"
              title={L.business}
              subtitle={L.businessBody}
              open={business}
              onOpenChange={setBusiness}
              headingLevel={5}
            />
            {business && (
              <>
                <TextInput
                  id={fieldId("company")}
                  label={L.company}
                  required
                  value={company}
                  errorText={errors.company}
                  onChange={(event) => setCompany(event.target.value)}
                  autoComplete="organization"
                />
                <TextInput
                  id={fieldId("vatNumber")}
                  label={L.vatNumber}
                  helperText={L.vatHelper}
                  required
                  value={vatNumber}
                  errorText={errors.vatNumber}
                  onChange={(event) => setVatNumber(event.target.value)}
                  autoComplete="off"
                />
              </>
            )}
            <Accordion
              usage="card"
              indicator="toggle"
              title={L.defaultBilling}
              subtitle={L.defaultBillingBody}
              open={defaultBilling}
              onOpenChange={setDefaultBilling}
              headingLevel={5}
            />
          </div>
        </Accordion>
      </section>
      <Alert usage="neutral" width="card" icon="lock">
        {L.privacy}
      </Alert>
      <div className="flex flex-col gap-4">
        <Button type="submit" size="sm" className="w-full" disabled={busy}>
          {L.save}
        </Button>
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={onClose}>
          {L.cancel}
        </Button>
      </div>
    </form>
  );
}
