import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { SearchAutocomplete, type SearchOption } from "./search-autocomplete";

const OPTIONS: SearchOption[] = [
  { value: "q1", label: "face cleansing tonic", group: "Popular searches", icon: "bubble" },
  { value: "q2", label: "face mask", group: "Popular searches", icon: "bubble" },
  { value: "p1", label: "Face Cream", group: "Suggested products", icon: "bubble" },
  { value: "c1", label: "Skin Cleansing Products", group: "Suggested categories" },
];

function setup(props: Partial<Parameters<typeof SearchAutocomplete>[0]> = {}) {
  const onSelect = vi.fn();
  const onQueryChange = vi.fn();
  const onSubmit = vi.fn((_query: string, event: { preventDefault: () => void }) =>
    event.preventDefault(),
  );
  const utils = render(
    <SearchAutocomplete
      label="Search products"
      options={OPTIONS}
      onSelect={onSelect}
      onQueryChange={onQueryChange}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  const input = screen.getByRole("combobox", { name: "Search products" });
  return { ...utils, input, onSelect, onQueryChange, onSubmit };
}

const activeOption = (input: HTMLElement) =>
  document.getElementById(input.getAttribute("aria-activedescendant") ?? "");

describe("SearchAutocomplete", () => {
  it("is a GET search form to /search?q= with a collapsed, labelled combobox", async () => {
    const { input, container } = setup();
    const form = screen.getByRole("search", { name: "Search products" });
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    expect(input).toHaveAttribute("name", "q");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute(
      "aria-controls",
      screen.getByRole("listbox", { hidden: true }).id,
    );
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("type", "submit");
    await expectNoAxeViolations(container);
  });

  it("opens on focus with grouped suggestions, announces the count and passes axe", async () => {
    const { input, container } = setup();
    await userEvent.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Search products" });
    expect(listbox).toBeVisible();
    expect(screen.getByRole("group", { name: "Popular searches" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Suggested categories" })).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent("4 suggestions");
    await expectNoAxeViolations(container);
  });

  it("moves through every group with the arrow keys and stops at the ends", async () => {
    const { input } = setup({ openOnFocus: false });
    input.focus();
    expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(activeOption(input)).toHaveTextContent("face cleansing tonic");
    expect(activeOption(input)).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeOption(input)).toHaveTextContent("Face Cream");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeOption(input)).toHaveTextContent("Skin Cleansing Products");
    await userEvent.keyboard("{ArrowUp}");
    expect(activeOption(input)).toHaveTextContent("Face Cream");
    expect(input).toHaveFocus();
  });

  it("opens on the last option with ArrowUp", async () => {
    const { input } = setup({ openOnFocus: false });
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(activeOption(input)).toHaveTextContent("Skin Cleansing Products");
  });

  it("selects the highlighted option with Enter, fills the field and closes", async () => {
    const { input, onSelect, onSubmit, onQueryChange } = setup();
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
    expect(onQueryChange).toHaveBeenLastCalledWith("face mask");
    expect(input).toHaveValue("face mask");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it("selects with a click and keeps focus in the field", async () => {
    const { input, onSelect } = setup();
    await userEvent.click(input);
    await userEvent.click(screen.getByRole("option", { name: "Face Cream" }));
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[2]);
    expect(input).toHaveValue("Face Cream");
    expect(input).toHaveFocus();
  });

  it("submits the typed query with Enter when no option is highlighted", async () => {
    const { input, onSubmit, onQueryChange } = setup();
    await userEvent.type(input, "  face ");
    expect(onQueryChange).toHaveBeenLastCalledWith("  face ");
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("face", expect.anything());
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("does not submit an empty query", async () => {
    const { input, onSubmit } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it("closes with Escape, then clears the field with a second Escape", async () => {
    const { input, onQueryChange } = setup({ defaultValue: "face" });
    await userEvent.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("face");
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveValue("");
    expect(onQueryChange).toHaveBeenLastCalledWith("");
  });

  it("leaves Home / End to text editing", async () => {
    const { input } = setup({ defaultValue: "face" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Home}");
    expect((input as HTMLInputElement).selectionStart).toBe(0);
    expect(activeOption(input)).toHaveTextContent("face cleansing tonic");
    await userEvent.keyboard("{End}");
    expect((input as HTMLInputElement).selectionStart).toBe(4);
  });

  it("typing resets the highlight; Tab closes the list and moves on", async () => {
    const { input } = setup();
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.type(input, "f");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the pointer goes down outside", async () => {
    const { input } = setup();
    await userEvent.click(input);
    await userEvent.click(document.body);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("highlights the query inside each suggestion as a bold mark", async () => {
    const { input, container } = setup({ defaultValue: "face" });
    await userEvent.click(input);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0]).toHaveTextContent("face");
    expect(marks[0].querySelector("strong")).not.toBeNull();
  });

  it("shows a busy state while loading and announces no results", async () => {
    const { input, rerender } = setup({ options: [], loading: true, defaultValue: "zz" });
    await userEvent.click(input);
    expect(screen.getByRole("status")).toHaveTextContent("Loading suggestions");
    expect(input).toHaveAttribute("aria-expanded", "false");
    rerender(<SearchAutocomplete label="Search products" options={[]} defaultValue="zz" />);
    expect(screen.getByRole("status")).toHaveTextContent("No suggestions");
  });

  it("works controlled: the parent owns the query and filters the options", async () => {
    function Controlled() {
      const [query, setQuery] = useState("");
      const options = OPTIONS.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
      return (
        <SearchAutocomplete
          label="Search products"
          value={query}
          onQueryChange={setQuery}
          options={query ? options : []}
          onSelect={() => {}}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "mask");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("status")).toHaveTextContent("1 suggestion");
  });

  it("shows focus with the input box border, not a focus ring", () => {
    render(<SearchAutocomplete label="Search" options={[]} />);
    const box = screen.getByRole("combobox", { name: "Search" }).parentElement!;
    expect(box).toHaveClass("focus-within:inset-ring-(--th-input-border-focus)");
    expect(box.className).not.toMatch(/focus-ring/);
  });
});
