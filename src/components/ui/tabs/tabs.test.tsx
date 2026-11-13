import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Tab, TabList, TabPanel, Tabs, TabLink } from "./tabs";

function Example({
  onValueChange,
  orientation,
}: {
  onValueChange?: (v: string) => void;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <Tabs defaultValue="all" onValueChange={onValueChange} orientation={orientation}>
      <TabList label="Categories">
        <Tab value="all">All</Tab>
        <Tab value="skincare" badge={2}>
          Skincare
        </Tab>
        <Tab value="hair" disabled>
          Hair
        </Tab>
        <Tab value="guides" leftIcon="info">
          Guides
        </Tab>
      </TabList>
      <TabPanel value="all">All products</TabPanel>
      <TabPanel value="skincare">Skincare products</TabPanel>
      <TabPanel value="hair">Hair products</TabPanel>
      <TabPanel value="guides">Guides list</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("keeps a revealFrom panel mounted and hides it by CSS below the breakpoint only", async () => {
    render(
      <Tabs defaultValue="map">
        <TabList label="Results view" layout="fill">
          <Tab value="list">List</Tab>
          <Tab value="map">Map</Tab>
        </TabList>
        <TabPanel value="list" revealFrom="desktop">
          Store list
        </TabPanel>
        <TabPanel value="map">Map view</TabPanel>
      </Tabs>,
    );
    const list = screen.getByText("Store list");
    expect(list).not.toHaveAttribute("hidden");
    expect(list).toHaveClass("max-desktop:hidden");
    await userEvent.click(screen.getByRole("tab", { name: "List" }));
    expect(list).not.toHaveClass("max-desktop:hidden");
    expect(screen.queryByText("Map view")).toBeNull();
  });

  it("wires tablist, tabs and panels (APG)", async () => {
    const { container } = render(<Example />);
    const list = screen.getByRole("tablist", { name: "Categories" });
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
    const all = screen.getByRole("tab", { name: "All" });
    expect(all).toHaveAttribute("aria-selected", "true");
    expect(all).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: /Skincare/ })).toHaveAttribute("tabindex", "-1");
    const panel = screen.getByRole("tabpanel", { name: "All" });
    expect(panel).toHaveTextContent("All products");
    expect(all).toHaveAttribute("aria-controls", panel.id);
    expect(screen.queryByText("Skincare products")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("moves and selects with the arrows, wraps, skips disabled tabs, and Home / End jump", async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Skincare/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Guides" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Guides" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Guides list");
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([
      "skincare",
      "guides",
      "all",
      "guides",
      "all",
      "guides",
    ]);
  });

  it("uses Up / Down when vertical", async () => {
    render(<Example orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: /Skincare/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Skincare/ })).toHaveFocus();
    expect(screen.getByRole("tab", { name: /Skincare/ })).toHaveClass(
      "text-text-accent",
      "enabled:hover:text-interactive-hover",
      "after:w-2",
    );
  });

  it("draws the Figma indicator: 1px neutral, 2px interactive when selected", () => {
    render(<Example />);
    expect(screen.getByRole("tab", { name: "All" })).toHaveClass(
      "after:h-2",
      "after:bg-interactive-default",
      "bg-surface-primary",
    );
    expect(screen.getByRole("tab", { name: "Guides" })).toHaveClass(
      "after:h-1",
      "after:bg-border-neutral",
    );
  });

  it("throws outside <Tabs>", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Tab value="x">X</Tab>)).toThrow(/inside <Tabs>/);
  });
});

describe("TabLink", () => {
  it("is a link with aria-current and the Horizontal or Vertical Tab look", () => {
    render(
      <nav aria-label="Topics">
        <TabLink href="/a" current>
          A
        </TabLink>
        <TabLink href="/b" orientation="vertical">
          B
        </TabLink>
      </nav>,
    );
    const a = screen.getByRole("link", { name: "A" });
    expect(a).toHaveAttribute("aria-current", "page");
    expect(a).toHaveClass("after:h-2");
    const b = screen.getByRole("link", { name: "B" });
    expect(b).not.toHaveAttribute("aria-current");
    expect(b).toHaveClass("after:w-1");
    expect(b.querySelector("[data-icon]")).toBeNull();
  });
});
