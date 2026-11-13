import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spacer } from "./spacer";

type Args = { height: "20" | "40" | "60" | "80" };

const HEIGHTS = ["20", "40", "60", "80"] as const;

const meta = {
  title: "Components/Layout & Utility/Spacer",
  // The default of Figma's `Spacer`.
  args: { height: "20" },
  render: ({ height }) => (
    <div className="w-300">
      <p className="text-body-md text-text-primary">Section above</p>
      <Spacer height={height} />
      <p className="text-body-md text-text-primary">Section below</p>
    </div>
  ),
  parameters: {
    // The Figma property: Height.
    controls: { include: ["height"] },
    figma: { architecture: "Single-Layer Architecture" },
    docs: {
      description: {
        component:
          "A utility component that inserts vertical whitespace at predefined increments — used within auto layout frames when standard gap values don't provide the needed spacing between sections.",
      },
    },
  },
  argTypes: {
    height: {
      description:
        "Figma `Height` (code: 20 · 40 · 60 · 80): controls the vertical spacing amount.",
      control: "inline-radio",
      options: HEIGHTS,
      table: {
        type: { summary: HEIGHTS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "20" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma Height=20px. */
export const Default: Story = {};

/** Every Figma height, 20 to 80. */
export const Heights: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-300 flex-col">
      {HEIGHTS.map((height) => (
        <div key={height} className="flex flex-col">
          <p className="text-label-md text-text-secondary">{height}px</p>
          <Spacer height={height} className="bg-surface-accent-subtle" />
        </div>
      ))}
    </div>
  ),
};
