import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { NAVIGATION, SECONDARY_LINKS } from "./header.fixtures";
import { NavigationDrawer } from "./navigation-drawer";

function Example({ initialItemId }: { initialItemId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <NavigationDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={NAVIGATION}
        secondaryLinks={SECONDARY_LINKS}
        initialItemId={initialItemId}
        footer={<p>Footer row</p>}
      />
    </main>
  );
}

describe("NavigationDrawer", () => {
  it("drills into a menu and back, moving focus each way", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(screen.getByRole("link", { name: "My Profile" })).toHaveAttribute("href", "/account");
    expect(screen.getByText("Footer row")).toBeInTheDocument();
    await expectNoAxeViolations(dialog);

    await user.click(screen.getByRole("button", { name: "Make Up" }));
    const back = screen.getByRole("button", { name: "Back to menu: Make Up" });
    expect(back).toHaveFocus();
    // The first group is open; the rest are collapsed accordions.
    expect(screen.getByRole("button", { name: "Lip Makeup" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Lipstick" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Eye Makeup" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expectNoAxeViolations(dialog);

    await user.click(back);
    expect(screen.getByRole("button", { name: "Make Up" })).toHaveFocus();
  });

  it("opens straight on an item's menu and closes when a link is followed", async () => {
    const user = userEvent.setup();
    render(<Example initialItemId="categories" />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    expect(screen.getByRole("button", { name: "Back to menu: Shop by Categories" })).toHaveFocus();
    await user.click(screen.getByRole("link", { name: "Lipstick" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
