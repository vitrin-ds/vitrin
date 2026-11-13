import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Slider } from "./slider";

describe("Slider", () => {
  it("is a named APG slider with no axe violations", async () => {
    const { container } = render(
      <Slider min={0} max={100} defaultValue={40} aria-label="Volume" />,
    );
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider).toHaveAttribute("aria-valuenow", "40");
    await expectNoAxeViolations(container);
  });

  it("moves by step, page and to both ends from the keyboard", () => {
    const onChange = vi.fn();
    render(<Slider min={0} max={100} defaultValue={40} aria-label="V" onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(41);
    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(onChange).toHaveBeenLastCalledWith(31);
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("does not change when disabled and leaves the tab order", () => {
    const onChange = vi.fn();
    render(<Slider min={0} max={10} aria-label="V" disabled onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("tabindex", "-1");
    expect(slider).toHaveAttribute("aria-disabled", "true");
  });
});
