import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import {
  HeaderActions,
  HeaderSearch,
  STORY_HEADER_LABELS,
  StoryLogo,
} from "./header.story-helpers";
import { MainHeader, MainHeaderAction } from "./main-header";

describe("MainHeader", () => {
  it("shows the logo link, the search slot and the actions on surface-accent", async () => {
    const { container } = render(
      <header>
        <MainHeader
          logo={<StoryLogo />}
          labels={STORY_HEADER_LABELS}
          search={<HeaderSearch />}
          actions={<HeaderActions cartCount={3} />}
        />
      </header>,
    );
    expect(container.firstElementChild?.firstElementChild).toHaveClass("bg-surface-accent");
    // The logo is the store's (slot); the link is named by the label, not by the logo.
    expect(screen.getByRole("link", { name: "Store home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Store")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a Store" })).toHaveAttribute("href", "/stores");
    // The cart count is part of the link's name; the badge itself is hidden from AT.
    const cart = screen.getByRole("link", { name: "Cart, 3 items" });
    expect(cart).toHaveTextContent("3");
    expect(screen.queryByRole("button", { name: "Menu" })).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("shows the menu trigger when onMenuClick is given", async () => {
    const onMenuClick = vi.fn();
    render(
      <MainHeader
        logo={<StoryLogo />}
        labels={STORY_HEADER_LABELS}
        onMenuClick={onMenuClick}
        menuExpanded={false}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    expect(onMenuClick).toHaveBeenCalledOnce();
  });
});

describe("MainHeaderAction", () => {
  it("hides the badge at 0 and uses singular wording for one item", () => {
    const { rerender } = render(
      <ul>
        <MainHeaderAction icon="shopping_basket" label="Cart" hideLabel count={0} href="/cart" />
      </ul>,
    );
    expect(screen.getByRole("link", { name: "Cart, 0 items" })).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).toBeNull();
    rerender(
      <ul>
        <MainHeaderAction icon="shopping_basket" label="Cart" hideLabel count={1} href="/cart" />
      </ul>,
    );
    expect(screen.getByRole("link", { name: "Cart, 1 item" })).toBeInTheDocument();
  });

  it("is a button when it has no href", async () => {
    const onClick = vi.fn();
    render(
      <ul>
        <MainHeaderAction icon="shopping_basket" label="Cart" count={120} onClick={onClick} />
      </ul>,
    );
    const button = screen.getByRole("button", { name: "Cart, 120 items" });
    expect(button).toHaveTextContent("99+");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a static note with a visible label when it has neither href nor onClick", async () => {
    const { container } = render(
      <header>
        <MainHeader
          logo={<StoryLogo />}
          labels={STORY_HEADER_LABELS}
          actions={<MainHeaderAction icon="lock" label="Secure Checkout" />}
        />
      </header>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1); // the logo
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Secure Checkout");
    expect(item).toHaveClass("text-text-on-accent");
    await expectNoAxeViolations(container);
  });
});
