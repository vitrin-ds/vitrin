import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { PaymentNetwork } from "../payment-network/payment-network";
import { List, ListItem } from "./list";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "disabled";
  type: "list-item" | "card";
  showLeftIcon: boolean;
  leftIcon: IconName;
  showMainTitle: boolean;
  titleText: string;
  showSubtitle: boolean;
  subtitleText: string;
  showCurrentSelected: boolean;
  currentSelectedText: string;
  showBadge: boolean;
  showRightIcon: boolean;
  rightIcon: IconName;
  showThumb: boolean;
  thumbHasIcon: boolean;
  thumbIcon: IconName;
};

const STATES = ["default", "disabled"] as const;
const TYPES = ["list-item", "card"] as const;

const meta = {
  title: "Components/Data Display/List",
  // The defaults of Figma's `List` (State=Default, Type=List Item) and its `.Base List`.
  args: {
    state: "default",
    type: "list-item",
    showLeftIcon: true,
    leftIcon: "radio_button_unchecked",
    showMainTitle: true,
    titleText: "We’re having trouble loading your message",
    showSubtitle: true,
    subtitleText: "We’re having trouble loading your messages.",
    showCurrentSelected: true,
    currentSelectedText: "XL",
    showBadge: true,
    showRightIcon: true,
    rightIcon: "keyboard_arrow_right",
    showThumb: false,
    thumbHasIcon: true,
    thumbIcon: "credit_card",
  },
  parameters: {
    // The Figma properties: State (Disabled; Hover & Tap and Focus are CSS states), Type, then
    // `.Base List`.
    controls: {
      include: [
        "state",
        "type",
        "showLeftIcon",
        "leftIcon",
        "showMainTitle",
        "titleText",
        "showSubtitle",
        "subtitleText",
        "showCurrentSelected",
        "currentSelectedText",
        "showBadge",
        "showRightIcon",
        "rightIcon",
        "showThumb",
        "thumbHasIcon",
        "thumbIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use the Card type for visually separated, scannable groups (e.g., settings, filters)",
        "Use Right Icon as a navigation affordance to indicate drill-down",
        'Use Current Selected to show the active value without requiring a tap (e.g., "XL", "English")',
        "Keep Title Text concise — use Subtitle for additional context",
      ],
      dont: [
        "Don't show Badge and Current Selected simultaneously unless they convey different information",
        "Don't use the Card type inside already-contained surfaces like modals or bottom sheets",
        "Don't hide Right Icon on navigable items — users need the affordance",
        "Don't overload with long subtitle text — truncate or move detail to a sub-page",
      ],
    },
    docs: {
      description: {
        component:
          "A flexible list item used for navigable menus, selection options, and content rows — available as a standard list item or a card variant.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default or Disabled. Hover & Tap and Focus are CSS states. In code: `disabled`.",
      control: "inline-radio",
      options: STATES,
      table: { type: { summary: '"default" | "disabled"' }, defaultValue: { summary: "default" } },
    },
    type: {
      description: "Figma `Type`: List Item has bottom borders, Card a border all round.",
      control: "inline-radio",
      options: TYPES,
      table: {
        type: { summary: '"list-item" | "card"' },
        defaultValue: { summary: "list-item" },
      },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
    showMainTitle: {
      description: "Figma `Show Main Title`. In code: pass `title`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`: the primary text. In code: `title`.",
      control: "text",
      if: { arg: "showMainTitle" },
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "We’re having trouble loading your message" },
      },
    },
    showSubtitle: {
      description: "Figma `Show Subtitle`. In code: pass `subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    subtitleText: {
      description: "Figma `Subtitle Text`: secondary descriptive text. In code: `subtitle`.",
      control: "text",
      if: { arg: "showSubtitle" },
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "We’re having trouble loading your messages." },
      },
    },
    showCurrentSelected: {
      description: "Figma `Show Current Selected`. In code: pass `currentSelected`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    currentSelectedText: {
      description:
        "Figma `Current Selected Text`: the active value, e.g. a size or option. In code: `currentSelected`.",
      control: "text",
      if: { arg: "showCurrentSelected" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "XL" } },
    },
    showBadge: {
      description: "Figma `Show Badge`. In code: pass `badge` (a count; the sample uses 2).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: pass `rightIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_right" } },
    },
    showThumb: {
      description: "Figma `Show Thumb`. In code: pass `thumbIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    thumbHasIcon: {
      description: "Figma `Thumb has Icon?`. Off: the thumb without an icon (`thumb`).",
      control: "boolean",
      if: { arg: "showThumb" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    thumbIcon: {
      description: "Figma `Thumb Icon`: a Material Symbols name in the thumbnail.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showThumb" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "credit_card" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-560">
        <Story />
      </div>
    ),
  ],
  render: ({
    state,
    type,
    showLeftIcon,
    leftIcon,
    showMainTitle,
    titleText,
    showSubtitle,
    subtitleText,
    showCurrentSelected,
    currentSelectedText,
    showBadge,
    showRightIcon,
    rightIcon,
    showThumb,
    thumbHasIcon,
    thumbIcon,
  }) => (
    <List type={type} aria-label="Example list">
      <ListItem
        disabled={state === "disabled"}
        leftIcon={showLeftIcon ? leftIcon : undefined}
        title={showMainTitle ? titleText : undefined}
        subtitle={showSubtitle ? subtitleText : undefined}
        currentSelected={showCurrentSelected ? currentSelectedText : undefined}
        badge={showBadge ? 2 : undefined}
        rightIcon={showRightIcon ? rightIcon : undefined}
        thumbIcon={showThumb && thumbHasIcon ? thumbIcon : undefined}
        thumb={
          showThumb && !thumbHasIcon ? (
            <span className="size-36 shrink-0 rounded-4 bg-surface-neutral inset-ring inset-ring-border-neutral" />
          ) : undefined
        }
        onClick={() => undefined}
      />
      <ListItem
        thumbIcon="credit_card"
        title="Payment methods"
        subtitle="Visa ending 6411"
        rightIcon="keyboard_arrow_right"
        href="#payment"
      />
      <ListItem
        title="Gift wrap"
        subtitle="Not available for this order"
        disabled
        onClick={() => undefined}
      />
    </List>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma Type=List Item: bottom borders. Rows are buttons or links; the last is disabled. */
export const ListItemType: Story = {};

/** Figma Type=Card: border all round, radius 8, 8px apart. */
export const Card: Story = { args: { type: "card" } };

function Selectable({ type }: { type: "list-item" | "card" }) {
  const [current, setCurrent] = useState("standard");
  const options = [
    { value: "standard", title: "Standard", subtitle: "3–5 working days" },
    { value: "express", title: "Express", subtitle: "Next working day" },
  ];
  return (
    <List type={type} aria-label="Delivery">
      {options.map((option) => (
        <ListItem
          key={option.value}
          title={option.title}
          subtitle={option.subtitle}
          selected={current === option.value}
          onClick={() => setCurrent(option.value)}
        />
      ))}
    </List>
  );
}

/** Selected List Item: interactive-subtle-active fill and aria-current. */
export const Selected: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Selectable type="list-item" />,
};

/** Selected Card: 2px border-accent, no fill (a row gets a fill, a card a border). */
export const SelectedCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Selectable type="card" />,
};

/** Account navigation: link rows, the current page marked. */
export const Navigation: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <List aria-label="My account">
      <ListItem
        leftIcon="orders"
        title="Orders"
        href="#orders"
        selected
        rightIcon="keyboard_arrow_right"
      />
      <ListItem
        leftIcon="location_on"
        title="Addresses"
        href="#addresses"
        rightIcon="keyboard_arrow_right"
      />
      <ListItem
        leftIcon="credit_card"
        title="Payment methods"
        href="#payment"
        rightIcon="keyboard_arrow_right"
      />
    </List>
  ),
};

/** Figma `Thumb`: a thin icon, or any element such as a network's logo (03.03, 03.05). */
export const Thumbs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <List type="card" className="max-w-676">
      <ListItem
        href="#security"
        thumbIcon="lock"
        title="Password & Security"
        subtitle="Change password, manage sessions"
        rightIcon="keyboard_arrow_right"
      />
      <ListItem
        onClick={() => undefined}
        thumb={<PaymentNetwork network="paypal" />}
        title="PayPal"
        subtitle="Pay with your PayPal account"
        rightIcon="arrow_outward"
      />
    </List>
  ),
};
