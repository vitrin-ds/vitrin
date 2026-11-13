import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Radio, RadioGroup } from "./radio";

type Args = {
  checked: boolean;
  disabled: boolean;
  error: boolean;
  showLabel: boolean;
  labelText: string;
};

const meta = {
  title: "Components/Inputs/Radio",
  // The defaults of Figma's `Radio` (Usage=Unchecked, State=Default) and its `.Base Radio Button`.
  args: {
    checked: false,
    disabled: false,
    error: false,
    showLabel: true,
    labelText: "Radio Button Label",
  },
  // The input stays uncontrolled so it can be clicked; the key restarts it when the control changes.
  render: ({ checked, showLabel, labelText, ...args }) => (
    <Radio
      key={String(checked)}
      name="demo"
      defaultChecked={checked}
      label={labelText}
      hideLabel={!showLabel}
      {...args}
    />
  ),
  parameters: {
    // The Figma properties: Usage, State (Disabled, Error), Show Label, Label Text.
    controls: { include: ["checked", "disabled", "error", "showLabel", "labelText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for mutually exclusive options where only one choice is allowed",
        "Always group radio buttons with at least two options",
        "Pre-select a default option when possible",
        "Stack vertically for better readability",
      ],
      dont: [
        "Don't use for multiple selections — use Checkbox instead",
        "Don't use a single radio button alone — use Checkbox or Toggle",
        "Don't use for actions — use Button instead",
        "Don't truncate label text — keep it concise but complete",
      ],
    },
    docs: {
      description: {
        component:
          "A selection control that allows users to choose exactly one option from a mutually exclusive set of choices. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    checked: {
      description: "Figma `Usage=Checked`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    error: {
      description: "Figma `State=Error`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
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
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "Radio Button Label" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** One choice of a set; use it inside a Group of two or more. */
export const Default: Story = {};

/** Mirrors the Figma set: Usage (Unchecked · Checked) × State (Default · Disabled · Error). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 justify-items-start gap-x-40 gap-y-24">
      {(["default", "disabled", "error"] as const).flatMap((state) => [
        <Radio
          key={`${state}-u`}
          name={`m-${state}`}
          label="Radio Button Label"
          disabled={state === "disabled"}
          error={state === "error"}
        />,
        <Radio
          key={`${state}-c`}
          name={`m-${state}`}
          label="Radio Button Label"
          defaultChecked
          disabled={state === "disabled"}
          error={state === "error"}
        />,
      ])}
    </div>
  ),
};

/** A RadioGroup: the question as legend, options stacked vertically, one pre-selected. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup legend="Delivery speed">
      <Radio name="speed" value="standard" label="Standard · 3–5 days" defaultChecked />
      <Radio name="speed" value="express" label="Express · next day" />
      <Radio name="speed" value="pickup" label="Store pickup (unavailable)" disabled />
    </RadioGroup>
  ),
};

/** Arrow keys move the selection inside a group (native radio behaviour). */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="p-8">
      <RadioGroup legend="Size">
        <Radio name="size" value="s" label="Small" defaultChecked />
        <Radio name="size" value="m" label="Medium" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const medium = canvas.getByRole("radio", { name: "Medium" });
    await expect(medium).toBeChecked();
    await expect(medium).toHaveFocus();
  },
};
