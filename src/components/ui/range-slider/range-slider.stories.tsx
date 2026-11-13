import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RangeSlider, type RangeSliderProps, type RangeValue } from "./range-slider";

const euro = (n: number) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const meta = {
  title: "Components/Inputs/Sliders/Range Slider",
  component: RangeSlider,
  args: {
    min: 0,
    max: 200,
    step: 5,
    value: [25, 120],
    formatValue: euro,
    "aria-label": "Price",
    labels: { min: "Minimum price", max: "Maximum price" },
  },
  parameters: {
    // The Figma property: State Disabled. Value, bounds and step are not Figma properties.
    controls: { include: ["disabled"] },
    figma: {
      architecture:
        "This is a Single-Layer component: no base layer, properties are on the component itself.",
      do: [
        "Use for filtering by a range (e.g., price range, date range, size range)",
        "Ensure minimum and maximum knobs cannot cross each other",
        "Display current min/max values clearly",
        "Use in e-commerce for price filtering",
      ],
      dont: [
        "Don't use for single value selection — use Standard Slider instead",
        "Don't allow the range to become zero (knobs overlapping)",
        "Don't make the track too short for precise selection",
        "Don't use without showing the selected range values",
      ],
    },
    docs: {
      description: {
        component:
          "A dual-handle slider control that allows users to select a value range by defining minimum and maximum boundaries. Hover and Active are CSS states: use the pointer on the example to see them.",
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
  },
  decorators: [
    (Story) => (
      <div className="max-w-320">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: RangeSliderProps) {
  const [value, setValue] = useState<RangeValue>(props.value ?? [props.min, props.max]);
  return (
    <div className="flex flex-col gap-8">
      <RangeSlider {...props} value={value} onChange={setValue} />
      <p className="text-body-sm text-text-secondary" aria-live="polite">
        {euro(value[0])} – {euro(value[1])}
      </p>
    </div>
  );
}

/** A price filter: arrow keys ±5, Page Up / Down ±50, Home / End; press or drag on the track. */
export const Default: Story = {};

/** The whole range selected. */
export const FullRange: Story = { args: { value: [0, 200] } };

/** Both thumbs on one value: they never cross. */
export const SameValue: Story = { args: { value: [100, 100] } };

/** Figma State=Disabled. */
export const Disabled: Story = { args: { disabled: true } };

/** Figma component only: no bounds under the track. */
export const WithoutBounds: Story = { args: { showBounds: false } };
