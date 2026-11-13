import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import { CardFeatureStore, type CardFeatureStoreProps } from "./card-feature-store";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "selected";
  status: CardFeatureStoreProps["status"];
  showNumber: boolean;
  numberText: number;
  nameText: string;
  showDistance: boolean;
  distanceText: number;
  addressText: string;
  nextChange?: Date | number;
  showServices: boolean;
  showActions: boolean;
};

const STATES = ["default", "selected"] as const;
const STATUSES = ["open", "closing-soon", "closed"] as const;

// Fixed clock so the status text ("tomorrow") is stable in snapshots.
const NOW = new Date(2026, 2, 12, 17, 45);
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes);

const toCard = ({
  status,
  showNumber,
  numberText,
  nameText,
  showDistance,
  distanceText,
  addressText,
  nextChange,
  showServices,
  showActions,
  value,
}: Args & { value?: string }) => (
  <CardFeatureStore
    value={value}
    number={showNumber ? numberText : undefined}
    name={nameText}
    distance={showDistance ? distanceText : undefined}
    address={addressText}
    status={status}
    nextChange={nextChange === undefined ? undefined : new Date(nextChange)}
    now={NOW}
    services={showServices ? ["Click & Collect", "Consultations", "Returns"] : []}
    detailsHref={showActions ? "/stores/northgate-camden" : undefined}
    directionsHref={showActions ? "https://maps.example.com/?q=Things+Camden" : undefined}
  />
);

const meta = {
  title: "Patterns/Discovery/Tactical Feature Cards/Feature Card Store",
  // The defaults of Figma's `.Base.Card.Store`.
  args: {
    state: "default",
    status: "open",
    showNumber: true,
    numberText: 1,
    nameText: "Things Camden",
    showDistance: true,
    distanceText: 0.4,
    addressText: "42 Camden High Street, London NW1 0LT",
    nextChange: at(12, 20),
    showServices: true,
    showActions: true,
  },
  render: (args) =>
    args.state === "selected" ? (
      // Selected is the RadioCardGroup's value; room for the corner badge outside the card.
      <RadioCardGroup
        label="Stores near you"
        value="store"
        onValueChange={() => undefined}
        className="p-8"
      >
        {toCard({ ...args, value: "store" })}
      </RadioCardGroup>
    ) : (
      toCard(args)
    ),
  parameters: {
    // The Figma properties: State (Selected is the RadioCardGroup selection), Status, Show Number, Number Text, Name Text, Show Distance,
    // Distance Text, Address Text, Status Text (the code writes it from status + nextChange),
    // Show Services, Show Actions.
    controls: {
      include: [
        "state",
        "status",
        "showNumber",
        "numberText",
        "nameText",
        "showDistance",
        "distanceText",
        "addressText",
        "nextChange",
        "showServices",
        "showActions",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Keep the number badge in sync with the map pin label",
        "Order results by distance and show the distance",
        "Always pair the status colour with text (open until / opens at)",
        "Use Selected for exactly one card — the one whose pin is active",
      ],
      dont: [
        "Don't show more than three service chips",
        "Don't rely on colour alone to communicate the opening status",
        "Don't hide the address — it is the key decision information",
        "Don't use Card.Store for products or categories",
      ],
    },
    docs: {
      description: {
        component:
          "A store list item with number badge (matches the map pin), name, distance, address, opening status, services and actions — designed for Store Finder results, map side panels and nearby-store rails.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Selected marks the card whose map pin is active. In code: the card's `value` is the RadioCardGroup's value.",
      control: "inline-radio",
      options: STATES,
      table: { type: { summary: '"default" | "selected"' }, defaultValue: { summary: "default" } },
    },
    status: {
      description:
        "Figma `Status`. In code: `status`. Figma spells the values Open, Closing soon, Closed.",
      control: "inline-radio",
      options: STATUSES,
      table: {
        type: { summary: '"open" | "closing-soon" | "closed"' },
        defaultValue: { summary: "open" },
      },
    },
    showNumber: {
      description: "Figma `Show Number`. In code: pass `number`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    numberText: {
      description: "Figma `Number Text`. In code: `number`.",
      control: "number",
      if: { arg: "showNumber" },
      table: { type: { summary: "number" }, defaultValue: { summary: "1" } },
    },
    nameText: {
      description: "Figma `Name Text`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Things Camden" } },
    },
    showDistance: {
      description: "Figma `Show Distance`. In code: pass `distance`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    distanceText: {
      description: "Figma `Distance Text`. In code: `distance`.",
      control: "number",
      if: { arg: "showDistance" },
      table: { type: { summary: "number" }, defaultValue: { summary: "0.4" } },
    },
    addressText: {
      description: "Figma `Address Text`. In code: `address`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "42 Camden High Street, London NW1 0LT" },
      },
    },
    nextChange: {
      description:
        'Figma `Status Text`. In code: `nextChange`; the status text ("Open · until 20:00") is written from it and `status`.',
      control: "date",
      table: { type: { summary: "Date" }, defaultValue: { summary: "12 Mar 2026, 20:00" } },
    },
    showServices: {
      description: "Figma `Show Services`. In code: pass `services` (at most three chips).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `detailsHref` and `directionsHref`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A Store Finder result with all slots, open. */
export const Default: Story = {};

/** Open, Closing soon and Closed, each written as text, not colour alone. */
export const Statuses: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-16">
      {toCard({ ...args, status: "open" })}
      {toCard({ ...args, status: "closing-soon", nextChange: at(12, 18, 30) })}
      {toCard({ ...args, status: "closed", nextChange: at(13, 10) })}
    </div>
  ),
};

/** Optional slots left out: no number, distance, services or actions; status without a time. */
export const Minimal: Story = {
  args: {
    showNumber: false,
    showDistance: false,
    showServices: false,
    showActions: false,
    nextChange: undefined,
  },
};

/** Status pending (`status` left out): a skeleton holds the row until the page knows "now". */
export const PendingStatus: Story = {
  args: { status: undefined, nextChange: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/Open|Closed/)).toBeNull();
    await expect(canvas.getByRole("heading", { name: "Things Camden" })).toBeVisible();
  },
};

function StoreSelection() {
  const [value, setValue] = useState<string | undefined>("camden");
  return (
    <RadioCardGroup
      label="Stores near you"
      value={value}
      onValueChange={setValue}
      className="flex flex-col gap-16"
    >
      <CardFeatureStore
        value="camden"
        number={1}
        name="Things Camden"
        distance={0.4}
        address="42 Camden High Street, London NW1 0LT"
        status="open"
        nextChange={at(12, 20)}
        now={NOW}
        services={["Click & Collect", "Returns"]}
        detailsHref="/stores/northgate-camden"
        directionsHref="https://maps.example.com/?q=Things+Camden"
      />
      <CardFeatureStore
        value="islington"
        number={2}
        name="Northgate Islington"
        distance={1.8}
        address="7 Upper Street, London N1 0PH"
        status="closing-soon"
        nextChange={at(12, 18, 30)}
        now={NOW}
        services={["Consultations"]}
        detailsHref="/stores/northgate-islington"
        directionsHref="https://maps.example.com/?q=Northgate+Islington"
      />
      <CardFeatureStore
        value="soho"
        number={3}
        name="Northgate Soho"
        distance={2.6}
        address="18 Carnaby Street, London W1F 9PB"
        status="closed"
        nextChange={at(13, 10)}
        now={NOW}
        detailsHref="/stores/northgate-soho"
        directionsHref="https://maps.example.com/?q=Northgate+Soho"
      />
    </RadioCardGroup>
  );
}

/** Figma `State=Selected`: the card whose map pin is active, as a radio group. */
export const Selection: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    // Room for the corner badge, which sits outside the card.
    <div className="p-8">
      <StoreSelection />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const camden = canvas.getByRole("radio", { name: "Things Camden" });
    await expect(camden).toHaveAttribute("aria-checked", "true");
    camden.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Northgate Islington" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.keyboard("{ArrowUp}");
  },
};
