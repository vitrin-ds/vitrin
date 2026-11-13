import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { FLOATING_ACTION_BUTTON_DEFAULTS, FloatingActionButton } from "./floating-action-button";

describe("FloatingActionButton", () => {
  it("defaults to Filled · Large, is named and has no axe violations", async () => {
    const { container } = render(<FloatingActionButton icon="add" aria-label="Add" />);
    const button = screen.getByRole("button", { name: "Add" });
    expect(FLOATING_ACTION_BUTTON_DEFAULTS).toEqual({ variant: "filled", size: "lg" });
    expect(button).toHaveClass("bg-interactive-default", "size-52", "rounded-full", "shadow-lg");
    expect(button).toHaveAttribute("type", "button");
    await expectNoAxeViolations(container);
  });

  it("acts, and does nothing when disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <FloatingActionButton icon="add" aria-label="Add" onClick={onClick} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<FloatingActionButton icon="add" aria-label="Add" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps a 44px hit area on Small", () => {
    render(<FloatingActionButton icon="add" aria-label="Add" size="sm" variant="outline" />);
    expect(screen.getByRole("button")).toHaveClass("size-36", "before:-inset-4", "inset-ring");
  });
});
