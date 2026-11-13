import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "@/components/ui/icon/icon-names";
import { HeaderTopBar } from "./header-top-bar";
import { HeaderTopBarItem } from "./header-top-bar-item";

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showLeft: boolean;
  showItemL1: boolean;
  showItemL2: boolean;
  showItemL3: boolean;
  showRight: boolean;
  showAnnouncementLabel: boolean;
  announcementText: string;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showLabel: boolean;
  labelText: string;
  showRightIcon: boolean;
};

const toggle = (description: string, shownWhen?: keyof Args) => ({
  description,
  control: "boolean" as const,
  ...(shownWhen ? { if: { arg: shownWhen } } : {}),
});

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Header Top Bar",
  args: {
    showLeft: true,
    showItemL1: true,
    showItemL2: true,
    showItemL3: true,
    showRight: true,
    showAnnouncementLabel: true,
    announcementText: "FREE SHIPPING ON ALL EU ORDERS €1000",
    showLeftIcon: false,
    leftIcon: "location_on",
    showLabel: true,
    labelText: "Help Centre",
    showRightIcon: false,
  },
  render: (args) => (
    <HeaderTopBar
      aria-label="Announcements"
      start={
        args.showLeft ? (
          <>
            {args.showItemL1 && (
              <HeaderTopBarItem
                href="/help"
                label={args.labelText}
                leftIcon={args.showLeftIcon ? args.leftIcon : undefined}
                hideLabel={!args.showLabel}
                chevron={args.showRightIcon}
              />
            )}
            {args.showItemL2 && <HeaderTopBarItem href="/stores" label="Find a Store" />}
            {args.showItemL3 && <HeaderTopBarItem href="/help/contact" label="Contact" />}
          </>
        ) : undefined
      }
      end={
        args.showRight ? (
          <HeaderTopBarItem
            href="/account/preferences"
            label="Europa (EURO €)"
            flag="/brand/flags/eu.svg"
            chevron
          />
        ) : undefined
      }
    >
      {args.showAnnouncementLabel ? args.announcementText : undefined}
    </HeaderTopBar>
  ),
  parameters: {
    layout: "fullscreen",
    figma: {
      do: [
        "Use for promotional messages (free shipping, discounts, announcements)",
        "Keep announcement text concise — single line preferred",
        "Use utility items for secondary actions (store locator, language, help)",
        "Ensure sufficient contrast for readability",
      ],
      dont: [
        "Don't overload with too many items — max 3-4 utility links",
        "Don't use for primary navigation — use Navigation Bar",
        "Don't hide on mobile if announcement is important",
        "Don't use multiple announcements simultaneously",
      ],
    },
    docs: {
      description: {
        component:
          "A slim header strip displaying promotional announcements and utility links, typically positioned at the top of the page.",
      },
    },
  },
  argTypes: {
    showLeft: toggle("Figma `Show Left`. In code: pass `start`. Shown from 1024px."),
    showItemL1: toggle("Figma `Show .Asset Header Top Bar Item [L1]`.", "showLeft"),
    showItemL2: toggle("Figma `Show .Asset Header Top Bar Item [L2]`.", "showLeft"),
    showItemL3: toggle("Figma `Show .Asset Header Top Bar Item [L3]`.", "showLeft"),
    showRight: toggle("Figma `Show Right`. In code: pass `end`. Shown from 1024px."),
    showAnnouncementLabel: toggle("Figma `Show Announcement Label`. In code: pass `children`."),
    announcementText: {
      description: "Figma `Announcement Text`. In code: `children`.",
      control: "text",
      if: { arg: "showAnnouncementLabel" },
    },
    showLeftIcon: toggle("Item L1, Figma `Show Left Icon`."),
    leftIcon: {
      description: "Item L1, Figma `Left Icon`. In code: `leftIcon` or `flag`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
    },
    showLabel: toggle("Item L1, Figma `Show Label`. In code: `hideLabel`."),
    labelText: {
      description: "Item L1, Figma `Label Text`. In code: `label`.",
      control: "text",
    },
    showRightIcon: toggle("Item L1, Figma `Show Right Icon`. In code: `chevron`."),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma Desktop: links left and right of the announcement, from 1024px. */
export const Default: Story = {};

/** Figma Tablet and Mobile: the announcement alone. */
export const AnnouncementOnly: Story = {
  parameters: { controls: { disable: true } },
  args: { showLeft: false, showRight: false },
};
