import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { PASSWORD_REQUIREMENTS_LABELS, PasswordRequirements } from "./password-requirements";

describe("PasswordRequirements", () => {
  it("lists the API's rules, red until met", async () => {
    const { container } = render(<PasswordRequirements id="rules" password="abcdefgh" />);
    const region = screen.getByRole("region", { name: "Password requirements" });
    expect(region).toHaveClass("border-border-error", "rounded-card", "p-20");
    expect(PASSWORD_REQUIREMENTS_LABELS.rules.minLength).toBe("At least 8 characters");
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "At least 8 characters, met",
      "One letter, met",
      "One number, not met yet",
    ]);
    expect(items[0]).toHaveClass("text-text-success");
    expect(items[2]).toHaveClass("text-text-error");
    expect(items[2].querySelector("[data-icon]")).toHaveAttribute("data-icon", "cancel");
    await expectNoAxeViolations(container);
  });

  it("turns green when every rule is met", async () => {
    const { container } = render(<PasswordRequirements id="rules" password="Things-2026" />);
    expect(screen.getByRole("region")).toHaveClass("border-border-success");
    expect(screen.getByText("Password requirements")).toHaveClass("text-text-success");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveClass("text-text-success");
    }
    await expectNoAxeViolations(container);
  });
});
