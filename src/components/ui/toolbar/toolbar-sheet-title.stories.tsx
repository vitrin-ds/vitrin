import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ToolbarSheetTitle } from "./toolbar-sheet-title";

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
  rightIcon: IconName;
};

const noop = () => undefined;

const meta = {
  title: "Components/Navigation/Toolbar (Top)/Toolbar Sheet Title",
  args: {
    showPageTitles: true,
    showMainTitle: true,
    mainTitleText: "Main Title",
    showSubtitle: true,
    subtitleText: "Sub Title",
    showLeftButton: true,
    leftIcon: "arrow_back",
    showRightButton: true,
    rightIcon: "radio_button_unchecked",
  },
  render: (args) => (
    <div className="max-w-405 bg-surface-secondary">
      <ToolbarSheetTitle
        title={args.showPageTitles && args.showMainTitle ? args.mainTitleText : undefined}
        subtitle={args.showPageTitles && args.showSubtitle ? args.subtitleText : undefined}
        leftAction={
          args.showLeftButton ? { icon: args.leftIcon, label: "Back", onClick: noop } : undefined
        }
        rightAction={
          args.showRightButton
            ? { icon: args.rightIcon, label: "Action", onClick: noop }
            : undefined
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
        "showLeftButton",
        "leftIcon",
        "showRightButton",
        "rightIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use arrow_back (Left Icon) for multi-step sheet flows, close for single-step dismissal",
        "Use Subtitle to provide additional context (e.g., step count, filter summary)",
        "Use the Right Icon for contextual actions like share, edit, or filter",
        "Keep Main Title concise — sheets have limited horizontal space",
      ],
      dont: [
        "Don't hide the Left Button — users always need a way to dismiss the sheet",
        "Don't use this toolbar outside of sheet/modal contexts — use Top App Bar for full pages",
        "Don't use both back and close simultaneously — pick one based on the flow type",
        "Don't overload with long titles — truncation on mobile degrades usability",
      ],
    },
    docs: {
      description: {
        component:
          "A top toolbar for bottom sheet surfaces, providing navigation (back/close), page title with optional subtitle, and a trailing action icon — functioning as the app bar equivalent for overlay contexts.",
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
      table: { type: { summary: "IconName" }, defaultValue: { summary: "arrow_back" } },
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
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};
