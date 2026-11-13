import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ToolbarSidePanelTitle } from "./toolbar-sidepanel-title";

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showPageTitles: boolean;
  showMainTitle: boolean;
  mainTitleText: string;
  showSubtitle: boolean;
  subtitleText: string;
  showLeftButton: boolean;
  leftIcon: IconName;
  showRightButton: boolean;
};

const noop = () => undefined;

const meta = {
  title: "Components/Navigation/Toolbar (Top)/Toolbar SidePanel Title",
  args: {
    showPageTitles: true,
    showMainTitle: true,
    mainTitleText: "Main Title",
    showSubtitle: true,
    subtitleText: "Sub Title",
    showLeftButton: true,
    leftIcon: "close_small",
    showRightButton: false,
  },
  render: (args) => (
    <div className="max-w-405 bg-surface-secondary">
      <ToolbarSidePanelTitle
        title={args.showPageTitles && args.showMainTitle ? args.mainTitleText : undefined}
        subtitle={args.showPageTitles && args.showSubtitle ? args.subtitleText : undefined}
        leftAction={
          args.showLeftButton ? { icon: args.leftIcon, label: "Close", onClick: noop } : undefined
        }
        rightAction={args.showRightButton ? { label: "Close panel", onClick: noop } : undefined}
      />
    </div>
  ),
  parameters: {
    controls: {
      include: [
        "showPageTitles",
        "showMainTitle",
        "mainTitleText",
        "showSubtitle",
        "subtitleText",
        "showLeftButton",
        "leftIcon",
        "showRightButton",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use exclusively within sidebar/drawer components — not for sheets or popups",
        "Use close_small as the default dismiss icon for side panels",
        "Use Subtitle for contextual info like filter counts, active selections, or panel descriptions",
        'Keep Main Title descriptive of the panel\'s purpose (e.g., "Filters", "Shopping Cart", "Menu")',
      ],
      dont: [
        "Don't use for bottom sheets — use Toolbar.Sheet.Title instead",
        "Don't use for popups/modals — use Toolbar.PopUp.Title instead",
        "Don't hide the Left Button — users always need a way to close the panel",
        "Don't confuse the larger title size with a page header — this is a panel-level toolbar",
      ],
    },
    docs: {
      description: {
        component:
          "A top toolbar for sidebar and drawer surfaces, providing a close action, title with optional subtitle — designed with a larger title size suited to the wider panel context, distinguishing it from sheet and popup toolbar variants.",
      },
    },
  },
  argTypes: {
    showPageTitles: {
      description: "Figma `Show Page Titles`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showMainTitle: {
      description: "Figma `Show Main Title`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    mainTitleText: {
      description: "Figma `Main Title Text`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Main Title" } },
    },
    showSubtitle: {
      description: "Figma `Show Subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    subtitleText: {
      description: "Figma `Subtitle Text`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Sub Title" } },
    },
    showLeftButton: {
      description: "Figma `Show Left Button`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftButton" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "close_small" } },
    },
    showRightButton: {
      description: "Figma `Show Right Button`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};
