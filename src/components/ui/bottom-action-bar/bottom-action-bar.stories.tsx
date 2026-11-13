import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BottomActionBar } from "./bottom-action-bar";

/** Figma's `Show` booleans are Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "expanded";
  showLeft: boolean;
  showThumbnail: boolean;
  showOverline: boolean;
  overlineText: string;
  mainText: number;
  showSecondaryText: boolean;
  secondaryText: string;
  showToggleOption: boolean;
  showButtonSecondary: boolean;
  showButtonPrimary: boolean;
  showSpacer: boolean;
};

const STATES = ["default", "expanded"] as const;

const meta = {
  title: "Components/Layout & Utility/Action Bar (Bottom)",
  // The defaults of Figma's `ActionBar.Bottom` (State=Default) and `.Base.ActionBar.Bottom`.
  // Main Text is a Money: its amount in cents here.
  args: {
    state: "default",
    showLeft: true,
    showThumbnail: true,
    showOverline: true,
    overlineText: "2 items selected",
    mainText: 59700,
    showSecondaryText: true,
    secondaryText: "€ 597",
    showToggleOption: true,
    showButtonSecondary: true,
    showButtonPrimary: true,
    showSpacer: true,
  },
  render: ({
    state,
    showLeft,
    showThumbnail,
    showOverline,
    overlineText,
    mainText,
    showSecondaryText,
    secondaryText,
    showToggleOption,
    showButtonSecondary,
    showButtonPrimary,
    showSpacer,
  }) => (
    <BottomActionBar
      label="Order total"
      position="static"
      thumbnail={showLeft && showThumbnail ? <span className="size-full" /> : undefined}
      overline={showLeft && showOverline ? overlineText : undefined}
      price={showLeft ? { amount: mainText, currency: "EUR" } : undefined}
      secondaryText={showLeft && showSecondaryText ? secondaryText : undefined}
      toggle={
        showLeft && showToggleOption
          ? { expanded: state === "expanded", onToggle: () => undefined, label: "More options" }
          : undefined
      }
      secondaryAction={showButtonSecondary ? <Button variant="outline">Button</Button> : undefined}
      primaryAction={showButtonPrimary ? <Button>Button</Button> : undefined}
      spacer={showSpacer}
    />
  ),
  parameters: {
    // The Figma properties: State, then `.Base.ActionBar.Bottom`.
    controls: {
      include: [
        "state",
        "showLeft",
        "showThumbnail",
        "showOverline",
        "overlineText",
        "mainText",
        "showSecondaryText",
        "secondaryText",
        "showToggleOption",
        "showButtonSecondary",
        "showButtonPrimary",
        "showSpacer",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        'Use on product detail pages with Price + "Add to Cart" as the primary pattern',
        "Use Line 1 Text for contextual info like selection count or delivery estimate",
        "Use the Expanded state to reveal additional options (e.g., quantity selector, variant picker)",
        "Always show Spacer on devices with home indicators",
      ],
      dont: [
        "Don't show both price lines when there's no discount — hide Price Before Discount",
        "Don't use on desktop — this is a mobile-only sticky pattern",
        "Don't hide both buttons — at least one action should always be visible",
        "Don't overload with too much information — keep it scannable at a glance",
      ],
    },
    docs: {
      description: {
        component:
          "A fixed bottom bar for mobile surfaces, displaying pricing information, selection context, and primary/secondary action buttons — commonly used on product detail pages, cart summaries, and bulk selection flows.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default shows compact bar; Expanded reveals additional content. In code: `toggle.expanded`.",
      control: "inline-radio",
      options: STATES,
      table: { type: { summary: '"default" | "expanded"' }, defaultValue: { summary: "default" } },
    },
    showLeft: {
      description:
        "Figma `Show Left`: toggle left content section visibility. In code: leave out the left slots.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showThumbnail: {
      description:
        "Figma `Show Thumbnail`: toggle thumbnail visibility. In code: pass `thumbnail`.",
      control: "boolean",
      if: { arg: "showLeft" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showOverline: {
      description: "Figma `Show Overline`: toggle overline visibility. In code: pass `overline`.",
      control: "boolean",
      if: { arg: "showLeft" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    overlineText: {
      description: "Figma `Overline Text`. In code: `overline`.",
      control: "text",
      if: { arg: "showOverline" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "2 items selected" } },
    },
    mainText: {
      description:
        "Figma `Main Text`: the price. In code: `price`, a Money; here its amount in cents.",
      control: "number",
      if: { arg: "showLeft" },
      table: { type: { summary: "Money" }, defaultValue: { summary: "59700" } },
    },
    showSecondaryText: {
      description:
        "Figma `Show Secondary Text`: toggle secondary text visibility. In code: pass `secondaryText`.",
      control: "boolean",
      if: { arg: "showLeft" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    secondaryText: {
      description: "Figma `Secondary Text`. In code: `secondaryText`.",
      control: "text",
      if: { arg: "showSecondaryText" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "€ 597" } },
    },
    showToggleOption: {
      description:
        "Figma `Show Toggle Option`: toggle option control visibility. In code: pass `toggle`.",
      control: "boolean",
      if: { arg: "showLeft" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonSecondary: {
      description:
        "Figma `Show Button [Secondary]`: toggle secondary action button visibility. In code: pass `secondaryAction`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonPrimary: {
      description:
        "Figma `Show Button [Primary]`: toggle primary action button visibility. In code: pass `primaryAction`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showSpacer: {
      description:
        "Figma `Show Spacer`: 12px under the bar for home indicators. In code: `spacer`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-390">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma default (State=Default): every slot shown. */
export const Default: Story = {};

/** Figma State=Expanded: surface-secondary, the chevron points down. */
export const Expanded: Story = { args: { state: "expanded" } };

/** The toggle working: it switches between Default and Expanded. */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: function InteractiveBar() {
    const [expanded, setExpanded] = useState(false);
    return (
      <BottomActionBar
        label="Order total"
        position="static"
        overline="2 items selected"
        price={{ amount: 59700, currency: "EUR" }}
        toggle={{ expanded, onToggle: () => setExpanded((open) => !open), label: "More options" }}
        primaryAction={<Button>Checkout</Button>}
      />
    );
  },
};

/** Checkout and cart on the site: the price and one action. */
export const PriceAndAction: Story = {
  args: {
    showThumbnail: false,
    showOverline: false,
    showSecondaryText: false,
    showToggleOption: false,
    showButtonSecondary: false,
  },
};
