import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { PopUp } from "./pop-up";

describe("PopUp", () => {
  it("is a modal dialog named by its title, on surface-primary with radius 24", async () => {
    render(
      <PopUp open onClose={() => undefined} title="Title" subtitle="Subtitle">
        <p>Content</p>
      </PopUp>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Title" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveClass("max-w-445", "rounded-24", "bg-surface-primary");
    expect(dialog).not.toHaveClass("bg-surface-raised");
    expect(dialog).toHaveTextContent("Content");
    await expectNoAxeViolations(document.body);
  });

  it("closes with the close button and Escape", async () => {
    const onClose = vi.fn();
    render(
      <PopUp open onClose={onClose} title="Title">
        <p>Content</p>
      </PopUp>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
