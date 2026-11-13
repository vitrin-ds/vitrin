import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/button";
import { expectNoAxeViolations } from "@/test/axe";
import { tokenContrast } from "@/test/token-contrast";
import { TextInput, TEXT_INPUT_DEFAULTS } from "./text-input";

describe("TextInput", () => {
  it("labels the input and defaults to the Medium size", async () => {
    const { container } = render(<TextInput label="Email" placeholder="email@example.com" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(TEXT_INPUT_DEFAULTS).toEqual({ size: "md", tone: "default" });
    expect(input).toHaveClass("py-16");
    expect(input.parentElement).toHaveClass("px-16", "rounded-control");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    await expectNoAxeViolations(container);
  });

  it("links the helper text with aria-describedby", () => {
    render(<TextInput label="Phone" helperText="We only call about deliveries." />);
    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(input).toHaveAccessibleDescription("We only call about deliveries.");
  });

  it("replaces the helper with the error and marks the input invalid", async () => {
    const { container } = render(
      <TextInput label="Email" helperText="Used for receipts" errorText="Enter a valid email" />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email");
    expect(screen.queryByText("Used for receipts")).toBeNull();
    expect(input.parentElement!.className).toMatch(/inset-ring-\(--th-input-border-error\)/);
    await expectNoAxeViolations(container);
  });

  it("marks required fields natively and hides the asterisk from the name", () => {
    render(<TextInput label="Postcode" required />);
    const input = screen.getByRole("textbox", { name: "Postcode" });
    expect(input).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the required asterisk in text-disabled when disabled", () => {
    render(<TextInput label="City" required disabled />);
    expect(screen.getByText("*").className).toMatch(/text-\(--th-input-text-disabled\)/);
  });

  it("is not editable when disabled", async () => {
    render(<TextInput label="Country" disabled defaultValue="Netherlands" />);
    const input = screen.getByRole("textbox", { name: "Country" });
    expect(input).toBeDisabled();
    await userEvent.type(input, "x");
    expect(input).toHaveValue("Netherlands");
    expect(input.parentElement!.className).toMatch(/bg-\(--th-input-bg-disabled\)/);
  });

  it("shows the Modified state and decorative icons", () => {
    const { container } = render(
      <TextInput label="Search" modified leftIcon="search" rightIcon="visibility" />,
    );
    const box = screen.getByRole("textbox", { name: "Search" }).parentElement!;
    expect(box.className).toMatch(/bg-\(--th-input-bg-modified\)/);
    const icons = container.querySelectorAll("[data-icon]");
    expect(icons).toHaveLength(2);
    for (const icon of icons) expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("uses only input-* component tokens for colour", () => {
    render(<TextInput label="Name" errorText="Required" required />);
    const input = screen.getByRole("textbox", { name: "Name" });
    const classes = [input, input.parentElement!, screen.getByText("Required")]
      .flatMap((el) => el.className.split(" "))
      .filter((c) => /(^|:)(bg|text|inset-ring|placeholder:text)-\(/.test(c));
    for (const c of classes) expect(c).toMatch(/\(--th-input-/);
  });

  it("uses the on-accent message tokens and focus ring with Tone On Accent", () => {
    const { rerender } = render(
      <TextInput label="Email" tone="on-accent" helperText="We never share it" />,
    );
    expect(screen.getByText("We never share it")).toHaveClass(
      "text-(--th-input-text-helper-on-accent)",
    );
    rerender(<TextInput label="Email" tone="on-accent" errorText="Enter a valid email" />);
    expect(screen.getByText("Enter a valid email")).toHaveClass(
      "text-(--th-input-text-error-on-accent)",
    );
  });

  // Figma Text Input State=Focus: no outer ring; the box's border and shadow show focus.
  it("shows focus with the border and shadow on the box, not a focus ring", () => {
    render(<TextInput label="Email" />);
    const box = screen.getByRole("textbox").parentElement!;
    expect(box).toHaveClass(
      "focus-within:shadow-base",
      "focus-within:inset-ring-(--th-input-border-focus)",
      "focus-visible:outline-none",
    );
    expect(box.className).not.toMatch(/focus-ring/);
    expect(screen.getByRole("textbox")).toHaveClass("outline-none");
  });

  // WCAG 1.4.11: the focus border is the indicator, ≥ 3:1 against the box fill and the resting
  // border it replaces.
  it.each(["light", "dark"] as const)("keeps the focus border at 3:1 or more (%s)", (theme) => {
    expect(tokenContrast("input-border-focus", "input-bg", theme)).toBeGreaterThanOrEqual(3);
    expect(tokenContrast("input-border-focus", "input-border", theme)).toBeGreaterThanOrEqual(3);
  });

  describe("action", () => {
    function setup(errorText?: string) {
      const onApply = vi.fn();
      const utils = render(
        <TextInput
          label="Promo code"
          errorText={errorText}
          action={
            <Button size="sm" variant="outline" onClick={onApply}>
              Apply
            </Button>
          }
        />,
      );
      const input = screen.getByRole("textbox", { name: "Promo code" });
      const button = screen.getByRole("button", { name: "Apply" });
      return { ...utils, input, button, onApply };
    }

    it("renders the action inside the box, after the input and outside it", async () => {
      const { container, input, button } = setup();
      const box = input.parentElement!;
      expect(box).toContainElement(button);
      expect(input).not.toContainElement(button);
      expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(box).toHaveClass("pe-8");
      expect(input).toHaveAccessibleName("Promo code");
      await expectNoAxeViolations(container);
    });

    it("is reached with Tab after the input and activates with Enter / Space", async () => {
      const { input, button, onApply } = setup();
      await userEvent.tab();
      expect(input).toHaveFocus();
      await userEvent.tab();
      expect(button).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard(" ");
      expect(onApply).toHaveBeenCalledTimes(2);
    });

    it("keeps the box's error border and the message under the box", async () => {
      const { container, input, button } = setup("This code has expired");
      const box = input.parentElement!;
      expect(box).toHaveClass("inset-ring-(--th-input-border-error)");
      expect(box).toContainElement(button);
      expect(input).toHaveAccessibleDescription("This code has expired");
      expect(box).not.toContainElement(screen.getByText("This code has expired"));
      await expectNoAxeViolations(container);
    });

    it("leaves the box's end padding alone without an action", () => {
      render(<TextInput label="Email" />);
      expect(screen.getByRole("textbox").parentElement).not.toHaveClass("pe-8");
    });
  });
});
