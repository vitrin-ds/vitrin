import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { QUICK_VIEW_PRODUCT } from "./quick-view.fixtures";
import { QuickView, type QuickViewProps } from "./quick-view";

function mockDesktop(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  // @ts-expect-error jsdom has no matchMedia; restore that.
  delete window.matchMedia;
});

function Example(props: Partial<QuickViewProps>) {
  const [open, setOpen] = useState(false);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Quick view
      </button>
      <QuickView
        open={open}
        onClose={() => setOpen(false)}
        product={QUICK_VIEW_PRODUCT}
        onAddToBag={vi.fn()}
        {...props}
      />
    </main>
  );
}

describe("QuickView", () => {
  it("desktop: a wide modal named by its title and the product, focus on close", async () => {
    mockDesktop(true);
    render(<Example defaultVariant="50" />);
    await userEvent.click(screen.getByRole("button", { name: "Quick view" }));
    const dialog = screen.getByRole("dialog", { name: "Quick view Hydrating Gel Cream 50 ml" });
    expect(dialog).toHaveClass("max-w-904", "p-24", "bg-surface-raised", "shadow-md");
    // The 904 panel on BaseModal: the product panel is not the description.
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(within(dialog).getByText("Brand A")).toBeInTheDocument();
    expect(within(dialog).getByRole("spinbutton", { name: "Quantity" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Zoom image" })).toBeNull();
    expect(within(dialog).getByRole("link", { name: "View full details" })).toHaveAttribute(
      "href",
      "/p/hydrating-gel-cream",
    );
    await expectNoAxeViolations(dialog);
  });

  it("returns focus to the opener on Escape", async () => {
    mockDesktop(true);
    render(<Example />);
    const opener = screen.getByRole("button", { name: "Quick view" });
    await userEvent.click(opener);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("mobile: a bottom sheet without brand, rating or stepper", async () => {
    mockDesktop(false);
    render(<Example defaultVariant="50" />);
    await userEvent.click(screen.getByRole("button", { name: "Quick view" }));
    const sheet = screen.getByRole("dialog", { name: "Quick view" });
    expect(sheet).toHaveClass("rounded-t-24");
    expect(within(sheet).queryByText("Brand A")).toBeNull();
    expect(within(sheet).queryByRole("spinbutton")).toBeNull();
    // Add to bag sits in the sheet's fixed footer, outside the scrolling content.
    const footer = sheet.lastElementChild as HTMLElement;
    expect(footer).toHaveClass("shadow-up");
    expect(within(footer).getByRole("button", { name: "Add to bag" })).toHaveClass("w-full");
    await expectNoAxeViolations(sheet);
  });

  it("asks for a variant before adding, then adds the selection", async () => {
    mockDesktop(true);
    const onAddToBag = vi.fn();
    render(<Example onAddToBag={onAddToBag} />);
    await userEvent.click(screen.getByRole("button", { name: "Quick view" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    expect(onAddToBag).not.toHaveBeenCalled();
    const group = screen.getByRole("group", { name: "Size" });
    expect(group).toHaveAccessibleDescription("Select a size first.");
    expect(screen.getByRole("button", { name: "30 ml" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "100 ml" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "50 ml" }));
    expect(screen.getByRole("button", { name: "50 ml" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    expect(onAddToBag).toHaveBeenCalledWith({ variant: "50", quantity: 2 });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an error when adding fails", async () => {
    mockDesktop(true);
    render(<Example defaultVariant="30" onAddToBag={() => Promise.reject(new Error("x"))} />);
    await userEvent.click(screen.getByRole("button", { name: "Quick view" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't add this to your bag");
  });

  it("mobile: shows the add error in the footer", async () => {
    mockDesktop(false);
    render(<Example defaultVariant="30" onAddToBag={() => Promise.reject(new Error("x"))} />);
    await userEvent.click(screen.getByRole("button", { name: "Quick view" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    const alert = await screen.findByRole("alert");
    expect(screen.getByRole("dialog").lastElementChild).toContainElement(alert);
  });

  it("resets the selection every time it opens", async () => {
    mockDesktop(true);
    render(<Example />);
    const opener = screen.getByRole("button", { name: "Quick view" });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole("button", { name: "50 ml" }));
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(opener);
    expect(screen.getByRole("button", { name: "50 ml" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
  });
});
