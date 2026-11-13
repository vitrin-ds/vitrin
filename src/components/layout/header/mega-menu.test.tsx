import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { MAKE_UP_MENU } from "./header.fixtures";
import { MegaMenu } from "./mega-menu";

describe("MegaMenu", () => {
  it("renders each Link Group as a list named by its title, with links and action links", async () => {
    const { container } = render(
      <nav aria-label="Main">
        <MegaMenu id="panel" {...MAKE_UP_MENU} />
      </nav>,
    );
    const lips = screen.getByRole("list", { name: "Lip Makeup" });
    expect(within(lips).getByRole("link", { name: "Lipstick" })).toHaveAttribute(
      "href",
      "/c/lip-makeup/lipstick",
    );
    expect(within(lips).getByRole("link", { name: "Show All Products" })).toHaveClass(
      "text-text-accent",
    );
    // Group titles never add headings to the page outline.
    expect(screen.queryByRole("heading")).toBeNull();
    expect(container.querySelector("#panel")).toHaveClass("bg-surface-raised", "shadow-md");
    expect(screen.getByText(/Free shipping/)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("adds the tinted showcase zone, named by its title, when an aside is given", () => {
    render(
      <MegaMenu
        columns={MAKE_UP_MENU.columns.slice(0, 2)}
        aside={{ title: "Trending Products", content: <p>Cards</p> }}
      />,
    );
    const zone = screen.getByRole("region", { name: "Trending Products" });
    expect(zone).toHaveClass("bg-surface-tertiary", "w-600");
    expect(within(zone).getByText("Cards")).toBeInTheDocument();
  });

  it("Subcategory Showcase: a vertical tablist whose hover, focus and arrow keys pick the cards", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <nav aria-label="Main">
        <MegaMenu
          columns={[]}
          showcase={[
            { id: "skin", title: "Skin Care", content: <p>Skin cards</p> },
            { id: "hair", title: "Hair Care", content: <p>Hair cards</p> },
          ]}
        />
      </nav>,
    );
    const skin = screen.getByRole("tab", { name: "Skin Care" });
    const hair = screen.getByRole("tab", { name: "Hair Care" });
    expect(skin).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Skin cards");
    await user.hover(hair);
    expect(hair).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Hair cards");
    skin.focus();
    await user.keyboard("{ArrowDown}");
    expect(hair).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(skin).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Skin cards");
    await expectNoAxeViolations(container);
  });
});
