import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ToolbarPopupTitle } from "./toolbar-popup-title";
import { ToolbarSheetTitle } from "./toolbar-sheet-title";
import { ToolbarSidePanelTitle } from "./toolbar-sidepanel-title";
import { ToolbarTopSearch } from "./toolbar-top-search";
import { ToolbarTopTitle } from "./toolbar-top-title";

describe("Toolbar", () => {
  it("Top.Title: heading, back, text action, icons with a badge", async () => {
    const onBack = vi.fn();
    const { container } = render(
      <ToolbarTopTitle
        title="Order details"
        subtitle="#1024"
        leftAction={{ icon: "arrow_back", label: "Back", onClick: onBack }}
        textAction={{ label: "Skip", onClick: () => {} }}
        actions={[{ icon: "favorite", label: "Basket, 2 items", badge: 2, onClick: () => {} }]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Order details" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Basket, 2 items" })).toHaveTextContent("2");
    await expectNoAxeViolations(container);
  });

  it("Top: Swipe Down adds the bottom border, slots stay out when not given", () => {
    const { container } = render(<ToolbarTopTitle title="Wishlist" scrolled />);
    expect(container.querySelector("header")).toHaveClass("border-b", "h-52");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("Top.Search: a named Small Text Input", async () => {
    const { container } = render(<ToolbarTopSearch search={{ label: "Search products" }} />);
    expect(screen.getByRole("searchbox", { name: "Search products" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("PopUp, Sheet and SidePanel show their actions only when given", () => {
    const action = { icon: "close_small" as const, label: "Close", onClick: () => {} };
    const { rerender } = render(<ToolbarPopupTitle title="Select size" titleId="t" />);
    expect(screen.getByRole("heading", { name: "Select size" })).toHaveAttribute("id", "t");
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<ToolbarPopupTitle title="Select size" subtitle="Step 1" rightAction={action} />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    rerender(<ToolbarSheetTitle title="Filters" leftAction={action} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    rerender(<ToolbarSidePanelTitle title="Menu" rightAction={action} />);
    expect(screen.getByRole("heading", { name: "Menu" })).toHaveClass("text-title-lg");
  });
});
