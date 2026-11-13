import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "../icon/icon";
import { Badge, type BadgeProps } from "./badge";

type Args = {
  size: BadgeProps["size"];
  color: BadgeProps["color"];
  label: string;
};

const COLORS = ["dark", "light", "red", "green", "yellow"] as const;
const SIZES = ["small", "mid"] as const;

const meta = {
  title: "Components/Status & Indicators/Badge",
  // The defaults of Figma's `Badge`.
  args: { size: "mid", color: "light", label: "2" },
  // A numeric label is a count (capped at "99+"); any other text is shown as it is.
  render: ({ label, ...args }) =>
    label.trim() !== "" && Number.isFinite(Number(label)) ? (
      <Badge {...args} count={Number(label)} />
    ) : (
      <Badge {...args}>{label}</Badge>
    ),
  parameters: {
    // The Figma properties: Usage, Color, Label.
    controls: { include: ["size", "color", "label"] },
    figma: {
      do: [
        "Use Red for notifications, errors, or urgent counts",
        "Use Green for success states or online indicators",
        "Use Yellow for warnings or pending states",
        "Use Dark/Light for neutral counts or labels",
        "Use Small for icon overlays, Mid for standalone badges",
      ],
      dont: [
        'Don\'t display large numbers — use "99+" for counts over 99',
        "Don't use multiple colors on the same element",
        "Don't overuse badges — they lose impact when everywhere",
        "Don't use for interactive elements — badges are informational only",
      ],
    },
    docs: {
      description: {
        component:
          "A small visual indicator used to display counts, statuses, or labels, typically overlaid on icons or attached to elements.",
      },
    },
  },
  argTypes: {
    size: {
      description:
        "Figma `Usage`: Small for icon overlays, Mid for standalone badges. In code: `size`.",
      control: "inline-radio",
      options: SIZES,
      table: { type: { summary: '"small" | "mid"' }, defaultValue: { summary: "mid" } },
    },
    color: {
      description: "Figma `Color`: semantic colour variant.",
      control: "inline-radio",
      options: COLORS,
      table: {
        type: { summary: COLORS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "light" },
      },
    },
    label: {
      description:
        'Figma `Label`. In code: `count` for a number (over 99 shows as "99+"), `children` for other text.',
      control: "text",
      table: { type: { summary: "number | ReactNode" }, defaultValue: { summary: "2" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A count or short label, standalone. */
export const Default: Story = {};

/** Every Usage (Mid · Small) in every Color. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-5 justify-items-start gap-16">
      {SIZES.flatMap((size) =>
        COLORS.map((color) => (
          <Badge key={`${size}-${color}`} color={color} size={size} count={2} />
        )),
      )}
    </div>
  ),
};

/** Counts over 99 are capped at "99+". */
export const Counts: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-16">
      <Badge count={7} />
      <Badge count={42} color="dark" />
      <Badge count={120} color="red" />
    </div>
  ),
};

/** Small over an icon: the count is described for screen readers. */
export const OnIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <span className="relative inline-flex">
      <Icon name="shopping_basket" size="lg" tone="primary" />
      <Badge
        count={3}
        size="small"
        color="dark"
        aria-label="3 items in basket"
        className="absolute -top-8 -right-8"
      />
    </span>
  ),
};
