import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toggle } from "./toggle";

type Args = {
  checked: boolean;
  disabled: boolean;
};

const meta = {
  title: "Components/Actions/Toggle",
  // The defaults of Figma's `Toggle`: Status=On, State=Default.
  args: { checked: true, disabled: false },
  // The input stays uncontrolled so it can be clicked; the key restarts it when the control changes.
  render: ({ checked, disabled }) => (
    <Toggle
      key={String(checked)}
      defaultChecked={checked}
      disabled={disabled}
      label="Email me about offers"
    />
  ),
  parameters: {
    // The Figma properties: Status, State Disabled. The label has no Figma property.
    controls: { include: ["checked", "disabled"] },
    figma: {
      do: [
        "Use for immediate binary settings that take effect instantly",
        "Place the label to the left of the toggle for consistency",
        'Use clear, affirmative labels describing the "on" state',
        "Ensure sufficient touch target size for mobile (minimum 44px)",
      ],
      dont: [
        "Don't use for actions that require confirmation or submission",
        "Don't use when more than two options exist — use Radio or Select instead",
        "Don't use for destructive or irreversible actions",
        "Don't rely solely on color to indicate state — position matters",
      ],
    },
    docs: {
      description: {
        component:
          "A binary control that allows users to switch between two mutually exclusive states, providing immediate visual feedback for on/off settings. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    checked: {
      description: "Figma `Status`: Off or On.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
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
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** An immediate on/off setting, such as an email preference. */
export const Default: Story = {};

/** Mirrors the Figma set: Status (Off · On) × State (Default · Disabled). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 justify-items-start gap-x-40 gap-y-24">
      <Toggle label="Off" />
      <Toggle label="On" defaultChecked />
      <Toggle label="Off, disabled" disabled />
      <Toggle label="On, disabled" defaultChecked disabled />
    </div>
  ),
};
