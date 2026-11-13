import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Link, LINK_DEFAULTS, LinkButton, linkVariants } from "./link";

describe("Link", () => {
  it("is an accent label-large link with the dotted underline by default", async () => {
    const { container } = render(<Link href="/help/delivery">Delivery options</Link>);
    const link = screen.getByRole("link", { name: "Delivery options" });
    expect(LINK_DEFAULTS).toEqual({
      underline: "always",
      size: "default",
      variant: "accent",
      error: false,
      disabled: false,
    });
    expect(link).toHaveAttribute("href", "/help/delivery");
    expect(link).toHaveClass(
      "link-underline",
      "hover:decoration-solid",
      "text-label-lg",
      "text-text-accent",
      "hover:text-interactive-hover",
    );
    await expectNoAxeViolations(container);
  });

  it("is label-medium with a 44px hit area at size Small", () => {
    render(
      <Link href="/account/orders" size="sm">
        View All
      </Link>,
    );
    expect(screen.getByRole("link", { name: "View All" })).toHaveClass(
      "text-label-md",
      "relative",
      "before:h-44",
    );
  });

  it("takes the surrounding text style with size Inline", () => {
    render(
      <p className="text-body-sm">
        See the{" "}
        <Link href="/legal/cookie-policy" size="inline">
          Cookie Policy
        </Link>
      </p>,
    );
    expect(screen.getByRole("link", { name: "Cookie Policy" })).not.toHaveClass("text-label-lg");
  });

  it("uses text-primary for Neutral", () => {
    render(
      <Link href="/legal/terms" variant="neutral">
        Terms
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Terms" });
    expect(link).toHaveClass("text-text-primary");
    expect(link).not.toHaveClass("text-text-accent");
  });

  it("switches to text-error in the error state", () => {
    render(
      <Link href="/login" error>
        Sign in again
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Sign in again" })).toHaveClass("text-text-error");
  });

  it("can't be followed or focused when disabled", async () => {
    const { container } = render(
      <Link href="/checkout" disabled>
        Checkout
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Checkout" });
    expect(link.tagName).toBe("SPAN");
    expect(link).not.toHaveAttribute("href");
    expect(link).not.toHaveAttribute("tabindex");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("text-text-disabled");
    await expectNoAxeViolations(container);
  });
});

describe("LinkButton", () => {
  it("is a type=button that looks exactly like Link", async () => {
    const onClick = vi.fn();
    const { container } = render(<LinkButton onClick={onClick}>Clear all</LinkButton>);
    const button = screen.getByRole("button", { name: "Clear all" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(...linkVariants({ ...LINK_DEFAULTS }).split(" "), "before:h-44");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
  });

  it("activates with Enter and Space from the keyboard", async () => {
    const onClick = vi.fn();
    render(<LinkButton onClick={onClick}>Change</LinkButton>);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Change" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("takes the sentence's style with size Inline and has no enlarged hit area", () => {
    render(
      <p className="text-body-sm">
        <LinkButton size="inline" variant="neutral">
          Undo
        </LinkButton>
      </p>,
    );
    const button = screen.getByRole("button", { name: "Undo" });
    expect(button).not.toHaveClass("text-label-lg");
    expect(button).not.toHaveClass("before:h-44");
    expect(button).toHaveClass("text-text-primary");
  });

  it("uses the error tone", () => {
    render(<LinkButton error>Retry</LinkButton>);
    expect(screen.getByRole("button", { name: "Retry" })).toHaveClass("text-text-error");
  });

  it("is natively disabled and skipped by Tab when disabled", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <LinkButton disabled onClick={onClick}>
        Clear all
      </LinkButton>,
    );
    const button = screen.getByRole("button", { name: "Clear all" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("text-text-disabled");
    await userEvent.tab();
    expect(button).not.toHaveFocus();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });
});
