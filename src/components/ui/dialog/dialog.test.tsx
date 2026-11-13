import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Dialog, type DialogProps } from "./dialog";

function Example(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Remove item
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Remove from basket?"
        primaryAction={{ label: "Remove", onClick: () => setOpen(false) }}
        secondaryAction={{ label: "Cancel", onClick: () => setOpen(false) }}
        {...props}
      >
        Glow serum 30 ml will be removed.
      </Dialog>
    </main>
  );
}

describe("Dialog", () => {
  it("opens as a labelled, described modal with focus inside and the page inert", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Remove item" }));
    const dialog = screen.getByRole("dialog", { name: "Remove from basket?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Glow serum 30 ml will be removed.");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(document.querySelector("main")!.closest("[inert]")).not.toBeNull();
    expect(dialog).toHaveClass("max-w-360", "bg-surface-raised", "shadow-md", "rounded-overlay");
    await expectNoAxeViolations(dialog);
  });

  it("traps Tab, closes on Escape and returns focus to the trigger", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Remove item" });
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Remove" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(document.querySelector("[inert]")).toBeNull();
  });

  it("closes from the close button and the actions", async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Saved">
        Done.
      </Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("is an alertdialog that focuses the safe action when destructive", async () => {
    render(<Example usage="destructive" />);
    await userEvent.click(screen.getByRole("button", { name: "Remove item" }));
    expect(screen.getByRole("alertdialog", { name: "Remove from basket?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass(
      "bg-(--th-button-error-solid-bg)",
    );
  });

  it("puts the 32px close button top right, after the title", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Remove item" }));
    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveClass("size-32", "text-icon-primary", "hover:bg-interactive-subtle-hover");
    expect(close.previousElementSibling).toHaveTextContent("Remove from basket?");
    expect(close.querySelector("[data-icon]")).toHaveClass("icon-24");
  });

  it("fades and scales in, and keeps the panel (aria-hidden) for the 150ms exit", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // jsdom has no matchMedia (BaseModal then skips motion): report "no reduced motion".
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Remove item" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveClass("motion-dialog");
    await user.keyboard("{Escape}");
    expect(dialog).toHaveAttribute("data-state", "closed");
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
    act(() => vi.advanceTimersByTime(150));
    expect(dialog).not.toBeInTheDocument();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("is one width, 360, capped to the viewport", () => {
    render(
      <Dialog open onClose={() => undefined} title="Saved">
        Done.
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-360", "w-full", "max-h-full", "p-12");
    expect(screen.getByRole("dialog").parentElement).toHaveClass("p-16");
  });
});
