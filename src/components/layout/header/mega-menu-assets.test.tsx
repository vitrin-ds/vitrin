import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { MegaMenuLinkItem } from "./mega-menu-link-item";
import { MegaMenuTitleItem } from "./mega-menu-title-item";

describe("Mega Menu assets", () => {
  it("Link Item: Size picks the colour, the chevron is optional", async () => {
    const { container } = render(
      <>
        <MegaMenuLinkItem href="/a" label="Lipstick" />
        <MegaMenuLinkItem href="/b" label="Show All" size="sm" chevron />
      </>,
    );
    const link = screen.getByRole("link", { name: "Lipstick" });
    expect(link).toHaveClass("text-text-secondary");
    expect(link.querySelector("[aria-hidden]")).toBeNull();
    expect(screen.getByRole("link", { name: /Show All/ })).toHaveClass("text-text-accent");
    await expectNoAxeViolations(container);
  });

  it("Title Item: static by default, a button with `as`, filled when selected", () => {
    render(
      <>
        <MegaMenuTitleItem label="Lip Makeup" />
        <MegaMenuTitleItem as="button" label="Skin Care" selected chevron />
      </>,
    );
    expect(screen.getByText("Lip Makeup").closest("p")).not.toHaveClass("bg-surface-secondary");
    expect(screen.getByRole("button", { name: "Skin Care" })).toHaveClass("bg-surface-secondary");
  });
});
