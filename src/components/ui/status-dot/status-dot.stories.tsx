import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusDot, type StatusDotProps } from "./status-dot";

type Args = {
  status: StatusDotProps["status"];
  size: StatusDotProps["size"];
};

const STATUSES = ["info", "success", "error", "warning", "neutral"] as const;
const SIZES = ["lg", "sm", "md", "xl"] as const;

const meta = {
  title: "Components/Status & Indicators/Status Dot",
  // The defaults of Figma's `Status Dot`.
  args: { status: "success", size: "sm" },
  render: (args) => <StatusDot {...args} label="In stock" />,
  parameters: {
    // The Figma properties: Status, Size.
    controls: { include: ["status", "size"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Success (green) for positive states — in stock, online, active",
        "Use Error (red) for negative states — out of stock, offline, error",
        "Use Warning (yellow) for attention states — low stock, away, pending",
        "Use Info (blue) for informational states — new, updated",
        "Use Neutral (gray) for inactive or default states",
      ],
      dont: [
        "Don't use without contextual label for accessibility",
        "Don't use multiple Status Dots on the same element",
        "Don't rely solely on color — pair with text or icon when possible",
        "Don't use Large size for inline or compact contexts",
      ],
    },
    docs: {
      description: {
        component:
          "A minimal visual indicator used to communicate status, availability, or state through color-coded dots.",
      },
    },
  },
  argTypes: {
    status: {
      description: "Figma `Status`: semantic colour variant.",
      control: "inline-radio",
      options: STATUSES,
      table: {
        type: { summary: STATUSES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "success" },
      },
    },
    size: {
      description:
        "Figma `Size`: Small 6 · Medium 8 · Large 12 · X-Large 16. In code: `sm` | `md` | `lg` | `xl`.",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: SIZES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "sm" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A state such as in stock, online or active, shown by colour. */
export const Default: Story = {};

/** Every Status at every Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-5 items-center justify-items-center gap-16">
      {SIZES.flatMap((size) =>
        STATUSES.map((status) => (
          <StatusDot key={`${size}-${status}`} status={status} size={size} label={status} />
        )),
      )}
    </div>
  ),
};

/** With visible text the dot is decorative. */
export const WithText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <span className="inline-flex items-center gap-8 text-label-lg text-text-primary">
      <StatusDot status="warning" size="md" label={null} />
      Only 2 left
    </span>
  ),
};
