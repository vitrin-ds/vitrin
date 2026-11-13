import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Spacer } from "./spacer";

describe("Spacer", () => {
  it("is 20px high by default and hidden from screen readers", async () => {
    const { container } = render(<Spacer />);
    const el = container.firstElementChild;
    expect(el).toHaveClass("h-20", "w-full");
    expect(el).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it.each(["40", "60", "80"] as const)("takes Figma's %spx height", (height) => {
    const { container } = render(<Spacer height={height} />);
    expect(container.firstElementChild).toHaveClass(`h-${height}`);
  });
});
