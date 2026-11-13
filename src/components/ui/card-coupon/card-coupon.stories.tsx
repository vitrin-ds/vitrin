import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Accordion } from "../accordion/accordion";
import { ActionMenu } from "../action-menu/action-menu";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardCoupon } from "./card-coupon";

const BASE = {
  code: "SUMMER25",
  value: "-€25",
  caption: "off your order",
  description: "Summer sale promotion for valued customers.",
  tags: [{ text: "MIN SPEND €100", icon: "package_2" as const }, { text: "SINGLE USE" }],
  copy: { label: "Copy SUMMER25", onClick: () => undefined },
};

const TERMS = (
  <Accordion title="Terms & restrictions" usage="inset" indicator="chevron">
    <p className="pt-16 text-body-sm text-text-primary">One use per customer.</p>
  </Accordion>
);

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "warning" | "expired";
  type: "list" | "card";
  itemPrimaryIdentity: string;
  showLabel: boolean;
  value: string;
  showRequirement: boolean;
  requirementText: string;
  showInfo: boolean;
  infoText: string;
  showLabels: boolean;
  showLabel1: boolean;
  showLabel2: boolean;
  showLabel3: boolean;
  showMainDisclaimer: boolean;
  mainDisclaimerIcon: IconName;
  mainDisclaimerText: string;
  showRightAction: boolean;
  showAccordion: boolean;
};

const LABEL = {
  default: { text: "ACTIVE", color: "info" as const },
  warning: { text: "EXPIRES SOON", color: "warning" as const },
  expired: { text: "USED", color: "default" as const },
};

const meta = {
  title: "Patterns/Account & Cart & Checkout/Gift & Rewards/Coupon Card",
  // The defaults of Figma's `Card.Coupon` (State=Default, Type=List Item) and `.Base.Card.Coupon`.
  args: {
    state: "default",
    type: "list",
    itemPrimaryIdentity: "[Item Primary Identitiy]",
    showLabel: true,
    value: "-€25",
    showRequirement: true,
    requirementText: "off your order",
    showInfo: true,
    infoText: "Summer sale promotion for valued customers.",
    showLabels: true,
    showLabel1: true,
    showLabel2: true,
    showLabel3: true,
    showMainDisclaimer: true,
    mainDisclaimerIcon: "package_2",
    mainDisclaimerText: "Min spend £100 · Single use",
    showRightAction: true,
    showAccordion: true,
  },
  render: (a) => {
    const tags = [a.showLabel1, a.showLabel2, a.showLabel3].flatMap((shown, i) =>
      shown ? [{ text: `DEFAULT ${i + 1}` }] : [],
    );
    return (
      <div className="max-w-375">
        <CardCoupon
          state={a.state}
          type={a.type}
          code={a.itemPrimaryIdentity}
          copy={BASE.copy}
          label={a.showLabel ? LABEL[a.state] : undefined}
          value={a.value}
          caption={a.showRequirement ? a.requirementText : undefined}
          description={a.showInfo ? a.infoText : undefined}
          tags={a.showLabels ? tags : []}
          disclaimer={
            a.showMainDisclaimer
              ? { text: a.mainDisclaimerText, icon: a.mainDisclaimerIcon }
              : undefined
          }
          menu={
            a.showRightAction ? (
              <ActionMenu
                label="More actions"
                items={[{ label: "Remove", icon: "delete", onSelect: () => undefined }]}
              />
            ) : undefined
          }
          terms={a.showAccordion ? TERMS : undefined}
        />
      </div>
    );
  },
  parameters: {
    // The Figma properties: State, Type, then `.Base.Card.Coupon`.
    controls: {
      include: [
        "state",
        "type",
        "itemPrimaryIdentity",
        "showLabel",
        "value",
        "showRequirement",
        "requirementText",
        "showInfo",
        "infoText",
        "showLabels",
        "showLabel1",
        "showLabel2",
        "showLabel3",
        "showMainDisclaimer",
        "mainDisclaimerIcon",
        "mainDisclaimerText",
        "showRightAction",
        "showAccordion",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Warning state when the coupon is approaching its expiry date to drive urgency",
        "Use Expired state to clearly communicate the coupon is no longer redeemable",
        'Use Labels to indicate applicable categories (e.g., "Beauty", "Electronics", "Sitewide")',
        "Show Main Disclaimer to surface key restrictions (minimum spend, single use) at a glance without requiring accordion expansion",
      ],
      dont: [
        "Don't hide Value — it's the primary motivator and the first thing users look for",
        "Don't show all three Labels unless the coupon genuinely applies to multiple categories",
        "Don't use Info Text for legal terms — keep it promotional; put restrictions in the Disclaimer and Accordion",
        "Don't use Default state for coupons nearing expiry — switch to Warning to create time pressure",
      ],
    },
    docs: {
      description: {
        component:
          "A promotional coupon card displaying discount value, usage requirements, descriptive info, category labels, and terms, with visual states for active, expiring soon, and expired coupons.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default · Warning (expiring soon) · Expired (used or past its date).",
      control: "inline-radio",
      options: ["default", "warning", "expired"],
      table: {
        type: { summary: '"default" | "warning" | "expired"' },
        defaultValue: { summary: "default" },
      },
    },
    type: {
      description: "Figma `Type`: List Item (bottom border) or Card (radius 8, border all round).",
      control: "inline-radio",
      options: ["list", "card"],
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    itemPrimaryIdentity: {
      description: "Figma `Item Primary Identitiy`: the code. In code: `code`.",
      control: "text",
    },
    showLabel: { description: "Figma `Show Label`. In code: pass `label`.", control: "boolean" },
    value: { description: "Figma `Value`, e.g. -€25.", control: "text" },
    showRequirement: {
      description: "Figma `Show Requirement`. In code: pass `caption`.",
      control: "boolean",
    },
    requirementText: {
      description: "Figma `Requirement Text`. In code: `caption`.",
      control: "text",
      if: { arg: "showRequirement" },
    },
    showInfo: {
      description: "Figma `Show Info`. In code: pass `description`.",
      control: "boolean",
    },
    infoText: {
      description: "Figma `Info Text`. In code: `description`.",
      control: "text",
      if: { arg: "showInfo" },
    },
    showLabels: {
      description: "Figma `Show Labels`: the condition Labels. In code: `tags` (up to three).",
      control: "boolean",
    },
    showLabel1: {
      description: "Figma `Show Label [1]`.",
      control: "boolean",
      if: { arg: "showLabels" },
    },
    showLabel2: {
      description: "Figma `Show Label [2]`.",
      control: "boolean",
      if: { arg: "showLabels" },
    },
    showLabel3: {
      description: "Figma `Show Label [3]`.",
      control: "boolean",
      if: { arg: "showLabels" },
    },
    showMainDisclaimer: {
      description: "Figma `Show Main Disclaimer`. In code: pass `disclaimer`.",
      control: "boolean",
    },
    mainDisclaimerIcon: {
      description: "Figma `Main Disclaimer Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showMainDisclaimer" },
    },
    mainDisclaimerText: {
      description: "Figma `Main Disclaimer Text`.",
      control: "text",
      if: { arg: "showMainDisclaimer" },
    },
    showRightAction: {
      description: "Figma `Show Right Action`. In code: pass `menu` (an Action Menu).",
      control: "boolean",
    },
    showAccordion: {
      description: "Figma `Show Accordion [Terms & Restrictions]`. In code: pass `terms`.",
      control: "boolean",
    },
  },
} satisfies Meta<Args>;

export default meta;

/** The Figma defaults (State=Default, Type=List Item). */
export const Default: StoryObj<Args> = {};

/** Figma `State`: Default · Warning · Expired (03.04 Coupons). */
export const States: StoryObj<Args> = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-676 flex-col gap-8">
      <CardCoupon
        {...BASE}
        type="card"
        label={{ text: "READY TO USE", color: "success", icon: "check" }}
        disclaimer={{ text: "Expires 31 Aug 2027", icon: "schedule" }}
      />
      <CardCoupon
        {...BASE}
        type="card"
        state="warning"
        code="WELCOME20"
        label={{ text: "EXPIRES SOON", color: "warning", icon: "schedule" }}
        disclaimer={{ text: "Expires 17 Nov · in 13 days", icon: "schedule" }}
      />
      <CardCoupon
        {...BASE}
        type="card"
        state="expired"
        code="LOYALTY50"
        tags={[]}
        label={{ text: "USED", color: "neutral", icon: "check" }}
        disclaimer={{ text: "Used 22 Mar 2026", icon: "check" }}
      />
    </div>
  ),
};
