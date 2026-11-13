import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Chip, CHIP_DEFAULTS } from "./chip";

describe("Chip", () => {
  it("is a static Primary tag by default", async () => {
    const { container } = render(<Chip>Vegan</Chip>);
    const chip = screen.getByText("Vegan");
    expect(CHIP_DEFAULTS).toEqual({ color: "primary" });
    expect(chip.tagName).toBe("SPAN");
    expect(chip).toHaveClass("px-8", "py-4", "gap-4", "rounded-control", "text-label-lg");
    expect(chip.className).toMatch(/--th-indicator-accent-solid-bg/);
    expect(chip.className).not.toMatch(/hover:/);
    await expectNoAxeViolations(container);
  });

  it("removes through a named cancel button", async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <Chip color="light" onRemove={onRemove}>
        Size M
      </Chip>,
    );
    const remove = screen.getByRole("button", { name: "Remove Size M" });
    expect(remove.querySelector('[data-icon="cancel"]')).toHaveClass("icon-16");
    await userEvent.click(remove);
    expect(onRemove).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("is a Light filter toggle; pressed is Light / Selected (accent solid)", async () => {
    const onClick = vi.fn();
    const { container, rerender } = render(
      <Chip onClick={onClick} pressed={false}>
        On sale
      </Chip>,
    );
    const chip = screen.getByRole("button", { name: "On sale" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip.className).toMatch(/--th-indicator-accent-outline-bg/);
    expect(chip).toHaveClass("hover:inset-ring-(--th-indicator-accent-outline-border-hover)");
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalled();

    rerender(
      <Chip onClick={onClick} pressed>
        On sale
      </Chip>,
    );
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveClass(
      "bg-(--th-indicator-accent-solid-bg)",
      "inset-ring-0",
      "hover:bg-(--th-indicator-accent-solid-bg-hover)",
    );
    expect(chip.className).not.toMatch(/--th-indicator-accent-outline-bg/);
    await expectNoAxeViolations(container);
  });

  it("is a plain button without aria-pressed when it is an action", () => {
    render(
      <Chip onClick={() => undefined} color="success">
        Apply
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Apply" })).not.toHaveAttribute("aria-pressed");
  });

  it("uses indicator-disabled-* tokens and blocks removal when disabled", async () => {
    const onRemove = vi.fn();
    render(
      <Chip color="success" disabled onRemove={onRemove} leftIcon="loyalty" dot>
        Organic
      </Chip>,
    );
    expect(screen.getByText("Organic").className).toMatch(/--th-indicator-disabled-bg/);
    expect(screen.getByText("Organic")).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: "Remove Organic" }));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("names the cancel button from labels (i18n)", () => {
    render(
      <Chip onRemove={() => undefined} labels={{ remove: (text) => `${text} kaldır` }}>
        Red
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Red kaldır" })).toBeInTheDocument();
  });

  it("is a link with the Light hover state when it has an href", async () => {
    const { container } = render(
      <Chip color="light" href="/c/skin-care/face/serums">
        Serums
      </Chip>,
    );
    const link = screen.getByRole("link", { name: "Serums" });
    expect(link).toHaveAttribute("href", "/c/skin-care/face/serums");
    expect(link.className).toMatch(
      /hover:inset-ring-\(--th-indicator-accent-outline-border-hover\)/,
    );
    expect(link).not.toHaveAttribute("aria-pressed");
    await expectNoAxeViolations(container);
  });

  it("marks the current filter link with aria-current and the Selected look", async () => {
    const { container } = render(
      <nav aria-label="Topics">
        <Chip href="/help/search?q=refund" current>
          All (8)
        </Chip>
        <Chip color="light" href="/help/search?q=refund&topic=returns">
          Returns (5)
        </Chip>
      </nav>,
    );
    const current = screen.getByRole("link", { name: "All (8)" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.className).toMatch(/bg-\(--th-indicator-accent-solid-bg\)/);
    expect(screen.getByRole("link", { name: "Returns (5)" })).not.toHaveAttribute("aria-current");
    await expectNoAxeViolations(container);
  });
});
