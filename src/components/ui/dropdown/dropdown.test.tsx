import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { DropdownItem } from "./dropdown-item";
import { Dropdown, type DropdownOption } from "./dropdown";

const COUNTRIES: DropdownOption[] = [
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "bg", label: "Bulgaria", disabled: true },
  { value: "hr", label: "Croatia" },
  { value: "cy", label: "Cyprus" },
  { value: "cz", label: "Czechia" },
];

function setup(props: Partial<Parameters<typeof Dropdown>[0]> = {}) {
  const onValueChange = vi.fn();
  const utils = render(
    <Dropdown label="Country" options={COUNTRIES} onValueChange={onValueChange} {...props} />,
  );
  const trigger = screen.getByRole("combobox", { name: "Country" });
  return { ...utils, trigger, onValueChange };
}

describe("Dropdown", () => {
  it("is a collapsed, labelled select-only combobox with a placeholder", async () => {
    const { trigger, container } = setup();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveTextContent("Select");
    expect(screen.queryByRole("listbox")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("opens on click, names the listbox and passes axe while open", async () => {
    const { trigger, container } = setup();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox", { name: "Country" })).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(6);
    await expectNoAxeViolations(container);
  });

  it("moves with the arrow keys, skips disabled options and selects with Enter", async () => {
    const { trigger, onValueChange } = setup();
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}"); // opens on Austria
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Austria" }).id,
    );
    await userEvent.keyboard("{ArrowDown}{ArrowDown}"); // Belgium → (Bulgaria disabled) → Croatia
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Croatia" }).id,
    );
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("hr");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Croatia");
    expect(trigger).toHaveFocus();
  });

  it("jumps with Home / End and type-ahead", async () => {
    const { trigger } = setup();
    trigger.focus();
    await userEvent.keyboard("{End}");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Czechia" }).id,
    );
    await userEvent.keyboard("{Home}");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Austria" }).id,
    );
    await userEvent.keyboard("cy");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Cyprus" }).id,
    );
  });

  it("closes with Escape without changing the value", async () => {
    const { trigger, onValueChange } = setup({ defaultValue: "be" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Belgium");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("marks the selected option and selects with a click", async () => {
    const { trigger, onValueChange } = setup({ defaultValue: "be" });
    await userEvent.click(trigger);
    expect(screen.getByRole("option", { name: "Belgium" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(screen.getByRole("option", { name: "Cyprus" }));
    expect(onValueChange).toHaveBeenCalledWith("cy");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("ignores clicks on disabled options", async () => {
    const { trigger, onValueChange } = setup();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Bulgaria" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeVisible();
  });

  it("closes when the pointer goes down outside", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.click(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("wires helper / error text and mirrors the value into a hidden native select", async () => {
    const { trigger, container } = setup({
      name: "country",
      defaultValue: "at",
      required: true,
      errorText: "Choose where we deliver",
    });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAccessibleDescription("Choose where we deliver");
    const native = container.querySelector('select[name="country"]');
    expect(native).toHaveValue("at");
    expect(native).not.toBeRequired();
    expect(native).toHaveAttribute("tabindex", "-1");
    expect(native).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("submits the value with its form", async () => {
    render(
      <form aria-label="Address">
        <Dropdown label="Country" name="country" options={COUNTRIES} defaultValue="be" />
      </form>,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Country" }));
    await userEvent.click(screen.getByRole("option", { name: "Cyprus" }));
    const data = new FormData(screen.getByRole("form", { name: "Address" }) as HTMLFormElement);
    expect(data.get("country")).toBe("cy");
  });

  it("takes browser autofill through the native select (autocomplete)", () => {
    const { trigger, container, onValueChange } = setup({ autoComplete: "country" });
    const native = container.querySelector('select[autocomplete="country"]') as HTMLSelectElement;
    expect(native).not.toBeNull();
    fireEvent.change(native, { target: { value: "hr" } });
    expect(onValueChange).toHaveBeenCalledWith("hr");
    expect(trigger).toHaveTextContent("Croatia");
    // A disabled or unknown option is ignored.
    fireEvent.change(native, { target: { value: "bg" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveTextContent("Croatia");
  });

  it("renders no native select without name or autocomplete", () => {
    const { container } = setup();
    expect(container.querySelector("select")).toBeNull();
  });

  it("calls onBlur when focus leaves the trigger, not while picking with the pointer", async () => {
    const onBlur = vi.fn();
    const { trigger } = setup({ onBlur });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Cyprus" }));
    expect(onBlur).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("can't be opened when disabled", async () => {
    const { trigger } = setup({ disabled: true });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  describe('variant="text"', () => {
    const SORTS: DropdownOption[] = [
      { value: "relevance", label: "Relevance" },
      { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Price: Low to High" },
    ];

    function setupText(onValueChange = vi.fn()) {
      const utils = render(
        <Dropdown
          variant="text"
          label="Sort:"
          options={SORTS}
          defaultValue="relevance"
          onValueChange={onValueChange}
        />,
      );
      return { ...utils, onValueChange };
    }

    it("shows the label as a prefix and names itself with label + value", async () => {
      const { container } = setupText();
      const trigger = screen.getByRole("combobox", { name: "Sort: Relevance" });
      expect(trigger).toHaveTextContent("Sort: Relevance");
      expect(trigger).toHaveClass("text-title-sm", "min-h-44");
      expect(container.querySelector("label")).toBeNull();
      await expectNoAxeViolations(container);
    });

    it("has the same listbox and keyboard behaviour, and the name follows the value", async () => {
      const { container, onValueChange } = setupText();
      const trigger = screen.getByRole("combobox", { name: "Sort: Relevance" });
      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("listbox", { name: "Sort:" })).toBeVisible();
      await expectNoAxeViolations(container);
      await userEvent.keyboard("{End}{Enter}");
      expect(onValueChange).toHaveBeenCalledWith("price-asc");
      expect(screen.getByRole("combobox", { name: "Sort: Price: Low to High" })).toHaveFocus();
      await userEvent.keyboard("n{Escape}");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("DropdownItem", () => {
  it("maps the Figma states and shows the check on the selected item", () => {
    render(
      <ul role="listbox" aria-label="Options">
        <DropdownItem label="One" selected rightIcon="add" />
        <DropdownItem label="Two" highlighted />
        <DropdownItem label="Three" disabled />
      </ul>,
    );
    expect(screen.getByRole("option", { name: "One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Two" })).toHaveAttribute("data-highlighted");
    expect(screen.getByRole("option", { name: "Three" })).toHaveAttribute("aria-disabled", "true");
  });
});
