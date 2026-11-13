import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { OrderTimeline, type OrderTimelineItem } from "./order-timeline";

/**
 * Figma's properties of one `Order Timeline` node; the controls drive the first node. `Status`
 * (First · Mid · Last) is not a control: in code it comes from the node's position.
 */
type Args = {
  leftIcon: IconName;
  showBadge: boolean;
  titleText: string;
  showLabel: boolean;
  showSubtitle: boolean;
  subtitleText: string;
};

const REST: OrderTimelineItem[] = [
  { id: "t2", title: "Payment received", date: "2026-10-27T09:15:00Z" },
  { id: "t3", title: "Packed", date: "2026-10-28T13:02:00Z" },
  { id: "t4", title: "Delivered", status: "upcoming" },
];

const meta = {
  title: "Patterns/Order Management/Order Tracking/Order Timeline",
  // The defaults of Figma's `Order Timeline` (Status=First).
  args: {
    leftIcon: "check_circle",
    showBadge: false,
    titleText: "1st Node",
    showLabel: true,
    showSubtitle: true,
    subtitleText: "2025-10-10T10:24:00Z",
  },
  render: (a) => (
    <div className="max-w-334">
      <OrderTimeline
        timeZone="UTC"
        items={[
          {
            id: "t1",
            title: a.titleText,
            icon: a.leftIcon,
            badge: a.showBadge ? 1 : undefined,
            label: a.showLabel ? "Label" : undefined,
            date: a.showSubtitle ? a.subtitleText : undefined,
          },
          ...REST,
        ]}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of a node: Left Icon, Show Badge, Title Text, Show Label, Show Subtitle,
    // Subtitle Text (the More slot is `details`).
    controls: {
      include: ["leftIcon", "showBadge", "titleText", "showLabel", "showSubtitle", "subtitleText"],
    },
    figma: {
      architecture: "Single-Layer Architecture",
      do: [
        "Use First for the top node, Mid for intermediate steps, and Last for the final node — this controls the vertical connector lines correctly",
        "Use check_circle for completed steps and a different icon (e.g., radio_button_unchecked, pending) for upcoming steps",
        "Always show Subtitle with a timestamp to provide chronological context",
        "Stack multiple List.OrderTimeline instances vertically to build the full timeline",
      ],
      dont: [
        "Don't use Mid for the first or last node — the connector lines will render incorrectly",
        "Don't omit timestamps on completed steps — users need to know when each event occurred",
        "Don't use this as a standalone component — it's designed to work as part of a stacked sequence",
        "Don't confuse with OrderTracking — this is a detailed chronological log, not a progress bar",
      ],
    },
    docs: {
      description: {
        component:
          "A vertical timeline node displaying a single step in the order lifecycle with a status icon, step label, optional badge, and timestamp, stacked sequentially to form a complete order timeline.",
      },
    },
  },
  argTypes: {
    leftIcon: {
      description: "Figma `Left Icon`. In code: `icon` on the item (default from its status).",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "check_circle" } },
    },
    showBadge: {
      description: "Figma `Show Badge`: a Light Badge in place of the icon. In code: `badge`.",
      control: "boolean",
    },
    titleText: { description: "Figma `Title Text`. In code: `title`.", control: "text" },
    showLabel: { description: "Figma `Show Label`. In code: `label`.", control: "boolean" },
    showSubtitle: {
      description: "Figma `Show Subtitle`. In code: pass `date`.",
      control: "boolean",
    },
    subtitleText: {
      description: "Figma `Subtitle Text` (10.10.2025 10:24). In code: `date`, ISO 8601.",
      control: "text",
      if: { arg: "showSubtitle" },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Order Timeline`: First, Mid and Last nodes stacked; the last step still upcoming. */
export const Default: Story = {};
