import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Alert, ALERT_DEFAULTS, ALERT_ICONS } from "./alert";

describe("Alert", () => {
  it("is a polite status with the Figma defaults (Notice · Full Width · warning)", async () => {
    const { container } = render(<Alert title="Delivery delayed">Storms in the north.</Alert>);
    const alert = screen.getByRole("status");
    expect(ALERT_DEFAULTS).toEqual({ usage: "notice", width: "full" });
    expect(alert).toHaveClass("border-y", "p-16", "gap-12");
    expect(alert.className).toMatch(/bg-\(--th-callout-warning-soft-bg\)/);
    expect(container.querySelector("[data-icon]")).toHaveAttribute("data-icon", "warning");
    expect(screen.getByText("Delivery delayed")).toHaveClass("text-title-md");
    await expectNoAxeViolations(container);
  });

  it("draws each tone's glyph unless an icon is given", () => {
    expect(ALERT_ICONS).toEqual({
      informative: "info",
      positive: "check_circle",
      notice: "warning",
      negative: "error",
      neutral: "info",
    });
    const { container, rerender } = render(<Alert usage="negative">Failed.</Alert>);
    const icon = () => container.querySelector("[data-icon]");
    expect(icon()).toHaveAttribute("data-icon", "error");
    rerender(<Alert usage="positive">Saved.</Alert>);
    expect(icon()).toHaveAttribute("data-icon", "check_circle");
    rerender(
      <Alert usage="positive" icon="local_shipping">
        Shipped.
      </Alert>,
    );
    expect(icon()).toHaveAttribute("data-icon", "local_shipping");
  });

  it("interrupts for Negative and uses the card shape", () => {
    render(
      <Alert usage="negative" width="card" title="Payment failed">
        Try another card.
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("rounded-card", "inset-ring");
    expect(alert.className).toMatch(/--th-callout-error-soft-/);
  });

  it("uses only callout-* component tokens for colour", () => {
    for (const usage of ["informative", "positive", "notice", "negative", "neutral"] as const) {
      const { container, unmount } = render(<Alert usage={usage}>Body</Alert>);
      const classes = [...container.querySelectorAll("*")]
        .flatMap((el) => el.getAttribute("class")?.split(" ") ?? [])
        .filter((c) => /(^|:)(bg|text|border|inset-ring)-\(/.test(c));
      for (const c of classes) expect(c).toMatch(/\(--th-callout-/);
      unmount();
    }
  });
});
