import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Accordion, ACCORDION_DEFAULTS } from "./accordion";

describe("Accordion", () => {
  it("is a heading button that controls a labelled region (APG)", async () => {
    const { container } = render(
      <Accordion title="Delivery" subtitle="2–4 working days">
        Free from €50.
      </Accordion>,
    );
    expect(ACCORDION_DEFAULTS).toEqual({ usage: "full", tone: "default", headingLevel: 3 });
    const button = screen.getByRole("button", { name: /Delivery/ });
    expect(button.parentElement!.tagName).toBe("H3");
    expect(button).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(panel).not.toBeVisible();
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /Delivery/ })).toHaveTextContent("Free from €50.");
    await expectNoAxeViolations(container);
  });

  it("toggles with Enter and Space and reports changes", async () => {
    const onOpenChange = vi.fn();
    render(
      <Accordion title="Returns" onOpenChange={onOpenChange}>
        30 days.
      </Accordion>,
    );
    screen.getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onOpenChange.mock.calls.map(([v]) => v)).toEqual([true, false]);
  });

  it("swaps add / remove and the Expanded container (Full Width: bottom border)", async () => {
    const { container } = render(<Accordion title="Care">Rinse.</Accordion>);
    const root = container.firstElementChild!;
    expect(root).toHaveClass("border-b", "border-border-neutral", "bg-surface-primary");
    expect(container.querySelector('[data-icon="add"]')).not.toBeNull();
    await userEvent.click(screen.getByRole("button"));
    expect(root).toHaveClass(
      "border-b-2",
      "border-interactive-subtle-active",
      "bg-surface-secondary",
    );
    expect(container.querySelector('[data-icon="remove"]')).not.toBeNull();
  });

  it("draws the Card usage all round with radius 12 and shows the optional slots", () => {
    const { container } = render(
      <Accordion
        title="Payment"
        usage="card"
        defaultOpen
        thumbIcon="credit_card"
        leftIcon="radio_button_unchecked"
        topBar="Recommended"
        topBarIcon="star"
        headingLevel={2}
      >
        Card or bank transfer.
      </Accordion>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass("rounded-12", "inset-ring-2", "inset-ring-interactive-subtle-active");
    expect(screen.getByText("Recommended")).toHaveClass("bg-bg-success", "text-text-success");
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const name of ["credit_card", "radio_button_unchecked", "star"]) {
      expect(container.querySelector(`[data-icon="${name}"]`)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
  });

  it("draws Tone On Accent with on-accent text, indicator and an accent rule", async () => {
    const { container } = render(
      <div className="bg-surface-accent-strong">
        <Accordion title="Shop" tone="on-accent" defaultOpen>
          About us
        </Accordion>
      </div>,
    );
    const root = container.firstElementChild!.firstElementChild!;
    expect(root).not.toHaveClass("bg-surface-primary", "bg-surface-secondary");
    expect(root).toHaveClass("border-b-2", "border-interactive-subtle-active");
    expect(screen.getByText("Shop")).toHaveClass("text-text-on-accent");
    expect(screen.getByRole("region")).toHaveClass("text-text-on-accent");
    expect(container.querySelector('[data-icon="remove"]')).toHaveClass("text-icon-on-accent");
    await expectNoAxeViolations(container);
  });

  it("opens from its Toggle, and stays a plain box without a panel", async () => {
    const onOpenChange = vi.fn();
    const { rerender, container } = render(
      <Accordion
        title="Invoicing"
        indicator="toggle"
        usage="card"
        open={false}
        onOpenChange={onOpenChange}
      >
        Panel
      </Accordion>,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Invoicing" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender(
      <Accordion title="Invoicing" indicator="toggle" usage="card" open onOpenChange={onOpenChange}>
        Panel
      </Accordion>,
    );
    expect(screen.getByText("Panel")).toBeVisible();
    expect(screen.getByRole("switch", { name: "Invoicing" })).toBeChecked();
    expect(container.firstElementChild).toHaveClass("bg-surface-secondary");
    rerender(
      <Accordion
        title="Business"
        indicator="toggle"
        usage="card"
        open
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.queryByRole("region")).toBeNull();
    expect(container.firstElementChild).not.toHaveClass("bg-surface-secondary");
  });
});
