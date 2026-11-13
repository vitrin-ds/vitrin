import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { NAVIGATION, SECONDARY_LINKS } from "./header.fixtures";
import { DrawerFooter } from "./header.story-helpers";
import { NavigationDrawer, type NavigationDrawerProps } from "./navigation-drawer";

function Demo(props: NavigationDrawerProps) {
  const [open, setOpen] = useState(props.open);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Menu
      </Button>
      <NavigationDrawer {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Navigation Drawer",
  component: NavigationDrawer,
  args: {
    open: true,
    onClose: () => undefined,
    items: NAVIGATION,
    secondaryLinks: SECONDARY_LINKS,
    footer: <DrawerFooter />,
  },
  // Figma has no property table for the drawer, so no prop maps to a Figma property.
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "The mobile menu below 1024px: the Navigation Bar items, the account and service links and a bottom row, each category opening its own level.",
      },
      story: { inline: false, iframeHeight: 560 },
    },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof NavigationDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Level 1 (Figma 30677:13451): Main Group, Secondary Group and the bottom row. */
export const Default: Story = {};

/** A category's level (Figma `Mega Menu [Links Only] / Mobile`, 30677:9956): back row, Link Groups as accordions, Menu Footer. */
export const ItemMenu: Story = { args: { initialItemId: "categories" } };
