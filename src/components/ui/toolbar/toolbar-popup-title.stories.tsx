import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ToolbarPopupTitle } from "./toolbar-popup-title";

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showPageTitles: boolean;
  showMainTitle: boolean;
  mainTitleText: string;
  showSubtitle: boolean;
  subtitleText: string;
  showRightButton: boolean;
  rightIcon: IconName;
};

const noop = () => undefined;

const meta = {
  title: "Components/Navigation/Toolbar (Top)/Toolbar PopUp Title",
  args: {
    showPageTitles: true,
    showMainTitle: true,
    mainTitleText: "Main Title",
    showSubtitle: true,
    subtitleText: "Sub Title",
    showRightButton: true,
    rightIcon: "close_small",
  },
  render: (args) => (
    <div className="max-w-405 bg-surface-secondary">
      <ToolbarPopupTitle
        title={args.showPageTitles && args.showMainTitle ? args.mainTitleText : undefined}
        subtitle={args.showPageTitles && args.showSubtitle ? args.subtitleText : undefined}
        rightAction={
          args.showRightButton ? { icon: args.rightIcon, label: "Close", onClick: noop } : undefined
        }
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
        "showRightButton",
        "rightIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use close as the Right Icon for dismissible popups and dialogs",
        "Use Subtitle to add context like step indicators or summary info",
        'Keep Main Title short and action-oriented (e.g., "Select Size", "Confirm Order")',
        "Use consistently across all popup/modal surfaces for a unified experience",
      ],
      dont: [
        "Don't use this toolbar for bottom sheets — use Toolbar.Sheet.Title instead",
        "Don't hide both the title and the right button — the toolbar needs at least one visible element",
        "Don't add a left button — popups typically dismiss via the right close icon, not back navigation",
        "Don't use long titles — popup widths are constrained, especially on mobile",
      ],
    },
    docs: {
      description: {
        component:
          "A top toolbar for popup and modal surfaces, providing a title with optional subtitle and a trailing action icon — functioning as the header bar for dialog and popup contexts.",
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
    showRightButton: {
      description: "Figma `Show Right Button`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightButton" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "close_small" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};
