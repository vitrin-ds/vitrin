"use client";

import { useId, useImperativeHandle, useState, type Ref } from "react";
import type { CardNetwork } from "@/lib/api/types/customer";
import { cn } from "@/lib/cn";
import {
  cardDigits,
  cardNetwork,
  formatCardNumber,
  formatExpiry,
  parseExpiry,
} from "@/lib/payment/card";
import { PaymentNetwork } from "@/components/ui/payment-network/payment-network";
import { TextInput } from "@/components/ui/text-input/text-input";
import {
  CARD_ERROR_MESSAGES,
  CARD_FIELDS,
  EMPTY_CARD,
  validateCard,
  validateCardField,
  type CardErrorMessages,
  type CardErrors,
  type CardField,
  type CardFormValues,
} from "./card-validation";

// Figma Checkout `Payment` card fields (WD/WT/WM.09.03.02 Checkout — Guest, 31385:9085): Medium
// Text Inputs, gap 12: Card number (full width) · Expiry date / Security code (CVV) side by side
// at every width (gap 12, 16 from tablet) · Name on card. Inside the page's checkout form: the
// page's Pay button validates through `ref` (like AddressForm `as="fields"`) and shows one error
// summary; each field is also checked on blur (Figma Do: validate after the field loses focus).
//
// Card data: autocomplete cc-number / cc-exp / cc-csc / cc-name, numeric keyboards, no spell
// check. The values live in this component's state only (memory): nothing is written to storage
// or the URL. `validate()` hands the page the parsed card for the payment call, once.

export interface CardFormLabels {
  number: string;
  expiry: string;
  cvc: string;
  holderName: string;
  placeholders: Record<CardField, string>;
  /** Helper under the security code after a declined payment (`clearSecurityCode`). */
  cvcAgain: string;
  /** Helper under the cardholder's name (03.03 Add card). */
  holderHelper?: string;
  errors: CardErrorMessages;
}

export const CARD_FORM_LABELS: CardFormLabels = {
  number: "Card number",
  expiry: "Expiry date",
  cvc: "Security code (CVV)",
  holderName: "Name on card",
  placeholders: {
    number: "1234 5678 9012 3456",
    expiry: "MM / YY",
    cvc: "3 digits",
    holderName: "As shown on your card",
  },
  cvcAgain: "Re-enter your security code",
  errors: CARD_ERROR_MESSAGES,
};

/** The card as the payment call takes it. Hand it on once; don't keep it. */
export interface CardFormCard {
  number: string;
  network: CardNetwork;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  holderName: string;
}

export interface CardFormFieldError {
  field: CardField;
  id: string;
  label: string;
  message: string;
}

export type CardFormValidation =
  { ok: true; card: CardFormCard } | { ok: false; errors: CardFormFieldError[] };

export interface CardFormHandle {
  validate: () => CardFormValidation;
  /** After a declined payment: empties the security code and asks for it again. */
  clearSecurityCode: () => void;
}

export interface CardFormProps {
  ref?: Ref<CardFormHandle>;
  /** Prefix for the field ids (summary links). */
  id?: string;
  defaultValues?: Partial<CardFormValues>;
  /** "Today" for the expiry check (tests, stories). */
  now?: Date;
  labels?: CardFormLabels;
  /** Space between the rows: 12, or 20 with 8 across (03.03 Add card). */
  spacing?: "md" | "lg";
  /** The detected network's badge inside the number field (03.03 Add card). */
  showNetwork?: boolean;
  /** A saved card: its number can't change, so it shows masked and isn't validated. */
  existing?: { network: CardNetwork; last4: string };
  /** Every change, e.g. for a live preview of the card. */
  onValuesChange?: (values: CardFormValues) => void;
  className?: string;
}

export function CardForm({
  ref,
  id: idProp,
  defaultValues,
  now,
  labels = CARD_FORM_LABELS,
  spacing = "md",
  showNetwork = false,
  existing,
  onValuesChange,
  className,
}: CardFormProps) {
  const generatedId = useId();
  const baseId = idProp ?? generatedId;
  const fieldId = (field: CardField) => `${baseId}-${field}`;
  const [values, setValues] = useState<CardFormValues>({ ...EMPTY_CARD, ...defaultValues });
  const [errors, setErrors] = useState<CardErrors>({});
  const [askCvcAgain, setAskCvcAgain] = useState(false);

  const fieldLabel: Record<CardField, string> = {
    number: labels.number,
    expiry: labels.expiry,
    cvc: labels.cvc,
    holderName: labels.holderName,
  };

  function setFieldError(field: CardField, next: CardFormValues) {
    setErrors((current) => ({
      ...current,
      [field]: validateCardField(field, next, labels.errors, now),
    }));
  }

  function change(field: CardField, raw: string) {
    const value =
      field === "number"
        ? formatCardNumber(raw)
        : field === "expiry"
          ? formatExpiry(raw)
          : field === "cvc"
            ? raw.replace(/\D/g, "").slice(0, 4)
            : raw;
    const next = { ...values, [field]: value };
    setValues(next);
    onValuesChange?.(next);
    if (field === "cvc") setAskCvcAgain(false);
    if (errors[field]) setFieldError(field, next);
  }

  function blur(field: CardField) {
    if (values[field].trim() || errors[field]) setFieldError(field, values);
  }

  useImperativeHandle(ref, () => ({
    validate: () => {
      const checked = validateCard(values, labels.errors, now);
      const found = existing ? { ...checked, number: undefined } : checked;
      setErrors(found);
      const invalid = CARD_FIELDS.filter((field) => found[field]);
      const expiry = parseExpiry(values.expiry);
      const digits = cardDigits(values.number);
      const network = existing?.network ?? cardNetwork(digits);
      if (invalid.length > 0 || !expiry || !network) {
        return {
          ok: false,
          errors: invalid.map((field) => ({
            field,
            id: fieldId(field),
            label: fieldLabel[field],
            message: found[field] ?? "",
          })),
        };
      }
      return {
        ok: true,
        card: {
          number: digits,
          network,
          expiryMonth: expiry.month,
          expiryYear: expiry.year,
          cvc: values.cvc,
          holderName: values.holderName.trim(),
        },
      };
    },
    clearSecurityCode: () => {
      setValues((current) => ({ ...current, cvc: "" }));
      setErrors((current) => ({ ...current, cvc: undefined }));
      setAskCvcAgain(true);
    },
  }));

  const field = (name: CardField) => ({
    id: fieldId(name),
    name: `card-${name}`,
    label: fieldLabel[name],
    value: values[name],
    placeholder: labels.placeholders[name],
    errorText: errors[name],
    required: true,
    spellCheck: false,
    onChange: (event: { target: { value: string } }) => change(name, event.target.value),
    onBlur: () => blur(name),
  });

  const network = existing?.network ?? cardNetwork(cardDigits(values.number));
  return (
    <div
      className={cn(
        "grid grid-cols-2",
        spacing === "lg" ? "gap-x-8 gap-y-20" : "gap-12 tablet:gap-x-16",
        className,
      )}
    >
      {existing ? (
        <TextInput
          id={fieldId("number")}
          label={labels.number}
          value={`•••• •••• •••• ${existing.last4}`}
          disabled
          action={showNetwork ? <PaymentNetwork network={existing.network} /> : undefined}
          className="col-span-2"
        />
      ) : (
        <TextInput
          {...field("number")}
          inputMode="numeric"
          autoComplete="cc-number"
          maxLength={23}
          action={showNetwork && network ? <PaymentNetwork network={network} /> : undefined}
          className="col-span-2"
        />
      )}
      <TextInput {...field("expiry")} inputMode="numeric" autoComplete="cc-exp" maxLength={7} />
      <TextInput
        {...field("cvc")}
        inputMode="numeric"
        autoComplete="cc-csc"
        maxLength={4}
        helperText={askCvcAgain ? labels.cvcAgain : undefined}
      />
      <TextInput
        {...field("holderName")}
        autoComplete="cc-name"
        helperText={labels.holderHelper}
        className="col-span-2"
      />
    </div>
  );
}
