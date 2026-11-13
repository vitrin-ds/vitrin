import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Progress, ProgressSteps } from "./progress";

describe("Progress", () => {
  it("is a named progressbar with the value as a percentage fill", async () => {
    const { container } = render(<Progress label="Upload" value={29} />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "29");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveClass("h-2", "w-full");
    expect(container.querySelectorAll("rect")[1]).toHaveAttribute("width", "29%");
    await expectNoAxeViolations(container);
  });

  it("clamps the value and speaks a custom value text", () => {
    const { container } = render(
      <Progress label="Free delivery" value={60} max={50} size="8x" valueText="€50 of €50" />,
    );
    const bar = screen.getByRole("progressbar", { name: "Free delivery" });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuetext", "€50 of €50");
    expect(bar).toHaveClass("h-8");
    expect(container.querySelectorAll("rect")[1]).toHaveAttribute("width", "100%");
  });
});

describe("ProgressSteps", () => {
  it("fills completed segments and announces the step count", async () => {
    const { container } = render(<ProgressSteps label="Checkout" steps={4} completed={2} />);
    const bar = screen.getByRole("progressbar", { name: "Checkout" });
    expect(bar).toHaveAttribute("aria-valuetext", "2 of 4 steps completed");
    const segments = bar.querySelectorAll("span");
    expect(segments).toHaveLength(4);
    expect([...segments].map((s) => s.classList.contains("bg-surface-accent"))).toEqual([
      true,
      true,
      false,
      false,
    ]);
    await expectNoAxeViolations(container);
  });
});
