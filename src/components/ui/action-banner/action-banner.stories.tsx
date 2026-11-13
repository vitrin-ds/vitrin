import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../button/button";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ActionBanner, type ActionBannerProps } from "./action-banner";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  width: ActionBannerProps["width"];
  color: ActionBannerProps["color"];
  showLeftIcon: boolean;
  leftIcon: IconName;
  showTitle: boolean;
  titleText: string;
  showDescriptionText: boolean;
  descriptionText: string;
  showButtonAction: boolean;
};

const WIDTHS = ["full", "card"] as const;
const COLORS = ["neutral", "light", "accent"] as const;

const meta = {
  title: "Components/Feedback/Action Banner",
  // The defaults of Figma's `Action Banner` and `.Base Action Banner`.
  args: {
    width: "full",
    color: "accent",
    showLeftIcon: true,
    leftIcon: "info",
    showTitle: true,
    titleText: "Banner Title",
    showDescriptionText: true,
    descriptionText: "Banner Body",
    showButtonAction: true,
  },
  render: ({
    showLeftIcon,
    leftIcon,
    showTitle,
    titleText,
    showDescriptionText,
    descriptionText,
    showButtonAction,
    ...args
  }) => (
    <ActionBanner
      {...args}
      icon={showLeftIcon ? leftIcon : undefined}
      title={showTitle ? titleText : undefined}
      action={
        showButtonAction ? (
          <Button variant="outline" size="sm">
            Button
          </Button>
        ) : undefined
      }
    >
      {showDescriptionText ? descriptionText : undefined}
    </ActionBanner>
  ),
  parameters: {
    // The Figma properties: Width, Color, Show/Left Icon, Show/Title Text, Show/Description Text,
    // Show Button [Action].
    controls: {
      include: [
        "width",
        "color",
        "showLeftIcon",
        "leftIcon",
        "showTitle",
        "titleText",
        "showDescriptionText",
        "descriptionText",
        "showButtonAction",
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
          "An inline informational banner that delivers neutral announcements, contextual guidance, and actionable notifications within the page content — distinct from semantic alerts, designed for non-critical messaging with an optional call-to-action.",
      },
    },
  },
  argTypes: {
    width: {
      description: "Figma `Width`: Card inside cards, sheets and forms.",
      control: "inline-radio",
      options: WIDTHS,
      table: { type: { summary: '"full" | "card"' }, defaultValue: { summary: "full" } },
    },
    color: {
      description: "Figma `Color`.",
      control: "inline-radio",
      options: COLORS,
      table: {
        type: { summary: '"neutral" | "light" | "accent"' },
        defaultValue: { summary: "accent" },
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
      table: { type: { summary: "IconName" }, defaultValue: { summary: "info" } },
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
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Banner Title" } },
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
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Banner Body" } },
    },
    showButtonAction: {
      description: "Figma `Show Button [Action]`. In code: pass `action`, an Outline Button.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Neutral announcements and guidance inside the page content. */
export const Default: Story = {};

/** Every Width in every colour. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      {COLORS.map((color) => (
        <div key={color} className="flex flex-col gap-8">
          <ActionBanner color={color} width="full" icon="info" title="Banner Title">
            Banner Body
          </ActionBanner>
          <ActionBanner color={color} width="card" icon="info" title="Banner Title">
            Banner Body
          </ActionBanner>
        </div>
      ))}
    </div>
  ),
};

/** With the optional call-to-action button. */
export const WithAction: Story = {
  args: { width: "card", showButtonAction: true },
};

/** 03.01.07 Shipment Tracking: the latest scan and the time zone note. */
export const ShipmentTracking: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-560 flex-col gap-32">
      <ActionBanner
        color="neutral"
        width="card"
        icon="check_circle"
        iconTone="success"
        title="Delivered"
      >
        Today, 10:58 · Signed by Resident
      </ActionBanner>
      <ActionBanner color="neutral" width="card" icon="schedule" iconFill={false}>
        Times shown in your local time zone. Updates come directly from the carrier and may take a
        few minutes to appear.
      </ActionBanner>
    </div>
  ),
};
