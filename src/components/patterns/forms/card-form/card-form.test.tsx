import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardForm, type CardFormHandle, type CardFormValidation } from "./card-form";
import { validateCard } from "./card-validation";

const NOW = new Date("2026-10-31T12:00:00Z");

function validate(ref: React.RefObject<CardFormHandle | null>): CardFormValidation {
  let result: CardFormValidation | undefined;
  act(() => {
    result = ref.current?.validate();
  });
  if (!result) throw new Error("no handle");
  return result;
}

describe("card validation", () => {
  it("checks the number, expiry, security code and name", () => {
    expect(
      validateCard({ number: "", expiry: "", cvc: "", holderName: "" }, undefined, NOW),
    ).toEqual({
      number: "Enter your card number.",
      expiry: "Enter the expiry date.",
      cvc: "Enter the security code.",
      holderName: "Enter the name as shown on your card.",
    });
    expect(
      validateCard(
        { number: "4242 4242 4242 4241", expiry: "13/28", cvc: "12", holderName: "Ada" },
        undefined,
        NOW,
      ),
    ).toEqual({
      number: "Enter a valid Visa, Mastercard, Amex or JCB card number.",
      expiry: "Enter the expiry date as MM / YY.",
      cvc: "Enter the 3-digit security code.",
    });
    expect(
      validateCard(
        { number: "3782 822463 10005", expiry: "09 / 26", cvc: "123", holderName: "Ada" },
        undefined,
        NOW,
      ),
    ).toEqual({
      expiry: "This card has expired. Use another card.",
      cvc: "Enter the 4-digit security code.",
    });
  });
});

describe("CardForm", () => {
  it("labels the card fields with cc-* autocomplete and numeric keyboards", async () => {
    const { container } = render(<CardForm now={NOW} />);
    const number = screen.getByRole("textbox", { name: /^Card number/ });
    expect(number).toHaveAttribute("autocomplete", "cc-number");
    expect(number).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByRole("textbox", { name: /^Expiry date/ })).toHaveAttribute(
      "autocomplete",
      "cc-exp",
    );
    expect(screen.getByRole("textbox", { name: /^Security code/ })).toHaveAttribute(
      "autocomplete",
      "cc-csc",
    );
    expect(screen.getByRole("textbox", { name: /^Name on card/ })).toHaveAttribute(
      "autocomplete",
      "cc-name",
    );
    expect(container.querySelector("form")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("formats as typed and validates on blur", async () => {
    render(<CardForm now={NOW} />);
    const number = screen.getByRole("textbox", { name: /^Card number/ });
    await userEvent.type(number, "4242424242424241");
    expect(number).toHaveValue("4242 4242 4242 4241");
    fireEvent.blur(number);
    expect(number).toHaveAttribute("aria-invalid", "true");
    expect(number).toHaveAccessibleDescription(
      "Enter a valid Visa, Mastercard, Amex or JCB card number.",
    );
    const expiry = screen.getByRole("textbox", { name: /^Expiry date/ });
    await userEvent.type(expiry, "0828");
    expect(expiry).toHaveValue("08 / 28");
  });

  it("returns the errors in order, then the parsed card once valid", async () => {
    const ref = createRef<CardFormHandle>();
    render(<CardForm ref={ref} id="card" now={NOW} />);
    const invalid = validate(ref);
    if (invalid.ok) throw new Error("expected errors");
    expect(invalid.errors.map((error) => error.id)).toEqual([
      "card-number",
      "card-expiry",
      "card-cvc",
      "card-holderName",
    ]);

    await userEvent.type(screen.getByRole("textbox", { name: /^Card number/ }), "4242424242424242");
    await userEvent.type(screen.getByRole("textbox", { name: /^Expiry date/ }), "0828");
    await userEvent.type(screen.getByRole("textbox", { name: /^Security code/ }), "123");
    await userEvent.type(screen.getByRole("textbox", { name: /^Name on card/ }), " Ada Smith ");
    expect(validate(ref)).toEqual({
      ok: true,
      card: {
        number: "4242424242424242",
        network: "visa",
        expiryMonth: 8,
        expiryYear: 2028,
        cvc: "123",
        holderName: "Ada Smith",
      },
    });
  });

  it("asks for the security code again after a decline", () => {
    const ref = createRef<CardFormHandle>();
    render(<CardForm ref={ref} now={NOW} defaultValues={{ cvc: "123" }} />);
    act(() => ref.current?.clearSecurityCode());
    const cvc = screen.getByRole("textbox", { name: /^Security code/ });
    expect(cvc).toHaveValue("");
    expect(cvc).toHaveAccessibleDescription("Re-enter your security code");
  });
});
