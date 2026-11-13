import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import {
  RangeSlider,
  normaliseRange,
  snapToStep,
  type RangeSliderProps,
  type RangeValue,
} from "./range-slider";

const euro = (n: number) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

function Controlled(props: Partial<RangeSliderProps>) {
  const [value, setValue] = useState<RangeValue>(props.value ?? [20, 80]);
  return (
    <RangeSlider
      min={0}
      max={100}
      aria-label="Price"
      labels={{ min: "Minimum price", max: "Maximum price" }}
      formatValue={euro}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

const minThumb = () => screen.getByRole("slider", { name: "Minimum price" });
const maxThumb = () => screen.getByRole("slider", { name: "Maximum price" });

describe("RangeSlider helpers", () => {
  it("snaps to the step grid within the limits", () => {
    expect(snapToStep(23, 0, 5, 0, 100)).toBe(25);
    expect(snapToStep(0.30000000000000004, 0, 0.1, 0, 1)).toBe(0.3);
    expect(snapToStep(140, 0, 5, 0, 100)).toBe(100);
  });

  it("orders and clamps a range", () => {
    expect(normaliseRange([90, 10], 0, 100)).toEqual([10, 90]);
    expect(normaliseRange([-5, 500], 0, 100)).toEqual([0, 100]);
  });
});

describe("RangeSlider", () => {
  it("exposes two named sliders with values, limits and currency text", async () => {
    const { container } = render(<Controlled />);
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(minThumb()).toHaveAttribute("aria-valuenow", "20");
    expect(minThumb()).toHaveAttribute("aria-valuemin", "0");
    // The thumbs can't cross: each one's limit is the other's value.
    expect(minThumb()).toHaveAttribute("aria-valuemax", "80");
    expect(maxThumb()).toHaveAttribute("aria-valuemin", "20");
    expect(maxThumb()).toHaveAttribute("aria-valuemax", "100");
    expect(minThumb()).toHaveAttribute("aria-valuetext", "€20");
    expect(maxThumb()).toHaveAttribute("aria-valuetext", "€80");
    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(screen.getByText("€100")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("places the thumbs and the active track through CSS custom properties", () => {
    render(<Controlled />);
    const root = screen.getByRole("group");
    expect(root.style.getPropertyValue("--range-start")).toBe("20%");
    expect(root.style.getPropertyValue("--range-end")).toBe("80%");
    expect(root.style.getPropertyValue("--range-width")).toBe("60%");
    expect(root).toHaveAttribute("data-placed");
  });

  it("moves with the arrow, page, Home and End keys", async () => {
    render(<Controlled step={1} />);
    await userEvent.tab();
    expect(minThumb()).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowUp}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "22");
    await userEvent.keyboard("{ArrowLeft}{ArrowDown}{ArrowDown}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "19");
    await userEvent.keyboard("{PageUp}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "29");
    await userEvent.keyboard("{PageDown}{PageDown}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "9");
    await userEvent.keyboard("{Home}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "0");
    // End takes the minimum thumb only as far as the maximum thumb.
    await userEvent.keyboard("{End}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "80");

    await userEvent.tab();
    expect(maxThumb()).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "80");
    await userEvent.keyboard("{End}");
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "100");
  });

  it("keeps the thumbs from crossing", async () => {
    const onChange = vi.fn();
    render(<Controlled value={[50, 52]} step={1} onChange={onChange} />);
    minThumb().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{PageUp}");
    expect(minThumb()).toHaveAttribute("aria-valuenow", "52");
    expect(onChange).toHaveBeenLastCalledWith([52, 52]);
  });

  it("uses the step for arrows and ten steps for Page Up / Down", async () => {
    render(<Controlled step={5} value={[20, 80]} />);
    maxThumb().focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "75");
    await userEvent.keyboard("{PageDown}");
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "25");
  });

  it("moves the nearer thumb on a track press and follows the drag", () => {
    const { container } = render(<Controlled />);
    const track = container.querySelector("[data-range-active]")!.parentElement!;
    track.getBoundingClientRect = () =>
      ({ left: 100, width: 200, top: 0, height: 8, right: 300, bottom: 8 }) as DOMRect;
    const area = track.parentElement!;

    // 30% → nearer the minimum thumb (20).
    fireEvent.pointerDown(area, { button: 0, clientX: 160, pointerId: 1 });
    expect(minThumb()).toHaveAttribute("aria-valuenow", "30");
    expect(minThumb()).toHaveFocus();
    fireEvent.pointerMove(area, { clientX: 120, pointerId: 1 });
    expect(minThumb()).toHaveAttribute("aria-valuenow", "10");
    fireEvent.pointerUp(area, { pointerId: 1 });
    fireEvent.pointerMove(area, { clientX: 200, pointerId: 1 });
    expect(minThumb()).toHaveAttribute("aria-valuenow", "10");

    // 90% → nearer the maximum thumb (80); dragging past the minimum stops at it.
    fireEvent.pointerDown(area, { button: 0, clientX: 280, pointerId: 2 });
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "90");
    fireEvent.pointerMove(area, { clientX: 100, pointerId: 2 });
    expect(maxThumb()).toHaveAttribute("aria-valuenow", "10");
    fireEvent.pointerUp(area, { pointerId: 2 });
  });

  it("works uncontrolled", async () => {
    render(<RangeSlider min={0} max={10} defaultValue={[2, 8]} />);
    const [low] = screen.getAllByRole("slider");
    low!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(low).toHaveAttribute("aria-valuenow", "3");
    expect(low).toHaveAccessibleName("Minimum");
  });

  it("ignores keys and pointer when disabled", async () => {
    const onChange = vi.fn();
    const { container } = render(<Controlled disabled onChange={onChange} />);
    expect(minThumb()).toHaveAttribute("aria-disabled", "true");
    expect(minThumb()).toHaveAttribute("tabindex", "-1");
    minThumb().focus();
    await userEvent.keyboard("{ArrowRight}");
    const area = container.querySelector("[data-range-active]")!.parentElement!.parentElement!;
    fireEvent.pointerDown(area, { button: 0, clientX: 10, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("can hide the bounds", () => {
    render(<Controlled showBounds={false} />);
    expect(screen.queryByText("€0")).toBeNull();
  });
});
