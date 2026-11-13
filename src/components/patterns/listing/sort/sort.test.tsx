import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Sort, SortSheet, SORT_MAX_OPTIONS } from "./sort";
import {
  DEFAULT_SORT,
  isSortKey,
  SORT_KEYS,
  sortFromSearchParams,
  sortToSearchParams,
} from "./sort-url";

describe("sort URL helpers", () => {
  it("reads a known key and falls back to the default", () => {
    expect(sortFromSearchParams(new URLSearchParams("sort=price-asc"))).toBe("price-asc");
    expect(sortFromSearchParams(new URLSearchParams("sort=cheapest"))).toBe(DEFAULT_SORT);
    expect(sortFromSearchParams(new URLSearchParams())).toBe("relevance");
    expect(isSortKey(null)).toBe(false);
  });

  it("writes the key, keeps filters, drops page and the default", () => {
    const base = new URLSearchParams("brand=aurell&page=2");
    expect(sortToSearchParams("newest", base).toString()).toBe("brand=aurell&sort=newest");
    expect(
      sortToSearchParams("relevance", new URLSearchParams("sort=newest&q=gel")).toString(),
    ).toBe("q=gel");
    expect(base.toString()).toBe("brand=aurell&page=2");
  });

  it("offers at most 7 options (Figma Don't)", () => {
    expect(SORT_KEYS).toHaveLength(SORT_MAX_OPTIONS);
  });
});

describe("Sort", () => {
  it("is a text select-only combobox named by prefix + value that closes on selection", async () => {
    const onChange = vi.fn();
    const { container } = render(<Sort value="relevance" onChange={onChange} />);
    const combobox = screen.getByRole("combobox", { name: "Sort: Relevance" });
    expect(combobox).toHaveTextContent("Sort: Relevance");
    expect(combobox).toHaveClass("text-title-sm");
    combobox.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(SORT_MAX_OPTIONS);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("newest");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    await expectNoAxeViolations(container);
  });

  it("opens the mobile sheet from a trigger that names the current sort", async () => {
    render(<Sort value="price-desc" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Sort: Price: High to Low" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Sort by" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});

describe("SortSheet", () => {
  it("keeps the choice as a draft until Apply", async () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(<SortSheet open onClose={onClose} value="newest" onApply={onApply} />);
    const sheet = screen.getByRole("dialog", { name: "Sort by" });
    expect(within(sheet).getByRole("radio", { name: "Newest" })).toBeChecked();
    await userEvent.click(within(sheet).getByRole("radio", { name: "Top rated" }));
    expect(onApply).not.toHaveBeenCalled();
    await userEvent.click(within(sheet).getByRole("button", { name: "Reset" }));
    expect(within(sheet).getByRole("radio", { name: "Relevance" })).toBeChecked();
    await userEvent.click(within(sheet).getByRole("radio", { name: "Discount" }));
    await userEvent.click(within(sheet).getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith("discount");
    expect(onClose).toHaveBeenCalled();
    await expectNoAxeViolations(sheet);
  });
});
