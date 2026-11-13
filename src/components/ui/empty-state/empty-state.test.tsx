import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("Icon type: tinted card with a decorative icon, heading, body and two actions", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <EmptyState
        icon="store"
        title="No stores found"
        body="Try a different town."
        primaryAction={{ label: "Use my current location", onClick }}
        secondaryAction={{ label: "Shop online", href: "/" }}
      />,
    );
    expect(container.firstChild).toHaveClass("bg-surface-secondary", "rounded-surface");
    expect(screen.getByRole("heading", { level: 2, name: "No stores found" })).toHaveClass(
      "text-headline-sm",
    );
    expect(container.querySelector('[data-icon="store"]')).toHaveAttribute("aria-hidden");
    const primary = screen.getByRole("button", { name: "Use my current location" });
    expect(primary).toHaveClass("bg-(--th-button-accent-solid-bg)");
    await userEvent.click(primary);
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Shop online" })).toHaveClass(
      "inset-ring-(--th-button-accent-outline-border)",
    );
    await expectNoAxeViolations(container);
  });

  it("Error Code type: the code is decorative and the title is the only heading", async () => {
    const { container } = render(
      <EmptyState
        type="error-code"
        code="404"
        title="We can't find that page"
        headingLevel={1}
        primaryAction={{ label: "Go to homepage", href: "/" }}
      />,
    );
    expect(container.firstChild).not.toHaveClass("bg-surface-secondary");
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-headline-md");
    expect(screen.getByText("404")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("404")).toHaveClass("text-display-lg", "text-text-accent");
    expect(screen.getByRole("link", { name: "Go to homepage" })).toHaveAttribute("href", "/");
    await expectNoAxeViolations(container);
  });

  it("hides the actions row without actions", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
