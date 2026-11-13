import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { MainHeaderCompact, MainHeaderCompactAction } from "./main-header-compact";

describe("MainHeaderCompact", () => {
  it("has the back link and named icon actions on surface-primary", async () => {
    const { container } = render(
      <header>
        <MainHeaderCompact
          backHref="/checkout"
          backLabel="Back"
          actions={
            <MainHeaderCompactAction icon="location_on" label="Find a Store" href="/stores" />
          }
        />
      </header>,
    );
    expect(container.querySelector("header > div")).toHaveClass("bg-surface-primary");
    const back = screen.getByRole("link", { name: "Back" });
    expect(back).toHaveAttribute("href", "/checkout");
    expect(back.querySelector("[data-icon]")).toHaveAttribute("data-icon", "arrow_back");
    // The label shows from 744px (Figma Mobile: arrow only) and always names the link.
    expect(screen.getByText("Back")).toHaveClass("sr-only", "tablet:not-sr-only", "uppercase");
    const store = screen.getByRole("link", { name: "Find a Store" });
    expect(store).toHaveAttribute("href", "/stores");
    expect(store).toHaveClass("before:-inset-12");
    await expectNoAxeViolations(container);
  });

  it("renders without actions", () => {
    render(<MainHeaderCompact backHref="/" backLabel="Back" />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});
