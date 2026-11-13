import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Alert, type AlertProps } from "./alert";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  width: AlertProps["width"];
  usage: AlertProps["usage"];
  leftIcon: IconName;
  showTitle: boolean;
  titleText: string;
  showDescriptionText: boolean;
  descriptionText: string;
};

const USAGES = ["negative", "positive", "notice", "informative", "neutral"] as const;
const WIDTHS = ["full", "card"] as const;

const meta = {
  title: "Components/Feedback/Alert",
  // The defaults of Figma's `Alert` and `.Base Alert` (Usage=Notice shows the `warning` glyph).
  args: {
    width: "full",
    usage: "notice",
    leftIcon: "warning",
    showTitle: true,
    titleText: "Alert Title",
    showDescriptionText: true,
    descriptionText: "Alert Body",
  },
  render: ({ leftIcon, showTitle, titleText, showDescriptionText, descriptionText, ...args }) => (
    <Alert {...args} icon={leftIcon} title={showTitle ? titleText : undefined}>
      {showDescriptionText ? descriptionText : undefined}
    </Alert>
  ),
  parameters: {
    // The Figma properties: Width, Usage, Left Icon, Show/Title Text, Show/Description Text.
    // `Show Left Icon` is not a control: the code always shows the icon.
    controls: {
      include: [
        "width",
        "usage",
        "leftIcon",
        "showTitle",
        "titleText",
        "showDescriptionText",
        "descriptionText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Informative (blue) for neutral information and tips",
        "Use Positive (green) for success confirmations",
        "Use Notice (yellow) for warnings requiring attention",
        "Use Negative (red) for errors and critical issues",
        "Keep alert messages concise and actionable",
      ],
      dont: [
        "Don't overuse alerts — reserve for important messages",
        "Don't use multiple alert types simultaneously",
        "Don't hide the icon — it reinforces the semantic meaning",
        "Don't use Full Width in card-based layouts",
      ],
    },
    docs: {
      description: {
        component:
          "A prominent message component used to communicate important information, warnings, errors, or success states to users.",
      },
    },
  },
  argTypes: {
    width: {
      description: "Figma `Width`: layout variant. Card inside cards and forms.",
      control: "inline-radio",
      options: WIDTHS,
      table: { type: { summary: '"full" | "card"' }, defaultValue: { summary: "full" } },
    },
    usage: {
      description: "Figma `Usage`: semantic colour and meaning.",
      control: "inline-radio",
      options: USAGES,
      table: {
        type: { summary: USAGES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "notice" },
      },
    },
    leftIcon: {
      description:
        "Figma `Left Icon`: a Material Symbols name. In code: `icon`, which defaults to the Usage's glyph.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "warning" } },
    },
    showTitle: {
      description: "Figma `Show Title`. In code: pass `title`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      if: { arg: "showTitle" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Alert Title" } },
    },
    showDescriptionText: {
      description: "Figma `Show Description Text`. In code: pass `children`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    descriptionText: {
      description: "Figma `Description Text`. In code: `children`.",
      control: "text",
      if: { arg: "showDescriptionText" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Alert Body" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** An important message: information, warning, error or success. */
export const Default: Story = {};

/** Every Type at both Widths. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 gap-24 desktop:grid-cols-2">
      {WIDTHS.map((width) => (
        <div key={width} className="flex flex-col gap-16">
          {USAGES.map((usage) => (
            <Alert key={usage} usage={usage} width={width} title="Alert Title">
              Alert Body
            </Alert>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Figma `Show Title` off: a short message without a heading. */
export const DescriptionOnly: Story = {
  args: {
    showTitle: false,
    usage: "informative",
    width: "card",
    leftIcon: "info",
    descriptionText: "Free returns within 30 days.",
  },
};
