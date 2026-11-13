import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { DatePicker } from "./date-picker";

const day = (name: string) => screen.getByRole("button", { name });

describe("DatePicker", () => {
  it("shows the selected month, marks the day and today, and has no axe violations", async () => {
    const { container } = render(<DatePicker value="2026-01-12" today="2026-01-20" />);
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("12");
    expect(day("Tuesday, January 20, 2026")).toHaveAttribute("aria-current", "date");
    await expectNoAxeViolations(container);
  });

  it("chooses a day", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue="2026-01-12" onValueChange={onValueChange} />);
    await userEvent.click(day("Wednesday, January 14, 2026"));
    expect(onValueChange).toHaveBeenCalledWith("2026-01-14");
  });

  it("does not choose a disabled day", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue="2026-01-12" min="2026-01-10" onValueChange={onValueChange} />);
    const past = day("Friday, January 9, 2026");
    expect(past).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(past);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves with the keyboard, across months too, with one Tab stop", async () => {
    render(<DatePicker defaultValue="2026-01-31" />);
    expect(day("Saturday, January 31, 2026")).toHaveAttribute("tabindex", "0");
    day("Saturday, January 31, 2026").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(day("Sunday, February 1, 2026")).toHaveFocus();
    await userEvent.keyboard("{PageUp}");
    expect(day("Thursday, January 1, 2026")).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(day("Saturday, January 3, 2026")).toHaveFocus();
  });

  it("shows actions only when given and confirms the value", async () => {
    const onConfirm = vi.fn();
    const { rerender } = render(<DatePicker defaultValue="2026-01-12" />);
    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
    rerender(<DatePicker defaultValue="2026-01-12" onCancel={() => {}} onConfirm={onConfirm} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onConfirm).toHaveBeenCalledWith("2026-01-12");
  });

  it("hides the year or the month", () => {
    render(<DatePicker defaultValue="2026-01-12" showYear={false} />);
    expect(screen.queryByRole("combobox", { name: /Year/ })).toBeNull();
    expect(screen.getByRole("combobox", { name: /Month/ })).toBeInTheDocument();
  });
});
