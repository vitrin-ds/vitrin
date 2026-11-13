import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Toggle } from "./toggle";

describe("Toggle", () => {
  it("is a switch named by its label", async () => {
    const { container } = render(<Toggle label="Email me about offers" />);
    const toggle = screen.getByRole("switch", { name: "Email me about offers" });
    expect(toggle).not.toBeChecked();
    await expectNoAxeViolations(container);
  });

  it("switches with a click and with Space", async () => {
    const onChange = vi.fn();
    render(<Toggle label="Dark mode" onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    await userEvent.click(screen.getByText("Dark mode"));
    expect(toggle).toBeChecked();
    toggle.focus();
    await userEvent.keyboard(" ");
    expect(toggle).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("puts the label before the track and uses toggle-* tokens", () => {
    const { container } = render(<Toggle label="Notifications" defaultChecked />);
    const label = container.querySelector("label")!;
    expect(label.firstElementChild).toHaveTextContent("Notifications");
    const track = label.querySelector('[aria-hidden="true"]')!;
    expect(track.className).toMatch(/bg-\(--th-toggle-off-bg\)/);
    expect(track.className).toMatch(/peer-checked:bg-\(--th-toggle-on-bg\)/);
    expect(track.className).toMatch(/inset-ring-\(--th-toggle-off-border\)/);
    expect(track).toHaveClass("peer-checked:inset-ring-0");
  });

  it("does not switch when disabled", async () => {
    render(<Toggle label="Sync" disabled />);
    await userEvent.click(screen.getByText("Sync"));
    expect(screen.getByRole("switch", { name: "Sync" })).not.toBeChecked();
  });
});
