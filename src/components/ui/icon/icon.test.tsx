import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Icon, ICON_DEFAULTS } from "./icon";
import { ICON_NAMES } from "./icon-names";

describe("Icon", () => {
  it("renders the ligature with the Figma defaults (20px, weight 400, filled, accent)", () => {
    const { container } = render(<Icon name="location_on" />);
    const icon = container.querySelector("[data-icon]")!;
    // The glyph is drawn from ::before { content: attr(data-icon) }: no text node to announce.
    expect(icon).toHaveAttribute("data-icon", "location_on");
    expect(icon).toBeEmptyDOMElement();
    expect(icon).toHaveClass("icon", "icon-md", "icon-filled", "text-icon-accent");
    expect(icon).not.toHaveClass("icon-light");
    expect(ICON_DEFAULTS).toEqual({ size: "md", weight: 400, fill: true, tone: "accent" });
  });

  it("is hidden from assistive technology without a label", () => {
    const { container } = render(<Icon name="favorite" />);
    expect(container.querySelector("[data-icon]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("exposes the label as an image name and never reads the ligature text", async () => {
    const { container } = render(<Icon name="shopping_basket" label="Basket" />);
    expect(screen.getByRole("img", { name: "Basket" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("maps size, weight, fill and tone to utilities", () => {
    const { container } = render(
      <Icon name="star" size="xl" weight={200} fill={false} tone="current" />,
    );
    const icon = container.querySelector("[data-icon]")!;
    expect(icon).toHaveClass("icon-xl", "icon-light");
    expect(icon).not.toHaveClass("icon-filled");
    expect(icon.className).not.toMatch(/text-icon-/);
  });

  it("keeps the Figma icon list unique and in Material Symbols format", () => {
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
    for (const name of ICON_NAMES) expect(name).toMatch(/^[a-z0-9_]+$/);
  });
});
