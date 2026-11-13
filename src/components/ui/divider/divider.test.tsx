import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Divider } from "./divider";

describe("Divider", () => {
  it("is a full-width separator by default", async () => {
    const { container } = render(<Divider />);
    const hr = screen.getByRole("separator");
    expect(hr).toHaveClass("w-full", "h-0", "after:h-px", "after:bg-border-neutral");
    await expectNoAxeViolations(container);
  });

  it("insets 16px on each side", () => {
    render(<Divider usage="inset" />);
    expect(screen.getByRole("separator")).toHaveClass("mx-16");
  });

  it("can be purely decorative", () => {
    const { container } = render(<Divider decorative />);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(container.querySelector("hr")).toHaveAttribute("aria-hidden", "true");
  });
});
