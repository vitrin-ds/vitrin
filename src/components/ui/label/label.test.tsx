import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Label, LABEL_DEFAULTS } from "./label";

describe("Label", () => {
  it("is a label-small indicator tag with the Default colour", async () => {
    const { container } = render(<Label>New</Label>);
    const label = screen.getByText("New");
    expect(LABEL_DEFAULTS).toEqual({ color: "default" });
    expect(label.tagName).toBe("SPAN");
    expect(label).toHaveClass("px-4", "py-2", "gap-2", "rounded-4", "text-label-sm", "inset-ring");
    expect(label.className).toMatch(/--th-indicator-accent-surface-bg/);
    await expectNoAxeViolations(container);
  });

  it("draws an 8px decorative icon in the colour's icon token", () => {
    const { container } = render(
      <Label color="success" icon="check_circle">
        Verified
      </Label>,
    );
    const icon = container.querySelector("[data-icon]")!;
    expect(icon).toHaveClass("icon-8", "text-(--th-indicator-success-soft-icon)");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Verified")).not.toHaveClass("inset-ring");
  });

  it("has the Outline colour (Figma: formerly Light Green)", () => {
    render(<Label color="outline">Outline</Label>);
    expect(screen.getByText("Outline").className).toMatch(/--th-indicator-neutral-outline-border/);
  });
});
