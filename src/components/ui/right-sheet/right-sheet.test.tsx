import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { RightSheet } from "./right-sheet";

function Example({ footer }: { footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Filters
      </button>
      <RightSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        subtitle="230 results"
        footer={footer}
      >
        <label>
          <input type="checkbox" /> Vegan
        </label>
      </RightSheet>
    </main>
  );
}

describe("RightSheet", () => {
  it("opens as a modal panel with the close button first, traps focus, closes on Escape", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    expect(sheet).toHaveClass("max-w-560", "h-full", "shadow-md");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("checkbox", { name: "Vegan" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await expectNoAxeViolations(sheet);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("puts the footer after the scrolling content, in the focus order", async () => {
    render(
      <Example
        footer={
          <button type="button" className="w-full">
            Show results
          </button>
        }
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    const action = screen.getByRole("button", { name: "Show results" });
    expect(action.parentElement).toBe(sheet.lastElementChild);
    expect(action.parentElement).toHaveClass("bg-surface-raised", "shadow-up");
    await userEvent.tab();
    await userEvent.tab();
    expect(action).toHaveFocus();
    await expectNoAxeViolations(sheet);
  });

  it("offers a way back only when given one", async () => {
    const onBack = vi.fn();
    const { rerender } = render(
      <RightSheet open onClose={vi.fn()} title="Add card">
        Body
      </RightSheet>,
    );
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    rerender(
      <RightSheet open onClose={vi.fn()} title="Add card" onBack={onBack}>
        Body
      </RightSheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
