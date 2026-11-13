import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ActiveFilters, ACTIVE_FILTERS_DEFAULTS, type ActiveFilterItem } from "./active-filters";

const ITEMS: ActiveFilterItem[] = [
  { id: "color:red", label: "Red" },
  { id: "brand:aurell", label: "Aurell" },
  { id: "price", label: "€25 – €50" },
];

function Demo({ initial = ITEMS, onClearAll = vi.fn() }) {
  const [items, setItems] = useState(initial);
  return (
    <ActiveFilters
      items={items}
      onRemove={(id) => setItems((list) => list.filter((i) => i.id !== id))}
      onClearAll={() => {
        onClearAll();
        setItems([]);
      }}
    />
  );
}

describe("ActiveFilters", () => {
  it("lists every applied filter as a removable chip", async () => {
    const { container } = render(<Demo />);
    expect(screen.getByRole("region", { name: "Selected filters" })).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Applied filters" });
    expect(list.children).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Remove filter: Red" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("moves focus to the next chip after a removal and announces the count", async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole("button", { name: "Remove filter: Red" }));
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove filter: Aurell" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("2 filters applied");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove filter: €25 – €50" })).toHaveFocus();
  });

  it("offers Clear all only from two filters", async () => {
    const onClearAll = vi.fn();
    const { rerender } = render(<Demo onClearAll={onClearAll} />);
    expect(ACTIVE_FILTERS_DEFAULTS.clearAllFrom).toBe(2);
    const clearAll = screen.getByRole("button", { name: "Clear all filters" });
    // A link-looking action: LinkButton (type=button, Link classes), not a ghost Button.
    expect(clearAll).toHaveAttribute("type", "button");
    // Stacked (sidebar): the Filter Panel Title action, label-small text-secondary.
    expect(clearAll).toHaveClass("link-underline", "text-label-sm", "text-text-secondary");
    clearAll.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClearAll).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("No filters applied");

    rerender(<Demo key="single" initial={[ITEMS[0]]} />);
    expect(screen.queryByRole("button", { name: "Clear all filters" })).not.toBeInTheDocument();
  });

  it("lays the label, chips and Clear all out in one row (layout inline)", async () => {
    const { container } = render(
      <ActiveFilters
        layout="inline"
        headingLevel={2}
        items={ITEMS}
        onRemove={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );
    const region = screen.getByRole("region", { name: "Selected filters" });
    expect(screen.getByRole("heading", { level: 2, name: "Selected filters" })).toHaveTextContent(
      "Selected:",
    );
    expect(region).toContainElement(screen.getByRole("list", { name: "Applied filters" }));
    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps focus on the announced status when the last chip goes", async () => {
    render(<Demo key="last" initial={[ITEMS[0]]} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove filter: Red" }));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("No filters applied");
    expect(document.activeElement).toContainElement(status);
  });
});
