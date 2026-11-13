import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { TextInput } from "./text-input";
import { usePasswordToggle } from "./use-password-toggle";

function Field({ disabled }: { disabled?: boolean }) {
  const toggle = usePasswordToggle("pw", { disabled });
  return <TextInput label="Password" {...toggle} />;
}

describe("usePasswordToggle", () => {
  it("masks by default and the Right Icon button reveals the value", async () => {
    const { container } = render(<Field />);
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("aria-controls", "pw");
    await userEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expectNoAxeViolations(container);
  });

  it("disables the toggle with the field", () => {
    render(<Field disabled />);
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });
});
