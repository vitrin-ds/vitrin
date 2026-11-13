import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Badge, BADGE_DEFAULTS, formatBadgeCount } from "./badge";

describe("Badge", () => {
  it("defaults to Light · Mid on indicator-* tokens", async () => {
    const { container } = render(<Badge count={2} aria-label="2 items in basket" />);
    const badge = screen.getByText("2");
    expect(BADGE_DEFAULTS).toEqual({ color: "light", size: "mid" });
    expect(badge).toHaveClass("min-h-22", "min-w-22", "rounded-full", "text-label-sm");
    const colours = badge.className
      .split(" ")
      .filter((c) => /(^|:)(bg|text|inset-ring)-\(/.test(c));
    for (const c of colours) expect(c).toMatch(/\(--th-indicator-/);
    await expectNoAxeViolations(container);
  });

  it("shows 99+ above 99", () => {
    expect(formatBadgeCount(99)).toBe("99");
    expect(formatBadgeCount(100)).toBe("99+");
    render(<Badge count={250} color="red" size="small" />);
    expect(screen.getByText("99+")).toHaveClass("min-h-18");
  });

  it("maps Figma colours to tone and emphasis", () => {
    render(
      <>
        <Badge color="dark">New</Badge>
        <Badge color="green">In stock</Badge>
      </>,
    );
    expect(screen.getByText("New").className).toMatch(/--th-indicator-accent-solid-bg/);
    expect(screen.getByText("In stock").className).toMatch(/--th-indicator-success-soft-bg/);
  });
});
