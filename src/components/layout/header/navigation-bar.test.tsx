import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { NAVIGATION } from "./header.fixtures";
import { NavigationBar } from "./navigation-bar";

describe("NavigationBar", () => {
  it("is a disclosure navigation: buttons open a panel of links, Escape closes and returns focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavigationBar items={NAVIGATION} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const button = screen.getByRole("button", { name: "Shop by Categories" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(panel).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    expect(screen.getByRole("link", { name: "Lipstick" })).toBeVisible();
    await expectNoAxeViolations(container);

    await user.tab();
    expect(screen.getAllByRole("link", { name: "Lipstick" })[0]).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
    expect(nav).toBeInTheDocument();
  });

  it("keeps one menu open at a time and closes on a click outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <NavigationBar items={NAVIGATION} />
        <p>Page</p>
      </>,
    );
    const first = screen.getByRole("button", { name: "Shop by Categories" });
    const second = screen.getByRole("button", { name: "Best Sellers" });
    await user.click(first);
    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
    await user.click(second);
    await user.click(screen.getByText("Page"));
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("moves between top-level items with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<NavigationBar items={NAVIGATION} />);
    screen.getByRole("button", { name: "Shop by Categories" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Best Sellers" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("link", { name: "On Sale" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Shop by Categories" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("link", { name: "On Sale" })).toHaveFocus();
  });

  it("renders plain items as links, marks the current one and styles the featured pill", () => {
    render(<NavigationBar items={NAVIGATION} currentId="hair-care" />);
    expect(screen.getByRole("link", { name: "Hair Care" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "On Sale" })).toHaveClass(
      "bg-surface-accent",
      "text-text-on-accent",
    );
  });

  it("hands menus to onCompactMenu below 1024px", async () => {
    const onCompactMenu = vi.fn();
    render(<NavigationBar items={NAVIGATION} onCompactMenu={onCompactMenu} />);
    const button = screen.getByRole("button", { name: "Make Up" });
    await userEvent.click(button);
    expect(onCompactMenu).toHaveBeenCalledWith("make-up");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
