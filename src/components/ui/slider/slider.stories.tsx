import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Slider } from "./slider";

const meta = {
  title: "Components/Inputs/Sliders/Standard Slider",
  component: Slider,
  args: { min: 0, max: 100, defaultValue: 40, "aria-label": "Volume" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-360">
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: { include: ["showKnob", "disabled"] },
    docs: {
      description: {
        component:
          "A continuous input control that allows users to select a value from a range by dragging a knob along a track.",
      },
    },
  },
  argTypes: {
    showKnob: {
      description: "Figma `Show Knob`.",
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
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Choosing one value from a range. */
export const Default: Story = {};

/** The control can't be used right now. */
export const Disabled: Story = { args: { disabled: true } };
