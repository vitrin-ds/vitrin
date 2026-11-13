import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ActionMenu } from "../action-menu/action-menu";
import { PaymentNetwork, type PaymentNetworkId } from "../payment-network/payment-network";
import {
  CardPaymentMethodExtended,
  type CardPaymentMethodExtendedProps,
} from "./card-payment-method-extended";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: CardPaymentMethodExtendedProps["state"];
  disabled: boolean;
  selected: boolean;
  type: CardPaymentMethodExtendedProps["type"];
  titleText: string;
  paymentMethodIcon: PaymentNetworkId;
  showLabel: boolean;
  showCardNumber: boolean;
  cardNumberText: string;
  showDetails: boolean;
  showHolderDetail: boolean;
  showIconForHolder: boolean;
  holderIcon: IconName;
  holderDetailText: string;
  showAdditionalDetailsText: boolean;
  additionalDetailsText: string;
  showRightAction: boolean;
  showActions: boolean;
  showButtonPrimary: boolean;
  showButtonSecondary: boolean;
};

const NETWORK_OPTIONS = [
  "visa",
  "mastercard",
  "amex",
  "jcb",
  "apple-pay",
  "google-pay",
  "paypal",
  "klarna",
] as const satisfies readonly PaymentNetworkId[];

const noop = () => undefined;

/** Maps the Figma properties to the code props: a slot shows when it is given. */
function extendedProps(args: Args): CardPaymentMethodExtendedProps {
  return {
    state: args.state,
    disabled: args.disabled,
    type: args.type,
    title: args.titleText,
    network: args.paymentMethodIcon,
    label: args.showLabel ? "Default" : undefined,
    last4: args.showCardNumber ? args.cardNumberText : undefined,
    holderDetail: args.showDetails && args.showHolderDetail ? args.holderDetailText : undefined,
    holderIcon: args.showIconForHolder ? args.holderIcon : null,
    additionalDetails:
      args.showDetails && args.showAdditionalDetailsText ? args.additionalDetailsText : undefined,
    primaryAction:
      args.showActions && args.showButtonPrimary
        ? { label: "Set as default", onClick: noop }
        : undefined,
    secondaryAction:
      args.showActions && args.showButtonSecondary ? { label: "Remove", onClick: noop } : undefined,
    onMore: args.showRightAction ? noop : undefined,
  };
}

const EXTENDED = {
  network: "visa" as const,
  title: "Visa ending in 5012",
  label: "Default",
  last4: "5012",
  holderDetail: "Jane Doe",
  additionalDetails: "Expires 01/30",
  primaryAction: { label: "Set as default", onClick: noop },
  secondaryAction: { label: "Remove", onClick: noop },
  onMore: noop,
};

const meta = {
  title: "Patterns/Account & Cart & Checkout/Payment Method Cards/Payment Method Extended",
  // The defaults of Figma's `Card.PaymentMethod.Extended` (Type=List Item) and its Base.
  args: {
    state: "default",
    disabled: false,
    selected: false,
    type: "list",
    titleText: "[Payment Method Title]",
    paymentMethodIcon: "visa",
    showLabel: true,
    showCardNumber: true,
    cardNumberText: "[Card Number]",
    showDetails: true,
    showHolderDetail: true,
    showIconForHolder: true,
    holderIcon: "mail",
    holderDetailText: "[Holder Detail]",
    showAdditionalDetailsText: true,
    additionalDetailsText: "[Additional Details]",
    showRightAction: true,
    showActions: true,
    showButtonPrimary: true,
    showButtonSecondary: true,
  },
  render: (args) =>
    args.selected ? (
      // Selected is the checked card of a radio group; room for the corner badge.
      <div className="p-8">
        <RadioCardGroup label="Payment method" value="card" onValueChange={noop}>
          <CardPaymentMethodExtended {...extendedProps(args)} value="card" />
        </RadioCardGroup>
      </div>
    ) : (
      <CardPaymentMethodExtended {...extendedProps(args)} />
    ),
  parameters: {
    // The Figma properties of Card.PaymentMethod.Extended. Minimal is a separate Figma component with
    // its own story file.
    controls: {
      include: [
        "state",
        "disabled",
        "selected",
        "type",
        "titleText",
        "paymentMethodIcon",
        "showLabel",
        "showCardNumber",
        "cardNumberText",
        "showDetails",
        "showHolderDetail",
        "showIconForHolder",
        "holderIcon",
        "holderDetailText",
        "showAdditionalDetailsText",
        "additionalDetailsText",
        "showRightAction",
        "showActions",
        "showButtonPrimary",
        "showButtonSecondary",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Display the correct Payment Method Icon to match the card brand for instant visual recognition",
        'Use Label to indicate "Default" status on the primary payment method',
        "Use the Card type in account payment settings, List Item type during checkout selection",
        "Show Holder Detail to help users distinguish between multiple cards from the same brand",
      ],
      dont: [
        "Don't display full card numbers — always use masked format in Card Number Text",
        "Don't show Actions during checkout selection — reserve Edit/Delete for account management",
        "Don't show Additional Details if there's nothing meaningful to display — hide empty fields",
        'Don\'t enable both action buttons with destructive actions — pair a primary action (e.g., "Set Default") with a secondary (e.g., "Remove")',
      ],
    },
    docs: {
      description: {
        component:
          "A comprehensive payment method card displaying card brand, masked number, holder details, and management actions — used in account payment settings and checkout payment selection. Selected: 2px border-accent + check_circle (radio group in code: role=radio, aria-checked). Focus uses the global focus ring.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default, Warning (expires soon) or Expired. Hover & Tap and Focus are CSS states.",
      control: "inline-radio",
      options: ["default", "warning", "expired"],
      table: {
        type: { summary: '"default" | "warning" | "expired"' },
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    selected: {
      description:
        "Figma `State=Selected`. In code: the card is the checked one of its `RadioCardGroup` (the story wraps it).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    type: {
      description: "Figma `Type`: List Item in checkout selection, Card in account settings.",
      control: "inline-radio",
      options: ["list", "card"],
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    titleText: {
      description:
        "Figma `Title Text`. In code: `title`. `Show Payment Method Title` is not a control: the title names the card.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Payment Method Title]" } },
    },
    paymentMethodIcon: {
      description: "Figma `Payment Method Icon`: the card brand logo. In code: `network`.",
      control: "select",
      options: NETWORK_OPTIONS,
      table: { type: { summary: "PaymentNetworkId" }, defaultValue: { summary: "visa" } },
    },
    showLabel: {
      description: "Figma `Show Label`. In code: pass `label`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showCardNumber: {
      description: "Figma `Show Card Number`. In code: pass `last4`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    cardNumberText: {
      description: "Figma `Card Number Text`. In code: `last4`, the last four digits.",
      control: "text",
      if: { arg: "showCardNumber" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Card Number]" } },
    },
    showDetails: {
      description: "Figma `Show Details`: the holder and additional details rows.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showHolderDetail: {
      description: "Figma `Show Holder Detail`. In code: pass `holderDetail`.",
      control: "boolean",
      if: { arg: "showDetails" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showIconForHolder: {
      description: "Figma `Show Icon For Holder`. In code: `holderIcon`, `null` for none.",
      control: "boolean",
      if: { arg: "showHolderDetail" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    holderIcon: {
      description: "Figma `Holder Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showIconForHolder" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "mail" } },
    },
    holderDetailText: {
      description: "Figma `Holder Detail Text`. In code: `holderDetail`.",
      control: "text",
      if: { arg: "showHolderDetail" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Holder Detail]" } },
    },
    showAdditionalDetailsText: {
      description: "Figma `Show Additional Details Text`. In code: pass `additionalDetails`.",
      control: "boolean",
      if: { arg: "showDetails" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    additionalDetailsText: {
      description: "Figma `Additional Details Text`. In code: `additionalDetails`.",
      control: "text",
      if: { arg: "showAdditionalDetailsText" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Additional Details]" } },
    },
    showRightAction: {
      description: "Figma `Show Right Action`. In code: pass `onMore`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showActions: {
      description: "Figma `Show Actions`: the button row.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonPrimary: {
      description: "Figma `Show Button [Primary]`. In code: pass `primaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonSecondary: {
      description: "Figma `Show Button [Secondary]`. In code: pass `secondaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults: placeholder text, List Item. */
export const Default: Story = {};

/** Figma `Card.PaymentMethod.Extended`: List Item · Card × Default · Warning · Expired · Disabled. */
export const Extended: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      <CardPaymentMethodExtended {...EXTENDED} />
      <CardPaymentMethodExtended
        {...EXTENDED}
        type="card"
        network="mastercard"
        title="Mastercard ending in 4444"
        last4="4444"
        label={undefined}
        state="warning"
        additionalDetails="Expires 11/26: update your card soon"
      />
      <CardPaymentMethodExtended
        {...EXTENDED}
        type="card"
        state="expired"
        title="Visa ending in 1881"
        last4="1881"
        label="Expired"
        additionalDetails="Expired 01/24"
      />
      <CardPaymentMethodExtended
        {...EXTENDED}
        type="card"
        title="Visa ending in 0004"
        last4="0004"
        disabled
      />
    </div>
  ),
};

/** Payment Methods (Figma 03.03): the labels' colours and icons, the short number, the menu. */
export const InMyAccount: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const menu = (label: string) => (
      <ActionMenu
        label={label}
        items={[{ label: "Delete", icon: "delete", onSelect: () => undefined }]}
      />
    );
    return (
      <div className="flex max-w-676 flex-col gap-8">
        <CardPaymentMethodExtended
          type="card"
          network="visa"
          title="Personal Visa"
          label="DEFAULT"
          labelColor="info"
          labelIcon="check"
          last4="5012"
          shortNumber
          holderDetail="Jane Doe"
          holderIcon={null}
          additionalDetails="Expires 01/30"
          menu={menu("More actions for Personal Visa")}
        />
        <CardPaymentMethodExtended
          type="card"
          network="paypal"
          title="PayPal"
          label="CONNECTED"
          labelColor="success"
          labelIcon="check"
          holderDetail="j***@example.com"
          menu={menu("More actions for PayPal")}
        />
        <CardPaymentMethodExtended
          type="card"
          network="mastercard"
          title="Work Card"
          label="EXPIRES SOON"
          labelColor="warning"
          labelIcon="schedule"
          last4="4444"
          shortNumber
          holderDetail="Jane Doe"
          holderIcon={null}
          additionalDetails="Expires 11/26 · in 26 days"
          state="warning"
          primaryAction={{
            label: "Update expiry & CVV",
            rightIcon: "keyboard_arrow_right",
            onClick: () => undefined,
          }}
          menu={menu("More actions for Work Card")}
        />
      </div>
    );
  },
};

function PaymentSelection() {
  const [extended, setExtended] = useState<string | undefined>("visa");
  return (
    <div className="flex flex-col gap-24">
      <RadioCardGroup
        label="Payment method"
        value={extended}
        onValueChange={setExtended}
        className="flex flex-col gap-16"
      >
        <CardPaymentMethodExtended {...EXTENDED} value="visa" type="card" />
        <CardPaymentMethodExtended
          {...EXTENDED}
          value="jcb"
          type="card"
          network="jcb"
          title="JCB ending in 0505"
          last4="0505"
          label={undefined}
        />
      </RadioCardGroup>
    </div>
  );
}

/** Figma `State=Selected` (Card.PaymentMethod.Extended): checkout selection as a radio group. */
export const Selection: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    // Room for the corner badge, which sits outside the card.
    <div className="p-8">
      <PaymentSelection />
    </div>
  ),
};

const NETWORKS: PaymentNetworkId[] = [
  "visa",
  "mastercard",
  "amex",
  "jcb",
  "google-pay",
  "apple-pay",
  "paypal",
  "klarna",
];

/** Figma `r-payment-methods` (Size=24 badge, Size=48 artwork); Klarna has no logo yet (text mark). */
export const Networks: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-8">
      {NETWORKS.map((network) => (
        <PaymentNetwork key={network} network={network} />
      ))}
    </div>
  ),
};
