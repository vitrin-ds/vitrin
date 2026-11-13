import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";

type Args = {
  disabled: boolean;
  error: boolean;
  checked: boolean;
  indeterminate: boolean;
  showLabel: boolean;
  labelText: string;
};

const meta = {
  title: "Components/Inputs/Checkbox",
  // The defaults of Figma's `Checkbox` (Usage=Unchecked, State=Default) and its `.Base Checkbox`.
  args: {
    disabled: false,
    error: false,
    checked: false,
    indeterminate: false,
    showLabel: true,
    labelText: "Label Text",
  },
  // The input stays uncontrolled so it can be clicked; the key restarts it when the control changes.
  render: ({ checked, showLabel, labelText, ...args }) => (
    <Checkbox
      key={String(checked)}
      defaultChecked={checked}
      label={labelText}
      hideLabel={!showLabel}
      {...args}
    />
  ),
  parameters: {
    // The Figma properties: State (Disabled, Error), Usage, Show Label, Label Text.
    controls: {
      include: ["disabled", "error", "checked", "indeterminate", "showLabel", "labelText"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for multi-select scenarios where users can choose multiple options",
        "Always include a label for accessibility",
        'Use indeterminate state for "select all" when only some items are selected',
        "Group related checkboxes together visually",
      ],
      dont: [
        "Don't use for mutually exclusive options — use Radio instead",
        "Don't use for binary settings that take effect immediately — use Toggle instead",
        "Don't truncate label text — keep it concise but complete",
        "Don't disable checkboxes without explaining why",
      ],
    },
    docs: {
      description: {
        component:
          "A selection control that allows users to choose one or multiple options from a set, with support for checked, unchecked, and indeterminate states. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    error: {
      description: "Figma `State=Error`: explain the error next to the group.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    checked: {
      description: "Figma `Usage=Checked`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    indeterminate: {
      description: 'Figma `Usage=Indeterminate`, e.g. "select all" with only some items selected.',
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
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label Text" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A choice among several that can all be on. */
export const Default: Story = {};

/** Mirrors the Figma set: Usage (Unchecked · Checked · Indeterminate) × State (Default · Disabled · Error). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-3 justify-items-start gap-x-40 gap-y-24">
      {(["default", "disabled", "error"] as const).flatMap((state) => [
        <Checkbox
          key={`${state}-u`}
          label="Label Text"
          disabled={state === "disabled"}
          error={state === "error"}
        />,
        <Checkbox
          key={`${state}-c`}
          label="Label Text"
          defaultChecked
          disabled={state === "disabled"}
          error={state === "error"}
        />,
        <Checkbox
          key={`${state}-i`}
          label="Label Text"
          indeterminate
          disabled={state === "disabled"}
          error={state === "error"}
        />,
      ])}
    </div>
  ),
};
