import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Progress, type ProgressProps } from "./progress";

type Args = {
  size: ProgressProps["size"];
  /** Not Figma properties: the value and tone are fixed per story. */
  value: number;
  tone: ProgressProps["tone"];
};

const SIZES = ["8x", "2x", "4x"] as const;

const meta = {
  title: "Components/Feedback/Progress Bar/Progress",
  // The default of Figma's `Progress`.
  args: { size: "2x", value: 29, tone: "accent" },
  render: (args) => <Progress {...args} label="Upload" />,
  parameters: {
    // The Figma property of Progress: Size. Progress with Steps is a separate Figma component.
    controls: { include: ["size"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for determinate progress (file uploads, form completion, checkout steps)",
        "Use thinner variants (2x) for subtle inline indicators",
        "Use thicker variants (8x) for prominent progress displays",
        "Update progress value smoothly, not in large jumps",
      ],
      dont: [
        "Don't use for indeterminate loading — use Spinner instead",
        "Don't let progress go backwards unless explicitly undoing",
        "Don't use without indicating what the progress represents",
        "Don't use 0% or 100% for extended periods",
      ],
    },
    docs: {
      description: {
        component:
          "A visual indicator that displays the completion status of a task or process as a horizontal bar.",
      },
    },
  },
  argTypes: {
    size: {
      description: "Figma `Size`: bar thickness scale.",
      control: "inline-radio",
      options: SIZES,
      table: { type: { summary: '"8x" | "2x" | "4x"' }, defaultValue: { summary: "2x" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-334">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Determinate progress: a file upload, form completion. */
export const Default: Story = {};

/** Mirrors the Figma set: Size 2x · 4x · 8x. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-24">
      <Progress label="Upload" value={29} size="2x" />
      <Progress label="Upload" value={29} size="4x" />
      <Progress label="Upload" value={29} size="8x" />
    </div>
  ),
};

/** `tone="success"`: a reached goal (free shipping unlocked in the Mini Cart and the cart). */
export const Success: Story = { args: { value: 100, size: "8x", tone: "success" } };
