import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { List, ListItem } from "./list";

describe("List", () => {
  it("renders rows with every slot", async () => {
    const { container } = render(
      <List aria-label="Settings">
        <ListItem
          thumbIcon="credit_card"
          leftIcon="radio_button_unchecked"
          title="Payment methods"
          subtitle="2 cards saved"
          badge={2}
          currentSelected="Visa"
          rightIcon="keyboard_arrow_right"
        />
      </List>,
    );
    const list = screen.getByRole("list", { name: "Settings" });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(list).toHaveTextContent("Payment methods 2 cards saved 2 Visa");
    expect(container.querySelectorAll("[data-icon]")).toHaveLength(3);
    container
      .querySelectorAll("[data-icon]")
      .forEach((icon) => expect(icon).toHaveAttribute("aria-hidden", "true"));
    await expectNoAxeViolations(container);
  });

  it("leaves out the slots that aren't given", () => {
    const { container } = render(
      <List>
        <ListItem title="Only a title" />
      </List>,
    );
    expect(container.querySelector("[data-icon]")).toBeNull();
    expect(container.querySelector("li > div")).toHaveClass("p-16");
  });

  it("button rows are pressable with the keyboard and 44px tall at least", async () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem title="Brands" currentSelected="2 selected" onClick={onClick} />
      </List>,
    );
    const row = screen.getByRole("button", { name: "Brands 2 selected" });
    expect(row).toHaveClass("min-h-44", "w-full");
    await userEvent.tab();
    expect(row).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("link rows mark the current page and fill a selected list row", async () => {
    const { container } = render(
      <List aria-label="Account">
        <ListItem title="Orders" href="/account/orders" selected />
        <ListItem title="Addresses" href="/account/addresses" />
      </List>,
    );
    const orders = screen.getByRole("link", { name: "Orders" });
    expect(orders).toHaveAttribute("aria-current", "page");
    expect(orders).toHaveAttribute("href", "/account/orders");
    expect(orders.closest("li")).toHaveClass("bg-interactive-subtle-active");
    expect(screen.getByRole("link", { name: "Addresses" })).not.toHaveAttribute("aria-current");
    await expectNoAxeViolations(container);
  });

  it("uses text-secondary for the subtitle, as Figma", () => {
    render(
      <List>
        <ListItem title="Express" subtitle="Next day" onClick={() => undefined} />
      </List>,
    );
    expect(screen.getByText("Next day")).toHaveClass("text-text-secondary");
  });

  it("a selected button row is aria-current; a selected card gets the accent border", () => {
    render(
      <List type="card">
        <ListItem title="Standard" onClick={() => undefined} selected />
      </List>,
    );
    const row = screen.getByRole("button", { name: "Standard" });
    expect(row).toHaveAttribute("aria-current", "true");
    const li = row.closest("li")!;
    expect(li).toHaveClass("rounded-card", "after:border-2", "after:border-border-accent");
    expect(li).not.toHaveClass("bg-interactive-subtle-active");
  });

  it("list item type has a bottom border, card type a full border", () => {
    render(
      <>
        <List>
          <ListItem title="Row" />
        </List>
        <List type="card">
          <ListItem title="Card" />
        </List>
      </>,
    );
    expect(screen.getByText("Row").closest("li")).toHaveClass("after:border-b");
    expect(screen.getByText("Card").closest("li")).toHaveClass("after:border");
  });

  it("disables button and link rows", async () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem title="Gift wrap" onClick={onClick} disabled />
        <ListItem title="Returns" href="/returns" disabled />
      </List>,
    );
    const button = screen.getByRole("button", { name: "Gift wrap" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    const link = screen.getByText("Returns").closest("a")!;
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link.closest("li")).toHaveClass("bg-surface-disabled");
  });

  it("holds a custom control in place of the text", () => {
    render(
      <List>
        <ListItem>
          <label>
            Only in stock <input type="checkbox" role="switch" />
          </label>
        </ListItem>
      </List>,
    );
    expect(screen.getByRole("switch", { name: "Only in stock" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hover and keyboard focus recolour the border, not the fill (Figma State)", () => {
    render(
      <List type="card">
        <ListItem href="/a" title="Row" />
      </List>,
    );
    const li = screen.getByRole("link").closest("li");
    expect(li).toHaveClass(
      "bg-surface-primary",
      "hover:after:border-interactive-subtle-hover",
      "hover:after:border-2",
      "has-focus-visible:after:border-interactive-subtle-active",
    );
    expect(screen.getByRole("link")).not.toHaveClass("hover:bg-interactive-subtle-hover");
  });
});
