import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { AddressForm, type AddressFormHandle, type AddressFormValidation } from "./address-form";
import { FILLED_ADDRESS, INVALID_ADDRESS, SAVED_ADDRESSES } from "./address-form.fixtures";
import { SavedAddressList } from "./saved-address-list";

describe("AddressForm", () => {
  it("labels every field with the right autocomplete token, input type and mode", async () => {
    const { container } = render(
      <AddressForm title="Delivery address" onSubmit={() => undefined} submitLabel="Save" />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Delivery address" })).toBeInTheDocument();
    const auto = (name: RegExp) =>
      screen.getByRole("textbox", { name }).getAttribute("autocomplete");
    expect(auto(/^First name/)).toBe("shipping given-name");
    expect(auto(/^Last name/)).toBe("shipping family-name");
    expect(auto(/^Postcode/)).toBe("shipping postal-code");
    expect(auto(/^Address line 1/)).toBe("shipping address-line1");
    expect(auto(/^Address line 2/)).toBe("shipping address-line2");
    expect(auto(/^Town \/ City/)).toBe("shipping address-level2");
    const phone = screen.getByRole("textbox", { name: /^Phone number/ });
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("autocomplete", "shipping tel");
    expect(phone).toHaveAccessibleDescription("Only used if the courier needs to reach you");
    expect(screen.getByRole("combobox", { name: /^Country/ })).toHaveAttribute(
      "aria-required",
      "true",
    );
    // The custom combobox mirrors into a hidden native select for submission and autofill.
    const nativeCountry = container.querySelector('select[name="countryCode"]');
    expect(nativeCountry).toHaveAttribute("autocomplete", "shipping country");
    expect(screen.getByRole("textbox", { name: /^Address line 2/ })).not.toBeRequired();
    expect(screen.getByRole("checkbox", { name: "Use as billing address" })).toBeChecked();
    await expectNoAxeViolations(container);
  });

  it("takes the country from browser autofill", () => {
    const { container } = render(<AddressForm onSubmit={() => undefined} />);
    const native = container.querySelector('select[name="countryCode"]') as HTMLSelectElement;
    fireEvent.change(native, { target: { value: "DE" } });
    expect(screen.getByRole("combobox", { name: /^Country/ })).toHaveTextContent("Germany");
    expect(screen.getByRole("textbox", { name: /^Postcode/ })).toHaveAttribute(
      "inputmode",
      "numeric",
    );
  });

  it("asks for the numeric keypad only where postcodes are digits", () => {
    render(<AddressForm onSubmit={() => undefined} defaultValues={{ countryCode: "DE" }} />);
    expect(screen.getByRole("textbox", { name: /^Postcode/ })).toHaveAttribute(
      "inputmode",
      "numeric",
    );
  });

  it("uses the billing section and drops the billing checkbox for a billing form", () => {
    render(<AddressForm section="billing" onSubmit={() => undefined} />);
    expect(screen.getByRole("textbox", { name: /^First name/ })).toHaveAttribute(
      "autocomplete",
      "billing given-name",
    );
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("on submit with errors, shows a summary that takes focus and links to each field", async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AddressForm onSubmit={onSubmit} submitLabel="Continue" defaultValues={INVALID_ADDRESS} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).not.toHaveBeenCalled();

    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(within(summary).getByText("Check your address")).toBeInTheDocument();
    const links = within(summary).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Last name: Enter your last name",
      "Postcode: Enter a real postcode, like NW1 8AB",
      "Town / City: Enter a town or city",
      "Phone number: Enter a phone number with 7 to 15 digits, like +44 7700 900245",
    ]);

    const postcode = screen.getByRole("textbox", { name: /^Postcode/ });
    expect(postcode).toHaveAttribute("aria-invalid", "true");
    expect(postcode).toHaveValue("12345"); // Figma Don't: never clear the form on an error.
    await userEvent.click(links[1]!);
    expect(postcode).toHaveFocus();

    await expectNoAxeViolations(container);
  });

  it("re-checks a field with an error as it changes and drops it from the summary", async () => {
    render(
      <AddressForm
        onSubmit={() => undefined}
        submitLabel="Continue"
        defaultValues={INVALID_ADDRESS}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    const city = screen.getByRole("textbox", { name: /^Town \/ City/ });
    await userEvent.type(city, "London");
    expect(city).not.toHaveAttribute("aria-invalid");
    expect(within(screen.getByRole("alert")).queryByText(/^Town \/ City/)).toBeNull();
  });

  it("validates on blur only once the field has a value", async () => {
    render(<AddressForm onSubmit={() => undefined} />);
    const phone = screen.getByRole("textbox", { name: /^Phone number/ });
    await userEvent.click(phone);
    await userEvent.tab();
    expect(phone).not.toHaveAttribute("aria-invalid");
    await userEvent.type(phone, "12");
    await userEvent.tab();
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAccessibleDescription(/7 to 15 digits/);
  });

  it("submits trimmed values and the billing choice once valid", async () => {
    const onSubmit = vi.fn();
    render(
      <AddressForm
        onSubmit={onSubmit}
        submitLabel="Continue"
        defaultValues={{ ...FILLED_ADDRESS, city: " London " }}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Use as billing address" }));
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onSubmit).toHaveBeenCalledWith({ ...FILLED_ADDRESS, useAsBilling: false });
  });

  it("chooses the country with the keyboard and re-checks the postcode for it", async () => {
    render(
      <AddressForm
        onSubmit={() => undefined}
        submitLabel="Continue"
        defaultValues={{ ...FILLED_ADDRESS, countryCode: "", postalCode: "10969" }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    const country = screen.getByRole("combobox", { name: /^Country/ });
    expect(country).toHaveAttribute("aria-invalid", "true");
    country.focus();
    await userEvent.keyboard("{Enter}{Enter}"); // opens, then picks the first: United Kingdom
    expect(country).toHaveTextContent("United Kingdom");
    expect(country).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox", { name: /^Postcode/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("can be submitted by an outside button through its id", async () => {
    const onSubmit = vi.fn();
    render(
      <>
        <AddressForm id="delivery" onSubmit={onSubmit} defaultValues={FILLED_ADDRESS} />
        <button type="submit" form="delivery">
          Next
        </button>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onSubmit).toHaveBeenCalledWith({ ...FILLED_ADDRESS, useAsBilling: true });
  });
});

describe("AddressForm as fields", () => {
  it("has no form of its own and validates through the ref", async () => {
    const ref = createRef<AddressFormHandle>();
    const { container } = render(
      <AddressForm as="fields" ref={ref} title="Delivery address" offerBilling={false} />,
    );
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();

    let result: AddressFormValidation | undefined;
    act(() => {
      result = ref.current?.validate();
    });
    if (!result || result.ok) throw new Error("expected errors");
    expect(result.errors[0]).toMatchObject({ field: "firstName", label: "First name" });
    expect(document.getElementById(result.errors[0].id)).toBe(
      screen.getByRole("textbox", { name: /^First name/ }),
    );
    // The page shows the summary: the fields show their own messages only.
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("textbox", { name: /^First name/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expectNoAxeViolations(container);
  });

  it("returns the trimmed values once valid", () => {
    const ref = createRef<AddressFormHandle>();
    render(
      <AddressForm as="fields" ref={ref} defaultValues={FILLED_ADDRESS} offerBilling={false} />,
    );
    let result: AddressFormValidation | undefined;
    act(() => {
      result = ref.current?.validate();
    });
    expect(result).toEqual({ ok: true, values: { ...FILLED_ADDRESS, useAsBilling: false } });
  });
});

describe("SavedAddressList", () => {
  function Saved({ onEdit }: { onEdit?: (id: string) => void }) {
    const [value, setValue] = useState<string | undefined>("home");
    return (
      <SavedAddressList
        label="Delivery address"
        addresses={SAVED_ADDRESSES}
        value={value}
        onValueChange={setValue}
        onEdit={onEdit}
      />
    );
  }

  it("is a radio group of Card.Address with Edit, moved with the arrow keys", async () => {
    const onEdit = vi.fn();
    const { container } = render(<Saved onEdit={onEdit} />);
    expect(screen.getByRole("radiogroup", { name: "Delivery address" })).toBeInTheDocument();
    const home = screen.getByRole("radio", { name: "Home" });
    expect(home).toHaveAttribute("aria-checked", "true");
    home.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Ada Studio" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("NW1 8AB London, United Kingdom")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Edit Office" }));
    expect(onEdit).toHaveBeenCalledWith("office");
    await expectNoAxeViolations(container);
  });
});
