import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { ActionMenu } from "../action-menu/action-menu";
import { Accordion } from "../accordion/accordion";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardGift } from "./card-gift";

const TERMS = (
  <Accordion title="Terms & restrictions" usage="inset" indicator="chevron">
    <p className="pt-16 text-body-sm text-text-primary">
      Minimum spend €25. Not redeemable for cash.
    </p>
  </Accordion>
);

const BASE = {
  title: "Birthday from Mum",
  overline: "AVAILABLE BALANCE",
  value: "€42.50",
  caption: "of €50.00",
  progress: { value: 4250, max: 5000, label: "Balance left", valueText: "€42.50 of €50.00" },
  last4: "7K2M",
  details: "Expires Dec 2028",
  copy: { label: "Copy code", onClick: () => undefined },
  terms: TERMS,
} satisfies Partial<ComponentProps<typeof CardGift>>;

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "warning" | "expired";
  type: "list" | "card";
  topLeftIcon: IconName;
  showGiftCardTitle: boolean;
  titleText: string;
  showLabel: boolean;
  balanceText: string;
  showCardTotal: boolean;
  cardTotalText: string;
  showProgress: boolean;
  showCodeExpiryDate: boolean;
  showCode: boolean;
  codeText: string;
  showExpiryDate: boolean;
  expiryText: string;
  showRightAction: boolean;
  showAccordion: boolean;
};

const LABEL = {
  default: { text: "ACTIVE", color: "info" as const },
  warning: { text: "EXPIRES SOON", color: "warning" as const },
  expired: { text: "FULLY USED", color: "default" as const },
};

const meta = {
  title: "Patterns/Account & Cart & Checkout/Gift & Rewards/Gift Card",
  // The defaults of Figma's `Card.Gift` (State=Default, Type=List Item) and `.Base.Card.Gift`.
  args: {
    state: "default",
    type: "list",
    topLeftIcon: "redeem",
    showGiftCardTitle: true,
    titleText: "[Gift Card Title]",
    showLabel: true,
    balanceText: "€42.50",
    showCardTotal: true,
    cardTotalText: "of €42.50",
    showProgress: true,
    showCodeExpiryDate: true,
    showCode: true,
    codeText: "7K2M",
    showExpiryDate: true,
    expiryText: "Expires Dec 2028",
    showRightAction: true,
    showAccordion: true,
  },
  render: (a) => (
    <div className="max-w-375">
      <CardGift
        state={a.state}
        type={a.type}
        icon={a.topLeftIcon}
        title={a.showGiftCardTitle ? a.titleText : undefined}
        label={a.showLabel ? LABEL[a.state] : undefined}
        overline="AVAILABLE BALANCE"
        value={a.balanceText}
        caption={a.showCardTotal ? a.cardTotalText : undefined}
        progress={a.showProgress ? BASE.progress : undefined}
        last4={a.showCodeExpiryDate && a.showCode ? a.codeText : undefined}
        copy={BASE.copy}
        details={a.showCodeExpiryDate && a.showExpiryDate ? a.expiryText : undefined}
        menu={
          a.showRightAction ? (
            <ActionMenu
              label="More actions"
              items={[{ label: "Edit name", icon: "edit_square", onSelect: () => undefined }]}
            />
          ) : undefined
        }
        terms={a.showAccordion ? TERMS : undefined}
      />
    </div>
  ),
  parameters: {
    // The Figma properties: State, Type, then `.Base.Card.Gift`.
    controls: {
      include: [
        "state",
        "type",
        "topLeftIcon",
        "showGiftCardTitle",
        "titleText",
        "showLabel",
        "balanceText",
        "showCardTotal",
        "cardTotalText",
        "showProgress",
        "showCodeExpiryDate",
        "showCode",
        "codeText",
        "showExpiryDate",
        "expiryText",
        "showRightAction",
        "showAccordion",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Warning state when the card is approaching its expiry date to prompt usage",
        "Use Expired state to clearly communicate the card can no longer be redeemed",
        "Show Progress to give users a visual sense of how much balance remains relative to the original value",
        "Show the Accordion for Terms & Restrictions to keep legal details accessible but not intrusive",
      ],
      dont: [
        "Don't display the full gift card code — always use a masked format for security",
        "Don't hide Balance — it's the primary information users check on a gift card",
        "Don't show Card Total without Progress — the total is only meaningful alongside a visual comparison",
        "Don't use Default state for cards nearing expiry — switch to Warning to drive urgency",
      ],
    },
    docs: {
      description: {
        component:
          "A gift card management card displaying balance, usage progress, redemption code, expiry date, and terms, with visual states for active, expiring soon, and expired cards.",
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
    topLeftIcon: {
      description: "Figma `Top Left Icon`. In code: `icon`.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "redeem" } },
    },
    showGiftCardTitle: {
      description: "Figma `Show Gift Card Title`. In code: pass `title`.",
      control: "boolean",
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      if: { arg: "showGiftCardTitle" },
    },
    showLabel: { description: "Figma `Show Label`. In code: pass `label`.", control: "boolean" },
    balanceText: { description: "Figma `Balance Text`. In code: `value`.", control: "text" },
    showCardTotal: {
      description: "Figma `Show Card Total`. In code: pass `caption`.",
      control: "boolean",
    },
    cardTotalText: {
      description: "Figma `Card Total Text`. In code: `caption`.",
      control: "text",
      if: { arg: "showCardTotal" },
    },
    showProgress: {
      description: "Figma `Show Progress`. In code: pass `progress`.",
      control: "boolean",
    },
    showCodeExpiryDate: {
      description: "Figma `Show Code & Expiry Date`: the code and expiry row.",
      control: "boolean",
    },
    showCode: {
      description: "Figma `Show Code`. In code: pass `last4`.",
      control: "boolean",
      if: { arg: "showCodeExpiryDate" },
    },
    codeText: {
      description: "Figma `Code Text` (“•••• 7K2M”). In code: `last4`, the mask is added.",
      control: "text",
      if: { arg: "showCode" },
    },
    showExpiryDate: {
      description: "Figma `Show Expiry Date`. In code: pass `details`.",
      control: "boolean",
      if: { arg: "showCodeExpiryDate" },
    },
    expiryText: {
      description: "Figma `Expiry Text`. In code: `details`.",
      control: "text",
      if: { arg: "showExpiryDate" },
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

/** Figma `State`: Default · Warning · Expired (03.04 Gift Cards). */
export const States: StoryObj<Args> = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-676 flex-col gap-8">
      <CardGift
        {...BASE}
        type="card"
        label={{ text: "ACTIVE", color: "info", icon: "radio_button_checked" }}
      />
      <CardGift
        {...BASE}
        type="card"
        state="warning"
        title="From James"
        label={{ text: "EXPIRES SOON", color: "warning", icon: "info" }}
        details="Expires 21 Nov · in 17 days"
      />
      <CardGift
        {...BASE}
        type="card"
        state="expired"
        title="Holiday voucher"
        value="€0.00"
        label={{ text: "FULLY USED", color: "default", icon: "check" }}
        details="Used 18 Mar 2026"
      />
    </div>
  ),
};
