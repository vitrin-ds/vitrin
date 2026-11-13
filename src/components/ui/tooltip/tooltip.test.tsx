import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Tooltip } from "./tooltip";

function Info() {
  return (
    <Tooltip content="Delivered in 2–3 working days">
      <button type="button">Delivery</button>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("describes the trigger and stays hidden until needed", async () => {
    const { container } = render(<Info />);
    const trigger = screen.getByRole("button", { name: "Delivery" });
    expect(trigger).toHaveAccessibleDescription("Delivered in 2–3 working days");
    expect(screen.queryByRole("tooltip")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("shows on keyboard focus and hides on Escape and blur", async () => {
    render(<Info />);
    await userEvent.tab();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows on hover and hides on leave", async () => {
    render(<Info />);
    const trigger = screen.getByRole("button", { name: "Delivery" });
    await userEvent.hover(trigger);
    expect(screen.getByRole("tooltip")).toHaveClass("text-body-lg", "px-20", "py-16");
    await userEvent.unhover(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("keeps an existing description and places itself on the chosen side", async () => {
    render(
      <>
        <p id="hint">Opens a map</p>
        <Tooltip content="Store hours" side="right" align="start">
          <button type="button" aria-describedby="hint">
            Store
          </button>
        </Tooltip>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Store" });
    expect(trigger.getAttribute("aria-describedby")).toMatch(/^hint /);
    await userEvent.hover(trigger);
    expect(screen.getByRole("tooltip")).toHaveClass("left-full", "top-0");
  });
});
