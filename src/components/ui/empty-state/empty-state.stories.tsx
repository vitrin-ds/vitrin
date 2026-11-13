import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { EmptyState } from "./empty-state";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  type: "icon" | "error-code";
  showIcon: boolean;
  icon: IconName;
  showCode: boolean;
  codeText: string;
  titleText: string;
  bodyText: string;
  showActions: boolean;
  showPrimaryAction: boolean;
  showSecondaryAction: boolean;
  // Not Figma properties: the labels of the two Button instances inside the actions.
  primaryLabel: string;
  secondaryLabel: string;
};

const TYPES = ["icon", "error-code"] as const;

const meta = {
  title: "Foundations/Empty States",
  // The defaults of Figma's `.Base.EmptyState`.
  args: {
    type: "icon",
    showIcon: true,
    icon: "store",
    showCode: false,
    codeText: "404",
    titleText: "No stores found near “Zermatt”",
    bodyText: "Try a different town or postcode, or zoom out on the map.",
    showActions: true,
    showPrimaryAction: true,
    showSecondaryAction: true,
    primaryLabel: "Use my current location",
    secondaryLabel: "Shop online",
  },
  render: ({
    type,
    showIcon,
    icon,
    showCode,
    codeText,
    titleText,
    bodyText,
    showActions,
    showPrimaryAction,
    showSecondaryAction,
    primaryLabel,
    secondaryLabel,
  }) => {
    const isCode = type === "error-code";
    const common = {
      title: titleText,
      body: bodyText || undefined,
      headingLevel: isCode ? (1 as const) : (2 as const),
      primaryAction:
        showActions && showPrimaryAction ? { label: primaryLabel, href: "/" } : undefined,
      secondaryAction:
        showActions && showSecondaryAction
          ? { label: secondaryLabel, href: "/help/contact" }
          : undefined,
    };
    return isCode ? (
      <EmptyState {...common} type="error-code" code={showCode ? codeText : undefined} />
    ) : (
      <EmptyState {...common} type="icon" icon={showIcon ? icon : undefined} />
    );
  },
  parameters: {
    // The Figma properties: Type, then `.Base.EmptyState`.
    controls: {
      include: [
        "type",
        "showIcon",
        "icon",
        "showCode",
        "codeText",
        "titleText",
        "bodyText",
        "showActions",
        "showPrimaryAction",
        "showSecondaryAction",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Say what happened and what to do next",
        "Offer one primary action that resolves the state",
        "Use Error Code only on full-page 404 / 410 / 500 pages",
        "Keep the title short; put details in the body",
      ],
      dont: [
        "Don't blame the user (“You entered…”)",
        "Don't show an empty state without any action",
        "Don't use technical jargon or stack traces",
        "Don't stack several empty states on one screen",
      ],
    },
    docs: {
      description: {
        component:
          "Communicates that there is nothing to show — no search results, an empty list — or that a page can't be shown (404 / 410 / 500). Always explains why and offers a next step.",
      },
    },
  },
  argTypes: {
    type: {
      description:
        "Figma `Type`: Icon is a tinted card inside a page, Error Code a full-page 404 / 410 / 500.",
      control: "inline-radio",
      options: TYPES,
      table: { type: { summary: '"icon" | "error-code"' }, defaultValue: { summary: "icon" } },
    },
    showIcon: {
      description: "Figma `Show Icon`. In code: pass `icon`. Type Icon only.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    icon: {
      description: "Figma `Icon`: a Material Symbols name. Type Icon only.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "store" } },
    },
    showCode: {
      description: "Figma `Show Code`. In code: pass `code`. Type Error Code only.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    codeText: {
      description: "Figma `Code Text`: the error code, e.g. 404. In code: `code`.",
      control: "text",
      if: { arg: "showCode" },
      table: { type: { summary: "string" }, defaultValue: { summary: "404" } },
    },
    titleText: {
      description: "Figma `Title Text`: what happened, in plain language. In code: `title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "No stores found near “Zermatt”" },
      },
    },
    bodyText: {
      description: "Figma `Body Text`: why, and what the user can do. In code: `body`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Try a different town or postcode, or zoom out on the map." },
      },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `primaryAction` or `secondaryAction`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showPrimaryAction: {
      description: "Figma `Show Primary Action` (Filled button). In code: pass `primaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showSecondaryAction: {
      description:
        "Figma `Show Secondary Action` (Outline button). In code: pass `secondaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-676">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Type=Icon`: a tinted card inside a page. */
export const Default: Story = {};

/** Figma `Type=Error Code`: a full-page 404, with the title as the page's h1. */
export const ErrorCode: Story = {
  args: {
    type: "error-code",
    showIcon: false,
    showCode: true,
    codeText: "404",
    titleText: "We can't find that page",
    bodyText:
      "The link may be broken, or the page may have moved. Try searching, or start again from one of the links below.",
    primaryLabel: "Go to homepage",
    secondaryLabel: "Contact us",
  },
};

/** Only a title and one action (`Show Icon`, `Show Secondary Action` off). */
export const Minimal: Story = {
  args: {
    showIcon: false,
    titleText: "Your basket is empty",
    bodyText: "",
    primaryLabel: "Start shopping",
    showSecondaryAction: false,
  },
};
