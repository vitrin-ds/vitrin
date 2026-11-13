import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Stepper, STEPPER_DEFAULTS } from "./stepper";

describe("Stepper", () => {
  it("is a named spinbutton between decrease and increase buttons", async () => {
    const { container } = render(<Stepper label="Quantity" defaultValue={2} />);
    const spin = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(STEPPER_DEFAULTS).toEqual({ variant: "box", size: "md", min: 1, max: 99, step: 1 });
    expect(spin).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeEnabled();
    await expectNoAxeViolations(container);
  });

  it("steps with the buttons and stops at min and max", async () => {
    const onValueChange = vi.fn();
    render(<Stepper label="Quantity" defaultValue={2} max={3} onValueChange={onValueChange} />);
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    await userEvent.click(plus);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "3");
    expect(plus).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    await userEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([3, 2, 1]);
  });

  it("keeps the surface at min / max and greys out only the icon (Figma At Min / At Max)", () => {
    render(<Stepper label="Quantity" defaultValue={1} />);
    const minus = screen.getByRole("button", { name: "Decrease quantity" });
    expect(minus).toBeDisabled();
    expect(minus).toHaveClass("bg-surface-primary", "shadow-sm", "text-icon-disabled");
    expect(minus.className).not.toMatch(/hover:/);
    expect(screen.getByRole("button", { name: "Increase quantity" })).toHaveClass(
      "text-icon-primary",
    );
  });

  it("follows the APG spinbutton keys", async () => {
    render(<Stepper label="Quantity" defaultValue={5} max={20} />);
    const spin = screen.getByRole("spinbutton", { name: "Quantity" });
    spin.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(spin).toHaveAttribute("aria-valuenow", "6");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(spin).toHaveAttribute("aria-valuenow", "4");
    await userEvent.keyboard("{End}");
    expect(spin).toHaveAttribute("aria-valuenow", "20");
    await userEvent.keyboard("{Home}");
    expect(spin).toHaveAttribute("aria-valuenow", "1");
    await userEvent.keyboard("{PageUp}");
    expect(spin).toHaveAttribute("aria-valuenow", "11");
  });

  it("does nothing when disabled and submits through a hidden input", async () => {
    const { container } = render(<Stepper label="Quantity" defaultValue={2} disabled name="qty" />);
    const spin = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(spin).toHaveAttribute("aria-disabled", "true");
    expect(spin).toHaveAttribute("tabindex", "-1");
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    expect(plus).toBeDisabled();
    expect(plus).toHaveClass("bg-surface-disabled", "shadow-none");
    expect(container.querySelector('input[name="qty"]')).toHaveValue("2");
  });

  it("marks the error state", () => {
    render(<Stepper label="Quantity" error />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-invalid", "true");
  });

  it("draws the cart variants: inline (− 3 +) and pill (+ 3 − stacked)", async () => {
    const { container, rerender } = render(
      <Stepper label="Quantity" variant="inline" defaultValue={1} max={3} />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass("gap-12", "rounded-4", "p-6");
    expect(screen.getByRole("spinbutton")).toHaveClass("text-title-md");
    const minus = screen.getByRole("button", { name: "Decrease quantity" });
    expect(minus).toBeDisabled();
    expect(minus).toHaveClass("text-icon-accent", "before:-inset-12");
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "2");
    await expectNoAxeViolations(container);

    rerender(<Stepper label="Quantity" variant="pill" defaultValue={2} />);
    expect(container.firstElementChild).toHaveClass("flex-col-reverse", "rounded-16");
  });
});
