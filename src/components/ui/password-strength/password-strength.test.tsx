import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { PasswordStrength } from "./password-strength";

describe("PasswordStrength", () => {
  it("fills the bars from the left and says the verdict", async () => {
    const { container } = render(<PasswordStrength label="STRENGTH" score={3} verdict="Good" />);
    expect(screen.getByText("Good")).toHaveClass("text-text-success");
    expect(container.querySelectorAll(".bg-border-success")).toHaveLength(3);
    expect(container.querySelectorAll(".bg-surface-neutral")).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it("warns below Good and stays silent with nothing typed", () => {
    const { rerender, container } = render(
      <PasswordStrength label="STRENGTH" score={1} verdict="Weak" />,
    );
    expect(screen.getByText("Weak")).toHaveClass("text-text-error");
    rerender(<PasswordStrength label="STRENGTH" score={0} verdict="Too weak" />);
    expect(screen.queryByText("Too weak")).toBeNull();
    expect(container.querySelectorAll(".bg-surface-neutral")).toHaveLength(4);
  });
});
