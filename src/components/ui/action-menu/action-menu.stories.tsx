import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActionMenu } from "./action-menu";

const noop = () => undefined;

const meta = {
  title: "Components/Actions/Action Menu",
  component: ActionMenu,
  args: {
    label: "More actions for Home",
    items: [
      { label: "Edit", icon: "edit_square", onSelect: noop },
      { label: "Set as default shipping", icon: "delivery_truck_speed", onSelect: noop },
      { label: "Set as default billing", icon: "receipt_long", onSelect: noop },
      { label: "Delete", icon: "delete", onSelect: noop },
    ],
  },
  parameters: {
    // No Figma page and no Figma properties: a contextual menu of Card.Address (03.02 P0O2).
    controls: { include: [] },
    // The menu opens in a portal: keep each example in its own frame on the docs page.
    docs: { story: { inline: false, iframeHeight: 560 } },
  },
  decorators: [
    (Story) => (
      <div className="flex h-240 justify-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActionMenu>;

export default meta;

/** The contextual menu of a card: edit, set as default, delete. */
export const Default: StoryObj<typeof meta> = {};

/** A choice shown but not available: Set as default on an expired card. */
export const WithDisabledItem: StoryObj<typeof meta> = {
  args: {
    label: "More actions for Amex",
    items: [
      { label: "Replace card", icon: "edit_square", onSelect: noop },
      { label: "Set as default", icon: "check_circle", disabled: true, onSelect: noop },
      { label: "Delete", icon: "delete", onSelect: noop },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "More actions for Amex" }));
  },
};
