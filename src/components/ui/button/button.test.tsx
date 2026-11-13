import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Button, BUTTON_DEFAULTS, ButtonLink } from "./button";

describe("Button", () => {
  it("defaults to Filled · Medium and a non-submitting type", async () => {
    const { container } = render(<Button>Add to basket</Button>);
    const button = screen.getByRole("button", { name: "Add to basket" });
    expect(BUTTON_DEFAULTS).toEqual({
      variant: "filled",
      size: "md",
    });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "bg-(--th-button-accent-solid-bg)",
      "focus-visible:bg-(--th-button-accent-solid-bg-hover)",
      "px-20",
      "py-12",
      "rounded-control",
    );
    await expectNoAxeViolations(container);
  });

  it("uses only button-accent-* component tokens for colour", () => {
    for (const variant of ["filled", "outline", "ghost"] as const) {
      render(<Button variant={variant}>{variant}</Button>);
      const colours = screen
        .getByRole("button", { name: variant })
        .className.split(" ")
        .filter((c) => /(^|:)(bg|text|inset-ring)-\(/.test(c));
      expect(colours.length).toBeGreaterThan(0);
      for (const c of colours) expect(c).toMatch(/\(--th-button-accent-/);
    }
  });

  it("uses button-error-* tokens for Filled Error and Outline Error", async () => {
    const { container } = render(
      <>
        <Button variant="filled-error">Delete</Button>
        <Button variant="outline-error" leftIcon="delete">
          Remove
        </Button>
      </>,
    );
    const filled = screen.getByRole("button", { name: "Delete" });
    expect(filled).toHaveClass(
      "bg-(--th-button-error-solid-bg)",
      "hover:bg-(--th-button-error-solid-bg-hover)",
      "focus-visible:bg-(--th-button-error-solid-bg-hover)",
    );
    expect(filled.className).not.toMatch(/--th-button-accent-/);
    const outline = screen.getByRole("button", { name: "Remove" });
    expect(outline).toHaveClass("inset-ring-(--th-button-error-outline-border)");
    expect(outline.querySelector("[data-icon]")).toHaveClass(
      "text-(--th-button-error-outline-icon)",
    );
    // @ts-expect-error Figma has no Tone any more: error is a Style.
    void (<Button tone="error">x</Button>);
    // @ts-expect-error Figma has no Ghost Error style.
    void (<Button variant="ghost-error">x</Button>);
    await expectNoAxeViolations(container);
  });

  it("maps sizes to the Figma padding and gap, without side padding for Ghost", () => {
    render(
      <>
        <Button size="lg">Large</Button>
        <Button size="sm">Small</Button>
        <Button size="lg" variant="ghost">
          Ghost
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Large" })).toHaveClass("gap-12", "px-16", "py-16");
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("gap-8", "px-16", "py-8");
    const ghost = screen.getByRole("button", { name: "Ghost" });
    expect(ghost).toHaveClass("px-0", "py-16");
    expect(ghost).not.toHaveClass("px-16");
  });

  it("gives Ghost its hover and pressed text and icon tokens", () => {
    render(
      <Button variant="ghost" leftIcon="add">
        More
      </Button>,
    );
    const button = screen.getByRole("button", { name: "More" });
    expect(button).toHaveClass(
      "hover:text-(--th-button-accent-ghost-text-hover)",
      "active:text-(--th-button-accent-ghost-text-active)",
    );
    expect(button.querySelector("[data-icon]")).toHaveClass(
      "group-hover:text-(--th-button-accent-ghost-icon-hover)",
      "group-active:text-(--th-button-accent-ghost-icon-active)",
    );
  });

  it("keeps Small at 36px but grows its hit area to 44px", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass(
      "relative",
      "py-8",
      "before:absolute",
      "before:-inset-y-4",
    );
  });

  it("hides decorative icons and keeps the text as the name", () => {
    render(
      <Button leftIcon="add" rightIcon="arrow_forward">
        Continue
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Continue" });
    const icons = button.querySelectorAll("[data-icon]");
    expect(icons).toHaveLength(2);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon.className).toMatch(/text-\(--th-button-accent-solid-icon\)/);
    }
  });

  it("draws icon-only buttons square, with the icon in Fill=Off on request", () => {
    render(<Button variant="outline" leftIcon="zoom_in" iconFill={false} aria-label="Zoom" />);
    const button = screen.getByRole("button", { name: "Zoom" });
    expect(button).toHaveClass("p-12");
    expect(button).not.toHaveClass("px-20");
    expect(button.querySelector("[data-icon]")).not.toHaveClass("icon-filled");
  });

  it("names an icon-only button from aria-label", async () => {
    const { container } = render(<Button leftIcon="favorite" aria-label="Add to wishlist" />);
    expect(screen.getByRole("button", { name: "Add to wishlist" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Pay
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Pay" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("submits a form only when asked to", () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });

  it("ButtonLink navigates with the Button's classes", async () => {
    const { container } = render(
      <ButtonLink href="/stores" variant="outline" size="sm" rightIcon="arrow_forward">
        Store details
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Store details" });
    expect(link).toHaveAttribute("href", "/stores");
    expect(link).toHaveClass(
      "inline-flex",
      "py-8",
      "inset-ring-(--th-button-accent-outline-border)",
    );
    await expectNoAxeViolations(container);
  });
});

// Type-level contract: an icon-only button without an accessible name does not compile.
// @ts-expect-error aria-label is required when there is no text
void (<Button leftIcon="favorite" />);
