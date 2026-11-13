import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Accordion } from "./accordion";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "collapsed" | "expanded";
  usage: "full" | "card" | "inset";
  titleText: string;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showSubtitle: boolean;
  subtitleText: string;
  rightIcon: IconName;
  accordionPanel: string;
  showTopBar: boolean;
  topBarText: string;
  topBarIcon: IconName;
  showToggle: boolean;
  showThumb: boolean;
  showThumbIcon: boolean;
  showRightIcon: boolean;
  showTopBarIcon: boolean;
  thumbIcon: IconName;
};

const STATES = ["collapsed", "expanded"] as const;
const USAGES = ["full", "card"] as const;

const meta = {
  title: "Components/Data Display/Accordion",
  // The defaults of Figma's `.Base Accordion` as placed in the default variant.
  args: {
    state: "collapsed",
    usage: "full",
    titleText: "Title Text",
    showLeftIcon: true,
    leftIcon: "radio_button_unchecked",
    showSubtitle: true,
    subtitleText: "Subtitle",
    showRightIcon: true,
    rightIcon: "add",
    accordionPanel: "Flexible Area",
    showTopBar: true,
    topBarText: "Title Text",
    showTopBarIcon: true,
    topBarIcon: "star",
    showToggle: false,
    showThumb: true,
    showThumbIcon: true,
    thumbIcon: "credit_card",
  },
  render: ({
    state,
    usage,
    titleText,
    showLeftIcon,
    leftIcon,
    showSubtitle,
    subtitleText,
    showRightIcon,
    rightIcon,
    accordionPanel,
    showTopBar,
    topBarText,
    showTopBarIcon,
    topBarIcon,
    showToggle,
    showThumb,
    showThumbIcon,
    thumbIcon,
  }) => (
    <Accordion
      key={state}
      usage={usage}
      defaultOpen={state === "expanded"}
      title={titleText}
      leftIcon={showLeftIcon ? leftIcon : undefined}
      subtitle={showSubtitle ? subtitleText : undefined}
      indicator={showToggle ? "toggle" : rightIcon === "keyboard_arrow_down" ? "chevron" : "sign"}
      // `add` and the arrow turn with the panel (`indicator`); any other glyph is fixed.
      rightIcon={
        !showRightIcon
          ? null
          : showToggle || (rightIcon !== "add" && rightIcon !== "keyboard_arrow_down")
            ? rightIcon
            : undefined
      }
      topBar={showTopBar ? topBarText : undefined}
      topBarIcon={showTopBar && showTopBarIcon ? topBarIcon : undefined}
      thumb={showThumb}
      thumbIcon={showThumb && showThumbIcon ? thumbIcon : undefined}
    >
      {accordionPanel}
    </Accordion>
  ),
  parameters: {
    // The Figma properties: State, Usage, then `.Base Accordion`. Hover is a CSS state.
    controls: {
      include: [
        "state",
        "usage",
        "titleText",
        "showLeftIcon",
        "leftIcon",
        "showSubtitle",
        "subtitleText",
        "showRightIcon",
        "rightIcon",
        "accordionPanel",
        "showTopBar",
        "topBarText",
        "showTopBarIcon",
        "topBarIcon",
        "showToggle",
        "showThumb",
        "showThumbIcon",
        "thumbIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Full Width for stacked FAQ sections and inline content areas",
        "Use Card for visually separated, standalone collapsible panels (e.g., settings, filters)",
        "Keep Title Text short and descriptive — users scan headers to decide what to expand",
        "Use Subtitle to provide helpful preview context without requiring expansion",
      ],
      dont: [
        "Don't nest accordions inside other accordions — flatten the hierarchy instead",
        "Don't use for critical information that users must see — accordions hide content by default",
        "Don't place lengthy content inside — consider a dedicated page for complex information",
        "Don't use Left Icon purely for decoration — it should reinforce the content category",
      ],
    },
    docs: {
      description: {
        component:
          "A collapsible content panel that reveals detailed information on demand, ideal for FAQs, product details, and settings — available in card and full-width styles.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Collapsed or Expanded. Hover is a CSS state. In code: `defaultOpen` (or `open`).",
      control: "inline-radio",
      options: STATES,
      table: {
        type: { summary: '"collapsed" | "expanded"' },
        defaultValue: { summary: "collapsed" },
      },
    },
    usage: {
      description:
        "Figma `Usage`: Full Width for stacked FAQ sections, Card for standalone panels. Code also has `inset` (a card's last section), which Figma does not.",
      control: "inline-radio",
      options: USAGES,
      table: { type: { summary: '"full" | "card" | "inset"' }, defaultValue: { summary: "full" } },
    },
    titleText: {
      description: "Figma `Title Text`: short and descriptive. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Title Text" } },
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
    showSubtitle: {
      description: "Figma `Show Subtitle`. In code: pass `subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    subtitleText: {
      description:
        "Figma `Subtitle Text`: preview context for the collapsed state. In code: `subtitle`.",
      control: "text",
      if: { arg: "showSubtitle" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Subtitle" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: `rightIcon={null}`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description:
        'Figma `Right Icon`. `add` and `keyboard_arrow_down` turn with the panel (`indicator` "sign" | "chevron"); any other name is `rightIcon`, fixed.',
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: {
        type: { summary: "IconName" },
        defaultValue: { summary: "add" },
      },
    },
    accordionPanel: {
      description: "Figma `Accordion Panel` slot: the expandable body. In code: `children`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Flexible Area" } },
    },
    showTopBar: {
      description: "Figma `Show .Accordion Top Bar`. In code: pass `topBar`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    topBarText: {
      description: "Figma `Top Bar Text`. In code: `topBar`.",
      control: "text",
      if: { arg: "showTopBar" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Title Text" } },
    },
    showTopBarIcon: {
      description: "Figma `Show Acc.T.Bar Right Icon`. In code: pass `topBarIcon`.",
      control: "boolean",
      if: { arg: "showTopBar" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    topBarIcon: {
      description: "Figma `Top Bar Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTopBar" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "star" } },
    },
    showToggle: {
      description:
        'Figma `Show Toggle`: a Toggle opens the panel instead of the Right Icon. In code: `indicator="toggle"`.',
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showThumb: {
      description: "Figma `Show Thumb`. In code: pass `thumbIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showThumbIcon: {
      description: "Figma `Show Thumb Icon`. Off: the tile alone (`thumb`).",
      control: "boolean",
      if: { arg: "showThumb" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    thumbIcon: {
      description: "Figma `Thumb Icon`: a Material Symbols name, in a 38px neutral tile.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showThumb" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "credit_card" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const narrow: Story["decorators"] = [
  (Story) => (
    <div className="max-w-448">
      <Story />
    </div>
  ),
];

/** One collapsible panel. Full Width for FAQ and inline content, Card for standalone panels. */
export const Default: Story = { decorators: narrow };

/** Mirrors the Figma set: Usage × Collapsed · Expanded (Hover is a CSS state), all slots shown. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-full grid-cols-1 gap-24 tablet:grid-cols-2">
      {(["full", "card"] as const).map((usage) => (
        <div key={usage} className="flex flex-col gap-24">
          {[false, true].map((open) => (
            <Accordion
              key={String(open)}
              title={`${usage === "full" ? "Full Width" : "Card"} · ${open ? "Expanded" : "Collapsed"}`}
              usage={usage}
              defaultOpen={open}
              topBar="Title Text"
              topBarIcon="star"
              thumbIcon="credit_card"
              leftIcon="radio_button_unchecked"
            >
              Accordion panel content.
            </Accordion>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Full Width stacked as an FAQ. */
export const Faq: Story = {
  parameters: { controls: { disable: true } },
  decorators: narrow,
  render: () => (
    <div>
      <Accordion title="How long does delivery take?" defaultOpen>
        2–4 working days within the EU.
      </Accordion>
      <Accordion title="Can I return an opened product?">
        Yes, within 30 days with the receipt.
      </Accordion>
      <Accordion title="Do you ship outside the EU?">Not yet.</Accordion>
    </div>
  ),
};

/** Tone On Accent: the mobile Footer link groups on surface-accent-strong. */
export const OnAccent: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-448 flex-col bg-surface-accent-strong p-16">
      <Accordion tone="on-accent" title="Shop" defaultOpen>
        About us · Contact · FAQ
      </Accordion>
      <Accordion tone="on-accent" title="Company" />
    </div>
  ),
};

/** A card's last section, with Figma's chevron (Card.Gift, 03.04). */
export const InsetChevron: Story = {
  decorators: narrow,
  args: {
    usage: "inset",
    rightIcon: "keyboard_arrow_down",
    state: "expanded",
    showTopBar: false,
    showThumb: false,
    showLeftIcon: false,
    showSubtitle: false,
  },
};

function ToggleExample() {
  const [invoicing, setInvoicing] = useState(true);
  const [business, setBusiness] = useState(false);
  return (
    <Accordion
      usage="card"
      indicator="toggle"
      title="Also use this address for invoicing"
      subtitle="We'll send invoices to this address."
      open={invoicing}
      onOpenChange={setInvoicing}
    >
      <Accordion
        usage="card"
        indicator="toggle"
        title="This is a business address"
        subtitle="For company invoices with VAT details."
        open={business}
        onOpenChange={setBusiness}
        headingLevel={4}
      />
    </Accordion>
  );
}

/** A Toggle opens it; without a panel it is a boxed switch (Figma 03.02 Preferences). */
export const WithToggle: Story = {
  parameters: { controls: { disable: true } },
  decorators: narrow,
  render: () => <ToggleExample />,
};
