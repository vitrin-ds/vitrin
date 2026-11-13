import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { StatusDot, STATUS_DOT_DEFAULTS } from "./status-dot";

describe("StatusDot", () => {
  it("is a labelled image in the success colour by default", async () => {
    const { container } = render(<StatusDot label="In stock" />);
    const dot = screen.getByRole("img", { name: "In stock" });
    expect(STATUS_DOT_DEFAULTS).toEqual({ status: "success", size: "sm" });
    expect(dot).toHaveClass("size-6", "rounded-full", "bg-(--th-indicator-dot-success)");
    await expectNoAxeViolations(container);
  });

  it("hides itself when visible text already gives the meaning", () => {
    const { container } = render(<StatusDot label={null} status="error" size="xl" />);
    const dot = container.querySelector("span")!;
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("size-16", "bg-(--th-indicator-dot-error)");
  });
});
