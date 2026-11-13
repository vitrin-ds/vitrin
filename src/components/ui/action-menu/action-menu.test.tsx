import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ActionMenu } from "./action-menu";

function setup() {
  const onEdit = vi.fn();
  const view = render(
    <>
      <ActionMenu
        label="More actions for Home"
        items={[
          { label: "Edit", icon: "edit_square", onSelect: onEdit },
          { label: "Delete", icon: "delete", onSelect: vi.fn() },
        ]}
      />
      <button type="button">Outside</button>
    </>,
  );
  return { ...view, onEdit, trigger: screen.getByRole("button", { name: /More actions/ }) };
}

describe("ActionMenu", () => {
  it("opens on the first item and runs the chosen one, focus back on the button", async () => {
    const user = userEvent.setup();
    const { container, onEdit, trigger } = setup();
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await expectNoAxeViolations(container);
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("moves with the arrows and wraps, and Escape closes it", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("closes when the pointer presses outside", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("passes over a disabled item, which does nothing", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(
      <ActionMenu
        label="Menu"
        items={[
          { label: "Skip", icon: "check_circle", onSelect: onSkip, disabled: true },
          { label: "Go", icon: "delete", onSelect: vi.fn() },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("menuitem", { name: "Go" })).toHaveFocus();
    await user.click(screen.getByRole("menuitem", { name: "Skip" }));
    expect(onSkip).not.toHaveBeenCalled();
  });
});
