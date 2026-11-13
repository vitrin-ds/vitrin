"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/cn";
import { countryName } from "@/lib/format/address";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Dropdown } from "@/components/ui/dropdown/dropdown";
import { Link } from "@/components/ui/link/link";
import { TextInput } from "@/components/ui/text-input/text-input";
import {
  ADDRESS_ERROR_MESSAGES,
  ADDRESS_FIELDS,
  EMPTY_ADDRESS,
  isNumericPostalCode,
  validateAddress,
  validateAddressField,
  type AddressErrorMessages,
  type AddressErrors,
  type AddressField,
  type AddressFormValues,
} from "./address-validation";

// Figma pattern `Address Form` (03. PATTERNS › Cart & Checkout, 31511:2; used in WD/WT/WM.09.03.02
// Checkout — Guest): a title (headline-large) over Medium Text Inputs and the Country Dropdown,
// gap 12. Rows as on a postal label: First / Last name · Country / Postcode · Address line 1 ·
// Address line 2 / Town or City · Phone (with its help message). Two fields per row from tablet
// up (gap 16), one per row on mobile except the name pair (gap 12).
//
// Behaviour (Figma Do: validate after the field loses focus): a field is checked on blur once it
// has a value or already shows an error, and re-checked on every change after that. Submit checks
// everything; with errors, an error summary (Alert, Negative) at the top lists each message as a
// link to its field and takes focus. Nothing is cleared on an error (Figma Don't).
//
// `as="fields"`: the same fields without a <form> of their own, for a page that submits several
// sections with one button (WD.09.03.02 Checkout — Guest: one Pay button). The page calls
// `ref.current.validate()`, which checks every field as submit does and returns the values, or
// the errors (field id, label, message) for the page's own error summary.

export interface AddressFormLabels {
  firstName: string;
  lastName: string;
  country: string;
  countryPlaceholder: string;
  postalCode: string;
  line1: string;
  line2: string;
  city: string;
  phone: string;
  /** Figma `Help Message Text` under the phone field. */
  phoneHelper: string;
  useAsBilling: string;
  /** Example values shown as placeholders (Figma `Placeholder Text`). */
  placeholders: Partial<Record<AddressField, string>>;
  errorSummaryTitle: string;
  errors: AddressErrorMessages;
}

export const ADDRESS_FORM_LABELS: AddressFormLabels = {
  firstName: "First name",
  lastName: "Last name",
  country: "Country",
  countryPlaceholder: "Select",
  postalCode: "Postcode",
  line1: "Address line 1",
  line2: "Address line 2",
  city: "Town / City",
  phone: "Phone number",
  phoneHelper: "Only used if the courier needs to reach you",
  useAsBilling: "Use as billing address",
  placeholders: {
    firstName: "Ada",
    lastName: "Smith",
    postalCode: "NW1 8AB",
    line1: "42 Camden Lock Place",
    line2: "Flat, apartment, building",
    city: "London",
    phone: "+44 7700 900245",
  },
  errorSummaryTitle: "Check your address",
  errors: ADDRESS_ERROR_MESSAGES,
};

export const ADDRESS_FORM_DEFAULTS = {
  section: "shipping",
  headingLevel: 2,
  locale: "en",
  countries: ["GB", "IE", "DE", "FR", "NL", "BE", "ES", "IT", "AT", "DK", "SE"],
} as const;

export interface AddressFormSubmit extends AddressFormValues {
  /** The "use as billing address" choice; always false for a billing form. */
  useAsBilling: boolean;
}

/** One invalid field, for a page-level error summary (`as="fields"`). */
export interface AddressFormFieldError {
  field: AddressField;
  /** The control's id, for the summary link. */
  id: string;
  label: string;
  message: string;
}

export type AddressFormValidation =
  { ok: true; values: AddressFormSubmit } | { ok: false; errors: AddressFormFieldError[] };

export interface AddressFormHandle {
  /** Checks every field (showing their errors) and returns the values or the errors in order. */
  validate: () => AddressFormValidation;
}

export interface AddressFormProps {
  /** Form id: lets a button elsewhere submit it (`<button form={id}>`, Checkout Steps' Continue). */
  id?: string;
  /** `form` (default) submits itself; `fields` sits inside a page's form (see `ref`). */
  as?: "form" | "fields";
  /** `validate()` for `as="fields"`. */
  ref?: Ref<AddressFormHandle>;
  /** Shows "use as billing address" on a shipping form (default). */
  offerBilling?: boolean;
  /** Figma `Title` ("Delivery address"). Leave it out inside a section that has the heading. */
  title?: string;
  headingLevel?: 2 | 3 | 4;
  defaultValues?: Partial<AddressFormValues>;
  /** ISO 3166-1 alpha-2 codes for the Country Dropdown, named with Intl.DisplayNames. */
  countries?: readonly string[];
  /** Autofill section; a shipping form also offers "use as billing address". */
  section?: "shipping" | "billing";
  /** Initial state of "use as billing address". */
  defaultUseAsBilling?: boolean;
  /** Called with trimmed values once every field is valid (`as="form"`). */
  onSubmit?: (values: AddressFormSubmit) => void;
  /** Renders the form's own submit button. Leave it out when an outside button submits it. */
  submitLabel?: ReactNode;
  locale?: string;
  labels?: AddressFormLabels;
  className?: string;
}

function trimValues(values: AddressFormValues): AddressFormValues {
  return Object.fromEntries(
    ADDRESS_FIELDS.map((field) => [field, values[field].trim()]),
  ) as unknown as AddressFormValues;
}

export function AddressForm({
  id: idProp,
  as = "form",
  ref,
  offerBilling = true,
  title,
  headingLevel = ADDRESS_FORM_DEFAULTS.headingLevel,
  defaultValues,
  countries = ADDRESS_FORM_DEFAULTS.countries,
  section = ADDRESS_FORM_DEFAULTS.section,
  defaultUseAsBilling = true,
  onSubmit,
  submitLabel,
  locale = ADDRESS_FORM_DEFAULTS.locale,
  labels = ADDRESS_FORM_LABELS,
  className,
}: AddressFormProps) {
  const generatedId = useId();
  const formId = idProp ?? generatedId;
  const fieldId = (field: AddressField) => `${formId}-${field}`;
  const summaryId = `${formId}-error-summary`;
  const Heading = `h${headingLevel}` as const;

  const [values, setValues] = useState<AddressFormValues>({ ...EMPTY_ADDRESS, ...defaultValues });
  const [errors, setErrors] = useState<AddressErrors>({});
  const [summary, setSummary] = useState<readonly AddressField[]>([]);
  const [useAsBilling, setUseAsBilling] = useState(defaultUseAsBilling);
  const focusSummary = useRef(false);

  useEffect(() => {
    if (!focusSummary.current) return;
    focusSummary.current = false;
    document.getElementById(summaryId)?.focus();
  }, [summary, summaryId]);

  function setFieldError(field: AddressField, next: AddressFormValues) {
    const error = validateAddressField(field, next, labels.errors);
    setErrors((current) => ({ ...current, [field]: error }));
    // The summary keeps its order and drops fields as they are fixed.
    if (!error) setSummary((current) => current.filter((f) => f !== field));
  }

  function change(field: AddressField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setFieldError(field, next);
    // A new country changes what a valid postcode is.
    if (field === "countryCode" && next.postalCode.trim()) setFieldError("postalCode", next);
  }

  function blur(field: AddressField) {
    if (values[field].trim() || errors[field]) setFieldError(field, values);
  }

  const fieldLabel: Record<AddressField, string> = {
    firstName: labels.firstName,
    lastName: labels.lastName,
    countryCode: labels.country,
    postalCode: labels.postalCode,
    line1: labels.line1,
    line2: labels.line2,
    city: labels.city,
    phone: labels.phone,
  };

  function check(): { invalid: AddressField[]; found: AddressErrors } {
    const found = validateAddress(values, labels.errors);
    setErrors(found);
    return { invalid: ADDRESS_FIELDS.filter((field) => found[field]), found };
  }

  const submitted = (): AddressFormSubmit => ({
    ...trimValues(values),
    useAsBilling: section === "shipping" && offerBilling && useAsBilling,
  });

  useImperativeHandle(ref, () => ({
    validate: () => {
      const { invalid, found } = check();
      if (invalid.length === 0) return { ok: true, values: submitted() };
      return {
        ok: false,
        errors: invalid.map((field) => ({
          field,
          id: fieldId(field),
          label: fieldLabel[field],
          message: found[field] ?? "",
        })),
      };
    },
  }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { invalid } = check();
    if (invalid.length > 0) {
      focusSummary.current = true;
      setSummary(invalid);
      return;
    }
    setSummary([]);
    onSubmit?.(submitted());
  }

  function jumpTo(event: MouseEvent<HTMLAnchorElement>, field: AddressField) {
    event.preventDefault();
    const target = document.getElementById(fieldId(field));
    target?.focus();
    target?.scrollIntoView({ block: "center" });
  }

  const text = (field: Exclude<AddressField, "countryCode">) => ({
    id: fieldId(field),
    name: field,
    value: values[field],
    placeholder: labels.placeholders[field],
    errorText: errors[field],
    onChange: (event: { target: { value: string } }) => change(field, event.target.value),
    onBlur: () => blur(field),
  });

  const autofill = (token: string) => `${section} ${token}`;
  const countryOptions = countries.map((code) => ({
    value: code,
    label: countryName(code, locale),
  }));
  const content = (
    <>
      {title && <Heading className="text-headline-lg text-text-primary">{title}</Heading>}

      {summary.length > 0 && (
        <Alert
          id={summaryId}
          tabIndex={-1}
          usage="negative"
          width="card"
          title={labels.errorSummaryTitle}
        >
          {/* Neutral links: Link error (text-error) on the Negative alert fill is 3.95:1. */}
          <ul className="flex flex-col gap-4">
            {summary.map((field) => (
              <li key={field}>
                <Link
                  href={`#${fieldId(field)}`}
                  size="inline"
                  variant="neutral"
                  onClick={(event) => jumpTo(event, field)}
                >
                  {fieldLabel[field]}: {errors[field]}
                </Link>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-x-12 gap-y-12 tablet:gap-x-16">
        <TextInput
          {...text("firstName")}
          label={labels.firstName}
          required
          autoComplete={autofill("given-name")}
          autoCapitalize="words"
          spellCheck={false}
        />
        <TextInput
          {...text("lastName")}
          label={labels.lastName}
          required
          autoComplete={autofill("family-name")}
          autoCapitalize="words"
          spellCheck={false}
        />
        <Dropdown
          id={fieldId("countryCode")}
          name="countryCode"
          label={labels.country}
          placeholder={labels.countryPlaceholder}
          options={countryOptions}
          value={values.countryCode || null}
          onValueChange={(code) => change("countryCode", code)}
          onBlur={() => blur("countryCode")}
          autoComplete={autofill("country")}
          errorText={errors.countryCode}
          required
          className="col-span-2 tablet:col-span-1"
        />
        <TextInput
          {...text("postalCode")}
          label={labels.postalCode}
          required
          autoComplete={autofill("postal-code")}
          autoCapitalize="characters"
          inputMode={isNumericPostalCode(values.countryCode) ? "numeric" : "text"}
          spellCheck={false}
          className="col-span-2 tablet:col-span-1"
        />
        <TextInput
          {...text("line1")}
          label={labels.line1}
          required
          autoComplete={autofill("address-line1")}
          className="col-span-2"
        />
        <TextInput
          {...text("line2")}
          label={labels.line2}
          autoComplete={autofill("address-line2")}
          className="col-span-2 tablet:col-span-1"
        />
        <TextInput
          {...text("city")}
          label={labels.city}
          required
          autoComplete={autofill("address-level2")}
          className="col-span-2 tablet:col-span-1"
        />
        <TextInput
          {...text("phone")}
          label={labels.phone}
          helperText={labels.phoneHelper}
          required
          type="tel"
          autoComplete={autofill("tel")}
          className="col-span-2"
        />
        {section === "shipping" && offerBilling && (
          <Checkbox
            name="useAsBilling"
            label={labels.useAsBilling}
            checked={useAsBilling}
            onChange={(event) => setUseAsBilling(event.target.checked)}
            className="col-span-2 justify-self-start"
          />
        )}
      </div>

      {submitLabel && as === "form" && (
        <div className="flex">
          <Button type="submit">{submitLabel}</Button>
        </div>
      )}
    </>
  );

  const rootClassName = cn("flex flex-col gap-12", className);
  return as === "form" ? (
    <form id={formId} noValidate onSubmit={submit} className={rootClassName}>
      {content}
    </form>
  ) : (
    <div className={rootClassName}>{content}</div>
  );
}
