import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Label, type LabelProps } from "./label";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: LabelProps["color"];
  showLeftIcon: boolean;
  leftIcon: IconName;
  labelText: string;
};

// Figma order of `Color`, with the icon each Color uses in the Colors story.
const COLORS = [
  ["default", "loyalty"],
  ["error", "cancel"],
  ["warning", "info"],
  ["outline", "loyalty"],
  ["accent", "loyalty"],
  ["assistive", "loyalty"],
  ["info", "info"],
  ["success", "check_circle"],
  ["neutral", "loyalty"],
] as const;

const LABEL_COLORS = COLORS.map(([color]) => color);

const meta = {
  title: "Components/Status & Indicators/Label",
  // The defaults of Figma's `Label` and `.Base Label`.
  args: { color: "default", showLeftIcon: true, leftIcon: "loyalty", labelText: "Label" },
  render: ({ showLeftIcon, leftIcon, labelText, ...args }) => (
    <Label {...args} icon={showLeftIcon ? leftIcon : undefined}>
      {labelText}
    </Label>
  ),
  parameters: {
    // The Figma properties: Color, Show Left Icon, Left Icon, Label Text.
    controls: { include: ["color", "showLeftIcon", "leftIcon", "labelText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Error (red) for critical states or issues",
        "Use Warning (yellow) for caution or pending states",
        "Use Success/Light Green for positive or completed states",
        "Use Info (blue) for neutral informational tags",
        "Use Accent (purple) for promotional or highlighted items",
        "Use Default/Assistive for neutral categorization",
      ],
      dont: [
        "Don't use too many labels on a single item",
        "Don't use labels for interactive actions — use Button or Chip",
        "Don't mix multiple semantic colors for the same meaning",
        "Don't truncate label text — keep it concise (1-2 words)",
      ],
    },
    docs: {
      description: {
        component:
          "A compact tag component used to categorize, highlight status, or add metadata to content with semantic color coding.",
      },
    },
  },
  argTypes: {
    color: {
      description: "Figma `Color`: semantic colour variant.",
      control: "select",
      options: LABEL_COLORS,
      table: {
        type: { summary: LABEL_COLORS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "default" },
      },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name. In code: `icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "loyalty" } },
    },
    labelText: {
      description: "Figma `Label Text`. In code: `children`. One or two words.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A short tag that categorises or marks the status of content. */
export const Default: Story = {};

/** Every Color with its default icon. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      {COLORS.map(([color, icon]) => (
        <Label key={color} color={color} icon={icon}>
          Label
        </Label>
      ))}
    </div>
  ),
};
