import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("uses the Figma surface and radius, and is hidden from screen readers", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild!;
    expect(el).toHaveClass("bg-surface-skeleton", "rounded-4", "size-full");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("only pulses when motion is allowed", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass("motion-safe:animate-pulse");
    expect(container.firstElementChild).not.toHaveClass("animate-pulse");
  });

  it("text shape takes the line height from a zero-width character", () => {
    const { container } = render(<Skeleton shape="text" />);
    expect(container.firstElementChild!.textContent).toBe("​");
  });

  it("circle shape is square and round", () => {
    const { container } = render(<Skeleton shape="circle" />);
    expect(container.firstElementChild).toHaveClass("aspect-square", "rounded-full");
  });
});
