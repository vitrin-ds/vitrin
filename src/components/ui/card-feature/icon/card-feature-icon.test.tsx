import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardFeatureIcon } from "./card-feature-icon";

describe("CardFeatureIcon", () => {
  it("is a link card whose title links the whole card, with the arrow and meta", async () => {
    const { container } = render(
      <CardFeatureIcon
        icon="lock"
        title="Privacy Policy"
        description="How we protect your data."
        meta="Updated 12 March 2026"
        href="/legal/privacy-policy"
      />,
    );
    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link).toHaveAttribute("href", "/legal/privacy-policy");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(screen.getByRole("heading", { level: 3, name: "Privacy Policy" })).toBeInTheDocument();
    expect(container.querySelector('[data-icon="arrow_forward"]')).toHaveAttribute("aria-hidden");
    expect(container.querySelector('[data-icon="lock"]')).toHaveClass("icon-32", "icon-light");
    expect(container.querySelector('[data-icon="lock"]')).not.toHaveClass("icon-filled");
    expect(container.querySelector('[data-icon="arrow_forward"]')).toHaveClass("icon-light");
    expect(screen.getByRole("article")).toHaveClass(
      "rounded-card",
      "bg-surface-primary",
      "hover:bg-surface-accent-subtle",
    );
    expect(screen.getByText("Updated 12 March 2026")).toHaveClass("text-text-tertiary");
    expect(screen.queryByRole("button")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("is an action card with an Outline button and a trailing value", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <CardFeatureIcon
        icon="chat"
        title="Live chat"
        trailing="Free"
        action={{ label: "Start chat", onClick }}
      />,
    );
    expect(screen.getByRole("article")).not.toHaveClass("hover:bg-surface-accent-subtle");
    expect(screen.getByText("Free")).toHaveClass("text-text-accent");
    await userEvent.click(screen.getByRole("button", { name: "Start chat" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector('[data-icon="arrow_forward"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("draws a link action as the Outline button (tel:, a page)", async () => {
    const { container } = render(
      <CardFeatureIcon
        icon="call"
        title="Call us"
        description="+44 20 0000 0000 · Mon – Sat, 9:00 – 18:00"
        action={{ label: "Call now", href: "tel:+442000000000" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Call now" });
    expect(link).toHaveAttribute("href", "tel:+442000000000");
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector('[data-icon="arrow_forward"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("hides the icon, description and footer when they are not given", () => {
    const { container } = render(<CardFeatureIcon title="Free returns" />);
    expect(screen.getByRole("article")).toHaveClass(
      "inset-ring-border-default",
      "bg-surface-primary",
      "rounded-card",
    );
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.querySelector("[data-icon]")).toBeNull();
  });
});
