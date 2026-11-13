import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ACTION_BANNER_DEFAULTS, ActionBanner } from "./action-banner";

describe("ActionBanner", () => {
  it("defaults to Full Width · Accent on the callout tokens", async () => {
    const { container } = render(
      <ActionBanner icon="info" title="Free returns">
        Within 30 days.
      </ActionBanner>,
    );
    expect(ACTION_BANNER_DEFAULTS).toEqual({ color: "accent", width: "full" });
    const banner = container.firstElementChild!;
    expect(banner).toHaveClass("border-y", "bg-(--th-callout-accent-surface-bg)");
    expect(screen.getByText("Free returns")).toHaveClass("text-title-md");
    expect(screen.getByText("Within 30 days.")).toHaveClass("text-body-md");
    await expectNoAxeViolations(container);
  });

  it("draws the Card width, the 44px icon tile and an action", () => {
    const { container } = render(
      <ActionBanner
        color="neutral"
        width="card"
        icon="check_circle"
        iconTone="success"
        title="Delivered"
        action={<button type="button">Track</button>}
      />,
    );
    const banner = container.firstElementChild!;
    expect(banner).toHaveClass(
      "rounded-card",
      "inset-ring",
      "bg-(--th-callout-neutral-surface-bg)",
    );
    const icon = container.querySelector('[data-icon="check_circle"]');
    expect(icon).toHaveClass("text-icon-success");
    expect(icon?.parentElement).toHaveClass("p-12", "rounded-8", "bg-surface-primary");
    expect(screen.getByRole("button", { name: "Track" })).toBeVisible();
  });

  it("can draw the icon outlined", () => {
    const { container } = render(
      <ActionBanner color="light" icon="schedule" iconFill={false}>
        Times shown in your local time zone.
      </ActionBanner>,
    );
    expect(container.querySelector('[data-icon="schedule"]')).not.toHaveClass("icon-filled");
    expect(container.querySelector('[data-icon="schedule"]')?.parentElement).toHaveClass(
      "bg-surface-neutral",
    );
  });
});
