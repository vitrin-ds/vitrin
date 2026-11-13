import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DatePicker } from "./date-picker";

/** Figma's properties. Storybook only: in code an action shows when its handler is given. */
type Args = {
  showYearMonth: boolean;
  showYear: boolean;
  showMonth: boolean;
  showActions: boolean;
  showLeftAction: boolean;
  leftActionText: string;
  showRightAction: boolean;
  rightActionText: string;
};

const noop = () => undefined;

const meta = {
  title: "Components/Inputs/Date Picker",
  args: {
    showYearMonth: true,
    showYear: true,
    showMonth: true,
    showActions: true,
    showLeftAction: true,
    leftActionText: "Cancel",
    showRightAction: true,
    rightActionText: "OK",
  },
  render: ({
    showYearMonth,
    showYear,
    showMonth,
    showActions,
    showLeftAction,
    leftActionText,
    showRightAction,
    rightActionText,
  }) => (
    <div className="min-h-420">
      <DatePicker
        defaultValue="2026-01-12"
        today="2026-01-12"
        showYear={showYearMonth && showYear}
        showMonth={showYearMonth && showMonth}
        onCancel={showActions && showLeftAction ? noop : undefined}
        onConfirm={showActions && showRightAction ? noop : undefined}
        labels={{ year: "Year", month: "Month", cancel: leftActionText, ok: rightActionText }}
      />
    </div>
  ),
  parameters: {
    // Figma's properties. `Day Selection State` is how each day draws: selected, CSS hover and
    // pressed, `min` / `max` / `isDateDisabled`.
    controls: {
      include: [
        "showYearMonth",
        "showYear",
        "showMonth",
        "showActions",
        "showLeftAction",
        "leftActionText",
        "showRightAction",
        "rightActionText",
      ],
    },
    figma: {
      do: [
        "Use for single date selection in forms (birthdate, appointment, delivery date)",
        "Always show the current month by default",
        "Highlight today's date for user orientation",
        "Disable dates outside valid range (e.g., past dates for future bookings)",
      ],
      dont: [
        "Don't use for date range selection — use Date Range Picker instead",
        "Don't hide month/year navigation for date-heavy workflows",
        "Don't allow selection of disabled dates",
        "Don't use without clear visual distinction between states",
      ],
    },
    docs: {
      story: { inline: false, iframeHeight: 460 },
      description: {
        component:
          "A date picker component that displays a monthly grid view for selecting single dates, with dropdown controls for month and year navigation. Uses Dropdown Item for year and month selection lists.",
      },
    },
  },
  argTypes: {
    showYearMonth: {
      description: "Figma `Show Year & Month`. Toggle header dropdowns visibility.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showYear: {
      description: "Figma `Show Year`. In code: `showYear`. Toggle year dropdown visibility.",
      control: "boolean",
      if: { arg: "showYearMonth" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showMonth: {
      description: "Figma `Show Month`. In code: `showMonth`. Toggle month dropdown visibility.",
      control: "boolean",
      if: { arg: "showYearMonth" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showActions: {
      description: "Figma `Show Actions`. Toggle footer action buttons visibility.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftAction: {
      description:
        "Figma `Show Left Action`. In code: pass `onCancel`. Toggle cancel button visibility.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftActionText: {
      description: "Figma `Left Action Text`. In code: `labels.cancel`. Cancel button label.",
      control: "text",
      if: { arg: "showLeftAction" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Cancel" } },
    },
    showRightAction: {
      description:
        "Figma `Show Right Action`. In code: pass `onConfirm`. Toggle confirm button visibility.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightActionText: {
      description: "Figma `Right Action Text`. In code: `labels.ok`. Confirm button label.",
      control: "text",
      if: { arg: "showRightAction" },
      table: { type: { summary: "string" }, defaultValue: { summary: "OK" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Days outside the valid range are disabled (Figma Do). */
export const DisabledDays: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="min-h-420">
      <DatePicker
        defaultValue="2026-01-14"
        today="2026-01-14"
        min="2026-01-12"
        onCancel={noop}
        onConfirm={noop}
      />
    </div>
  ),
};
