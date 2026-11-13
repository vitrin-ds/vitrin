import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ShipmentTracking, type ShipmentTrackingItem } from "./shipment-tracking";

/** Figma's properties of one `.Asset Shipment Tracking` node; the controls drive the first node. */
type Args = {
  showTimeStamp: boolean;
  timeText: string;
  icon: IconName;
  titleText: string;
  showDetails: boolean;
  detailsText: string;
};

const REST: ShipmentTrackingItem[] = [
  {
    id: "s2",
    title: "Arrived at depot",
    occurredAt: "2026-10-29T05:12:00Z",
    location: "Kreuzberg depot · Berlin",
  },
  {
    id: "s3",
    title: "Out for delivery",
    occurredAt: "2026-10-29T07:47:00Z",
    location: "Camden Town Delivery Office · London",
    icon: "delivery_truck_speed",
  },
];

const meta = {
  title: "Patterns/Order Management/Order Tracking/Shipment Tracking",
  // The defaults of Figma's `.Asset Shipment Tracking`.
  args: {
    showTimeStamp: true,
    timeText: "2026-10-28T19:47:00Z",
    icon: "check_circle",
    titleText: "1st Node",
    showDetails: true,
    detailsText: "Camden Town Delivery Office · London",
  },
  render: (a) => (
    <div className="max-w-334">
      <ShipmentTracking
        timeZone="UTC"
        showTimeStamp={a.showTimeStamp}
        events={[
          {
            id: "s1",
            title: a.titleText,
            occurredAt: a.timeText,
            icon: a.icon,
            location: a.showDetails ? a.detailsText : undefined,
          },
          ...REST,
        ]}
      />
    </div>
  ),
  parameters: {
    // The Figma properties: Show Time Stamp, Time Text, Icon, Title Text, Show Details, Details Text.
    controls: {
      include: ["showTimeStamp", "timeText", "icon", "titleText", "showDetails", "detailsText"],
    },
    figma: {
      architecture: "Single-Layer Architecture",
      do: [
        "Stack multiple instances vertically to build the full shipment tracking timeline",
        "Use different icons to indicate step status (e.g., check_circle for completed, pending for in progress)",
        "Show Details to provide location context for logistics events",
        "Show Time Stamp to give users precise chronological tracking",
      ],
      dont: [
        "Don't use as a standalone component — it's designed as a repeating node within a timeline",
        "Don't hide both Time Stamp and Details — at least one contextual element should accompany the step title",
        "Don't confuse with List.OrderTimeline — this asset focuses on shipment logistics, not order lifecycle stages",
        'Don\'t use vague Title Text — be specific about what happened at each step (e.g., "Out for Delivery" not "Step 4")',
      ],
    },
    docs: {
      description: {
        component:
          "A single timeline node for shipment tracking, displaying a timestamp, status icon, step label, and optional location details, stacked vertically to form a complete shipment journey log.",
      },
    },
  },
  argTypes: {
    showTimeStamp: {
      description: "Figma `Show Time Stamp`. In code: `showTimeStamp` (the whole list).",
      control: "boolean",
    },
    timeText: {
      description: "Figma `Time Text` (19:47). In code: `occurredAt`, ISO 8601.",
      control: "text",
      if: { arg: "showTimeStamp" },
    },
    icon: {
      description: "Figma `Icon`. In code: `icon` on the event.",
      control: "select",
      options: ICON_NAMES,
    },
    titleText: { description: "Figma `Title Text`. In code: `title`.", control: "text" },
    showDetails: {
      description: "Figma `Show Details`. In code: pass `location`.",
      control: "boolean",
    },
    detailsText: {
      description: "Figma `Details Text`. In code: `location`.",
      control: "text",
      if: { arg: "showDetails" },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults, stacked with two more scans. */
export const Default: Story = {};
