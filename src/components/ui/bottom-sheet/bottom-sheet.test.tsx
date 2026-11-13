import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { BottomSheet, type BottomSheetProps } from "./bottom-sheet";

function Example(props: Partial<BottomSheetProps>) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Sort
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Sort by" {...props}>
        <button type="button">Price: low to high</button>
      </BottomSheet>
    </main>
  );
}

describe("BottomSheet", () => {
  it("is a modal dialog named by its title, Half by default", async () => {
    render(<Example subtitle="12 results" />);
    await userEvent.click(screen.getByRole("button", { name: "Sort" }));
    const sheet = screen.getByRole("dialog", { name: "Sort by" });
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(sheet).toHaveClass("rounded-t-24", "max-h-1/2", "bg-surface-raised");
    expect(screen.getByText("12 results")).toHaveClass("text-label-xs");
    expect(document.querySelector("main")!.closest("[inert]")).not.toBeNull();
    await expectNoAxeViolations(sheet);
  });

  it("closes on Escape and the close button and returns focus", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Sort" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the back button only with onBack, and Full leaves 64 at the top", async () => {
    const onBack = vi.fn();
    render(<Example state="full" onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: "Sort" }));
    expect(screen.getByRole("dialog")).toHaveClass("mt-64", "self-stretch");
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
  });

  it("closes with the toolbar's accent Right Button (close_small)", async () => {
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Sort" }));
    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveClass("bg-interactive-default", "text-icon-on-accent", "p-12");
    expect(close.querySelector('[data-icon="close_small"]')).not.toBeNull();
    await userEvent.click(close);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders the footer as a fixed bar outside the scrolling content, only when given", async () => {
    const { rerender } = render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Sort" }));
    const sheet = screen.getByRole("dialog");
    expect(sheet.lastElementChild).toHaveClass("overflow-y-auto");
    rerender(
      <Example
        footer={
          <button type="button" className="w-full">
            Apply
          </button>
        }
      />,
    );
    const footer = screen.getByRole("button", { name: "Apply" }).parentElement!;
    expect(footer).toBe(sheet.lastElementChild);
    expect(footer).toHaveClass("shrink-0", "bg-surface-raised", "shadow-up", "pb-16");
    expect(footer.previousElementSibling).toHaveClass("overflow-y-auto");
    await expectNoAxeViolations(sheet);
  });
});
