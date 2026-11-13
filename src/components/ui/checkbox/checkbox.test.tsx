import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("is a native checkbox named by its label", async () => {
    const { container } = render(<Checkbox label="Keep me signed in" />);
    const box = screen.getByRole("checkbox", { name: "Keep me signed in" });
    expect(box).not.toBeChecked();
    expect(box).toHaveClass("peer", "sr-only");
    await expectNoAxeViolations(container);
  });

  it("toggles with a click on the label and with Space", async () => {
    render(<Checkbox label="Gift wrap" />);
    const box = screen.getByRole("checkbox", { name: "Gift wrap" });
    await userEvent.click(screen.getByText("Gift wrap"));
    expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).not.toBeChecked();
  });

  it("draws the Figma glyphs and hides them from assistive technology", () => {
    const { container } = render(<Checkbox label="Newsletter" />);
    const names = [...container.querySelectorAll("[data-icon]")].map((el) =>
      el.getAttribute("data-icon"),
    );
    expect(names).toEqual(["check_box_outline_blank", "check_box"]);
    for (const el of container.querySelectorAll("[data-icon]"))
      expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("sets the indeterminate DOM state and glyph", () => {
    const { container } = render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(container.querySelector("[data-icon]")).toHaveAttribute(
      "data-icon",
      "indeterminate_check_box",
    );
  });

  it("darkens on hover and never underlines the label", () => {
    const { container } = render(<Checkbox label="Gift wrap" />);
    expect(container.querySelector("label > span")).toHaveClass(
      "peer-enabled:group-hover:text-interactive-hover",
    );
    expect(screen.getByText("Gift wrap").className).not.toMatch(/underline/);
  });

  it("marks the error state with aria-invalid", async () => {
    const { container } = render(<Checkbox label="I accept the terms" error required />);
    expect(screen.getByRole("checkbox", { name: "I accept the terms" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expectNoAxeViolations(container);
  });

  it("keeps a hidden label for screen readers", () => {
    render(<Checkbox label="Select row" hideLabel />);
    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeInTheDocument();
    expect(screen.getByText("Select row")).toHaveClass("sr-only");
  });

  it("does not change when disabled", async () => {
    render(<Checkbox label="Express" disabled />);
    const box = screen.getByRole("checkbox", { name: "Express" });
    await userEvent.click(screen.getByText("Express"));
    expect(box).not.toBeChecked();
  });
});
