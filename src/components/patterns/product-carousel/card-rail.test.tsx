import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CARD_RAIL_DEFAULTS, CardRail } from "./card-rail";

describe("CardRail", () => {
  it("lists every card at the default width and gap", async () => {
    const { container } = render(
      <CardRail>
        <a href="#a">A</a>
        <a href="#b">B</a>
      </CardRail>,
    );
    expect(CARD_RAIL_DEFAULTS).toEqual({ gap: "md", itemWidth: "md", layout: "inline" });
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("w-260", "snap-start");
    expect(container.firstChild).toHaveClass("gap-20");
    await expectNoAxeViolations(container);
  });

  it("takes the account sizes", () => {
    const { container } = render(
      <CardRail itemWidth="sm" gap="sm">
        <span>A</span>
      </CardRail>,
    );
    expect(screen.getByRole("listitem")).toHaveClass("w-180");
    expect(container.firstChild).toHaveClass("gap-8");
  });

  it("makes a rail of non-interactive cards focusable when labelled", () => {
    render(
      <CardRail label="Rewards">
        <span>A</span>
      </CardRail>,
    );
    expect(screen.getByRole("list", { name: "Rewards" })).toHaveAttribute("tabindex", "0");
  });

  it("renders nothing without cards", () => {
    const { container } = render(<CardRail>{[]}</CardRail>);
    expect(container).toBeEmptyDOMElement();
  });
});
