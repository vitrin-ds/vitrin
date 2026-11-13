import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CARD_ORDER_HISTORY_EMPTY_LABELS, CardOrderHistoryEmpty } from "./card-order-history-empty";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showLabel: boolean;
  labelText: string;
  showButton: boolean;
  buttonText: string;
};

const meta = {
  title: "Patterns/Order Management/Order History/Order History Empty",
  // The defaults of Figma's `Card.OrderHistory.Empty` and its Button.
  args: {
    showLabel: true,
    labelText: CARD_ORDER_HISTORY_EMPTY_LABELS.message,
    showButton: true,
    buttonText: "Shop",
  },
  render: ({ showLabel, labelText, showButton, buttonText }) => (
    <div className="max-w-600">
      <CardOrderHistoryEmpty
        message={showLabel ? labelText : ""}
        action={showButton ? { label: buttonText, href: "/" } : undefined}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.OrderHistory.Empty: Show Label, Label Text, Show Button (and the
    // nested Button's text).
    controls: { include: ["showLabel", "labelText", "showButton", "buttonText"] },
    figma: {
      architecture: "Single-Layer Architecture",
      do: [
        "Use as a direct replacement for Card.OrderHistory when the order list is empty",
        "Keep Label Text friendly and encouraging — guide the user toward their first purchase",
        'Use the Button to direct users to the shop or product discovery pages (e.g., "Start Shopping")',
        "Maintain consistent placement within the order history page layout",
      ],
      dont: [
        "Don't hide both Label and Button — the empty state needs at least one guiding element",
        "Don't use generic error language — this isn't an error, it's an opportunity to convert",
        "Don't show this card alongside populated order cards — it replaces the list entirely",
        "Don't use a vague CTA — be specific about where the button leads",
      ],
    },
    docs: {
      description: {
        component:
          "An empty state card shown when the user has no order history, providing a descriptive message and an optional call-to-action button to encourage first purchase.",
      },
    },
  },
  argTypes: {
    showLabel: {
      description: 'Figma `Show Label`. In code: pass `message` ("" hides it).',
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    labelText: {
      description: "Figma `Label Text`. In code: `message`.",
      control: "text",
      if: { arg: "showLabel" },
      table: { type: { summary: "string" } },
    },
    showButton: {
      description: "Figma `Show Button`. In code: pass `action`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    buttonText: {
      description: "The Button's `Button Text`. In code: `action.label`.",
      control: "text",
      if: { arg: "showButton" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Shop" } },
    },
  },
} satisfies Meta<Args>;

export default meta;

/** The Figma defaults. */
export const Default: StoryObj<Args> = {};
