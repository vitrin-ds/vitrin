import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Dropdown, type DropdownOption } from "./dropdown";

const COUNTRIES: DropdownOption[] = [
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "bg", label: "Bulgaria", disabled: true },
  { value: "hr", label: "Croatia" },
  { value: "cy", label: "Cyprus" },
  { value: "cz", label: "Czechia" },
  { value: "dk", label: "Denmark" },
];

const SIZES = ["lg", "md", "sm"] as const;

/** Figma's `Show` booleans. Storybook only: in code a part shows when it is given. */
type Args = {
  size: (typeof SIZES)[number];
  disabled: boolean;
  errorText: string;
  showLabel: boolean;
  labelText: string;
  showRequired: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showValue: boolean;
  value: string;
  showEmptyState: boolean;
  placeholderText: string;
  showHelpMessage: boolean;
  helpMessageText: string;
};

const meta = {
  title: "Components/Inputs/Dropdown",
  // The defaults of Figma's `Dropdown` and its `.Base Dropdown`.
  args: {
    size: "lg",
    disabled: false,
    errorText: "",
    showLabel: true,
    labelText: "Label",
    showRequired: true,
    showLeftIcon: true,
    leftIcon: "radio_button_unchecked",
    showValue: true,
    value: "at",
    showEmptyState: true,
    placeholderText: "Select",
    showHelpMessage: true,
    helpMessageText: "Message",
  },
  // The value is internal state; the key restarts it when the control changes.
  render: ({
    showLabel,
    labelText,
    showRequired,
    showLeftIcon,
    leftIcon,
    showValue,
    value,
    showEmptyState,
    placeholderText,
    showHelpMessage,
    helpMessageText,
    errorText,
    ...args
  }) => (
    <Dropdown
      key={showValue ? value : "empty"}
      {...args}
      options={COUNTRIES}
      label={labelText}
      hideLabel={!showLabel}
      required={showRequired}
      leftIcon={showLeftIcon ? leftIcon : undefined}
      defaultValue={showValue ? value : null}
      placeholder={showEmptyState ? placeholderText : ""}
      helperText={showHelpMessage ? helpMessageText : undefined}
      errorText={errorText || undefined}
    />
  ),
  parameters: {
    // The Figma properties: Size, State (Error, Disabled) and the .Base Dropdown slots.
    controls: {
      include: [
        "size",
        "disabled",
        "errorText",
        "showLabel",
        "labelText",
        "showRequired",
        "showLeftIcon",
        "leftIcon",
        "showValue",
        "value",
        "showEmptyState",
        "placeholderText",
        "showHelpMessage",
        "helpMessageText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for selecting one option from 5+ choices",
        "Always include a label for accessibility",
        'Provide a clear placeholder like "Select..." when no value is chosen',
        "Use helper text to provide additional context when needed",
      ],
      dont: [
        "Don't use for fewer than 5 options — use Radio Buttons instead",
        "Don't use for multiple selections — use Multi-select or Checkboxes instead",
        "Don't truncate selected values — ensure adequate width",
        "Don't disable without explaining why in helper text",
      ],
    },
    docs: {
      description: {
        component:
          "A form control that reveals a list of options when activated, allowing users to select a single value from a predefined set. Hover and Focus are CSS states: use the pointer and the keyboard on the example to see them.",
      },
      // The list opens in a portal: keep each example in its own frame on the docs page.
      story: { inline: false, iframeHeight: 560 },
    },
  },
  argTypes: {
    size: {
      description: "Figma `Size`. Forms use Medium.",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: '"lg" | "md" | "sm"' },
        defaultValue: { summary: "lg" },
      },
    },
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorText: {
      description:
        "Figma `State=Error`: the message under the field, in place of the help message. Empty: no error.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    showLabel: {
      description:
        "Figma `Show Label`. Off: the label stays for screen readers only. In code: `hideLabel`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    labelText: {
      description: "Figma `Label Text`. In code: `label`.",
      control: "text",
      if: { arg: "showLabel" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label" } },
    },
    showRequired: {
      description: "Figma `Show Required`: the asterisk after the label. In code: `required`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: {
        type: { summary: "IconName" },
        defaultValue: { summary: "radio_button_unchecked" },
      },
    },
    showValue: {
      description: "Figma `Show Value`. Off: nothing selected. In code: `defaultValue`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    value: {
      description: "Figma `Value Text`: the selected option. In code: `defaultValue`.",
      control: {
        type: "select",
        labels: Object.fromEntries(COUNTRIES.map((o) => [o.value, o.label])),
      },
      options: COUNTRIES.filter((option) => !option.disabled).map((option) => option.value),
      if: { arg: "showValue" },
      table: { type: { summary: "string" }, defaultValue: { summary: "at" } },
    },
    showEmptyState: {
      description:
        "Figma `Show Empty State`: the placeholder, seen while nothing is selected. Off: empty text.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    placeholderText: {
      description: "Figma `Placeholder Text`. In code: `placeholder`.",
      control: "text",
      if: { arg: "showEmptyState" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Select" } },
    },
    showHelpMessage: {
      description: "Figma `Show Help Message`. In code: pass `helperText`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    helpMessageText: {
      description: "Figma `Help Message Text`. In code: `helperText`.",
      control: "text",
      if: { arg: "showHelpMessage" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Message" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

// One field at the 3-column aside width (334px), with room for the open list.
const narrow: Story["decorators"] = [
  (Story) => (
    <div className="h-320 w-334">
      <Story />
    </div>
  ),
];

/** Choose one option from a list of five or more. */
export const Default: Story = {
  decorators: narrow,
  args: { labelText: "Country", showValue: false, showLeftIcon: false, showHelpMessage: false },
};

/** Mirrors the Figma trigger set: Idle · Has Value · Error · Disabled per size (Hover / Focus are CSS states). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 gap-24 desktop:grid-cols-3">
      {SIZES.map((size) => (
        <div key={size} className="flex w-270 flex-col gap-16">
          <Dropdown options={COUNTRIES} size={size} label="Label" required />
          <Dropdown options={COUNTRIES} size={size} label="Label" required defaultValue="be" />
          <Dropdown options={COUNTRIES} size={size} label="Label" required errorText="Message" />
          <Dropdown
            options={COUNTRIES}
            size={size}
            label="Label"
            required
            defaultValue="be"
            disabled
          />
        </div>
      ))}
    </div>
  ),
};

/** Open list: highlighted, selected and disabled options (Figma Dropdown Item states). */
export const Open: Story = {
  decorators: narrow,
  args: {
    labelText: "Country",
    value: "be",
    leftIcon: "location_on",
    helpMessageText: "We deliver to EU countries.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Country" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("listbox", { name: "Country" })).toBeVisible();
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      canvas.getByRole("option", { name: "Croatia" }).id,
    );
  },
};

/** Type a letter to jump to an option, Enter to select it. */
export const Keyboard: Story = {
  decorators: narrow,
  args: { labelText: "Country", showValue: false, showLeftIcon: false, showHelpMessage: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const trigger = canvas.getByRole("combobox", { name: "Country" });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("d{Enter}");
    await expect(trigger).toHaveTextContent("Denmark");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

const SORTS: DropdownOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "best-sellers", label: "Best sellers" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/**
 * `variant="text"`: the plain text trigger of the Figma Sort pattern (31511:13429). The label is
 * the visible prefix; the accessible name is label + value. The menu opens under it, end-aligned.
 */
export const Text: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="flex h-320 w-556 justify-end">
        <Story />
      </div>
    ),
  ],
  render: () => <Dropdown variant="text" label="Sort:" options={SORTS} defaultValue="relevance" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const trigger = canvas.getByRole("combobox", { name: "Sort: Relevance" });
    await expect(trigger).toHaveFocus();
    await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(canvas.getByRole("combobox", { name: "Sort: Newest" })).toHaveFocus();
  },
};

/**
 * In a form with `name` + `autoComplete="country"`: a visually hidden native select mirrors the
 * value, so the form submits it and the browser's address autofill can fill it.
 */
export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  decorators: narrow,
  render: () => (
    <form aria-label="Delivery address" onSubmit={(event) => event.preventDefault()}>
      <Dropdown
        label="Country"
        options={COUNTRIES}
        size="md"
        name="country"
        autoComplete="shipping country"
        required
      />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Country" }));
    await userEvent.click(canvas.getByRole("option", { name: "Croatia" }));
    const form = canvas.getByRole("form", { name: "Delivery address" }) as HTMLFormElement;
    await expect(new FormData(form).get("country")).toBe("hr");
  },
};

/** Options with a picture: the country code and country of the account forms (Figma 03.02). */
export const WithImages: Story = {
  parameters: { controls: { disable: true } },
  decorators: narrow,
  render: () => (
    <Dropdown
      label="Country"
      size="md"
      value="GB"
      options={[
        { value: "GB", label: "United Kingdom", image: "/brand/flags/gb.svg" },
        { value: "DE", label: "Germany", image: "/brand/flags/de.svg" },
        { value: "FR", label: "France", image: "/brand/flags/fr.svg" },
      ]}
    />
  ),
};
