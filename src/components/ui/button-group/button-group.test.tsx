import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { BUTTON_GROUP_DEFAULTS, ButtonGroup } from "./button-group";

const ITEMS = [
  { value: "grid", children: "Grid" },
  { value: "list", children: "List" },
  { value: "map", children: "Map", disabled: true },
];

describe("ButtonGroup", () => {
  it("names the group, marks the selected segment and has no axe violations", async () => {
    const { container } = render(
      <ButtonGroup label="View" items={ITEMS} value="list" onValueChange={() => {}} />,
    );
    expect(BUTTON_GROUP_DEFAULTS).toEqual({ variant: "accent", size: "md" });
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");
    await expectNoAxeViolations(container);
  });

  it("reports a choice, and ignores a disabled segment", async () => {
    const onValueChange = vi.fn();
    render(<ButtonGroup label="View" items={ITEMS} value="list" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Grid" }));
    await userEvent.click(screen.getByRole("button", { name: "Map" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("grid");
  });

  it("maps style and size to the Figma tokens", () => {
    render(
      <ButtonGroup
        label="View"
        items={ITEMS}
        value="list"
        onValueChange={() => {}}
        variant="white"
        size="sm"
      />,
    );
    const segment = screen.getByRole("button", { name: "Grid" });
    expect(segment).toHaveClass(
      "bg-surface-primary",
      "h-36",
      "first:rounded-l-control",
      "last:rounded-r-control",
    );
  });
});
