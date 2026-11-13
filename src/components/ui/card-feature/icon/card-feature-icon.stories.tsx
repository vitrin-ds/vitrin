import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../../icon/icon-names";
import { CardFeatureIcon } from "./card-feature-icon";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showIcon: boolean;
  icon: IconName;
  titleText: string;
  showTrailing: boolean;
  trailingText: string;
  showDescription: boolean;
  descriptionText: string;
  showFooter: boolean;
  metaText: string;
  showArrow: boolean;
  showButton: boolean;
};

const toCard = ({
  showIcon,
  icon,
  titleText,
  showTrailing,
  trailingText,
  showDescription,
  descriptionText,
  showFooter,
  metaText,
  showArrow,
  showButton,
}: Args) => {
  const content = {
    icon: showIcon ? icon : undefined,
    title: titleText,
    trailing: showTrailing ? trailingText : undefined,
    description: showDescription ? descriptionText : undefined,
    meta: showFooter ? metaText : undefined,
  };
  // Show Arrow (a link card) and Show Button (an action card) exclude each other: the button wins.
  if (showButton) {
    return (
      <CardFeatureIcon {...content} action={{ label: "Start chat", onClick: () => undefined }} />
    );
  }
  return showArrow ? (
    <CardFeatureIcon {...content} href="/legal/privacy-policy" />
  ) : (
    <CardFeatureIcon {...content} />
  );
};

const meta = {
  title: "Patterns/Discovery/Tactical Feature Cards/Feature Card Icon",
  // The defaults of Figma's `.Base.Card.Feature`.
  args: {
    showIcon: true,
    icon: "lock",
    titleText: "Privacy Policy",
    showTrailing: false,
    trailingText: "Free",
    showDescription: true,
    descriptionText: "How we collect, use and protect your personal data when you shop with us.",
    showFooter: true,
    metaText: "Updated 12 March 2026",
    showArrow: true,
    showButton: false,
  },
  render: (args) => toCard(args),
  parameters: {
    // The Figma properties: State (Default · Hover) is CSS, on link cards. Then Show Icon, Icon, Title Text, Show Trailing, Trailing Text,
    // Show Description, Description Text, Show Footer, Meta Text, Show Arrow, Show Button.
    controls: {
      include: [
        "showIcon",
        "icon",
        "titleText",
        "showTrailing",
        "trailingText",
        "showDescription",
        "descriptionText",
        "showFooter",
        "metaText",
        "showArrow",
        "showButton",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Show Arrow when the whole card is a link",
        "Use Show Button when the card triggers an action",
        "Keep descriptions to two sentences",
        "Use 4-column width (448px) on desktop, 3 per row",
      ],
      dont: [
        "Don't show both arrow and button on one card",
        "Don't use for products — use Card.Product.*",
        "Don't mix Outlined and Tinted in one grid",
        "Don't remove the title — it is the accessible name",
      ],
    },
    docs: {
      description: {
        component:
          "A flexible icon card: title (with optional trailing value such as a price), description, and either a footer (meta + arrow) for link cards or a button for action cards. Used for the Legal Centre, Help Centre topics, contact channels, About values and return options.",
      },
    },
  },
  argTypes: {
    showIcon: {
      description: "Figma `Show Icon`. In code: pass `icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    icon: {
      description: "Figma `Icon`. In code: `icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "lock" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Privacy Policy" } },
    },
    showTrailing: {
      description: "Figma `Show Trailing`. In code: pass `trailing`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    trailingText: {
      description: "Figma `Trailing Text`. In code: `trailing`.",
      control: "text",
      if: { arg: "showTrailing" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Free" } },
    },
    showDescription: {
      description: "Figma `Show Description`. In code: pass `description`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    descriptionText: {
      description: "Figma `Description Text`. In code: `description`.",
      control: "text",
      if: { arg: "showDescription" },
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary: "How we collect, use and protect your personal data when you shop with us.",
        },
      },
    },
    showFooter: {
      description: "Figma `Show Footer`. In code: pass `meta`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    metaText: {
      description: "Figma `Meta Text`. In code: `meta`.",
      control: "text",
      if: { arg: "showFooter" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Updated 12 March 2026" } },
    },
    showArrow: {
      description:
        "Figma `Show Arrow`. In code: pass `href`: the whole card is a link and the footer ends in the arrow. Excludes Show Button.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButton: {
      description:
        "Figma `Show Button`. In code: pass `action`: an Outline button. Excludes Show Arrow (the button wins).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
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

/** A link card: the whole card opens a page (Figma `Show Arrow`). */
export const Default: Story = {};

/** Figma State=Hover: a link card takes surface-accent-subtle under the pointer (hover it). */
export const LinkHover: Story = {
  name: "Link (hover)",
  parameters: { controls: { disable: true } },
  render: () => (
    <CardFeatureIcon
      icon="lock"
      title="Account & security"
      description="Passwords, sign-in and keeping your account safe."
      meta="14 articles"
      href="/help/account"
    />
  ),
};

/**
 * Action cards (`Show Button`): a button with a trailing value, a link drawn as the button
 * (Help Centre "Still need help?"), and a minimal card (title only).
 */
export const Variations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      <CardFeatureIcon
        icon="chat"
        title="Live chat"
        trailing="Free"
        description="Talk to our team every day from 08:00 to 22:00."
        action={{ label: "Start chat", onClick: () => undefined }}
      />
      <CardFeatureIcon
        icon="call"
        title="Call us"
        description="+44 20 0000 0000 · Mon – Sat, 9:00 – 18:00"
        action={{ label: "Call now", href: "tel:+442000000000" }}
      />
      <CardFeatureIcon title="Free returns within 30 days" />
    </div>
  ),
};
