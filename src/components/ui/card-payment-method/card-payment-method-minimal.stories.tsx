import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardPaymentMethodMinimal } from "./card-payment-method-minimal";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  disabled: boolean;
  showActions: boolean;
  cardNumber: string;
  expireDate: string;
  showEdit: boolean;
  showDelete: boolean;
};

const noop = () => undefined;

const meta = {
  title: "Patterns/Account & Cart & Checkout/Payment Method Cards/Payment Method Minimal",
  // The defaults of Figma's `Card.PaymentMethod.Minimal` (State=Default) and its Base. The card
  // number is the last four digits of Figma's “**** **** **** 5012”: the mask is added in code.
  args: {
    disabled: false,
    showActions: true,
    cardNumber: "5012",
    expireDate: "01/30",
    showEdit: true,
    showDelete: true,
  },
  render: ({ disabled, showActions, cardNumber, expireDate, showEdit, showDelete }) => (
    <CardPaymentMethodMinimal
      network="visa"
      last4={cardNumber}
      expiry={expireDate}
      disabled={disabled}
      onEdit={showActions && showEdit ? noop : undefined}
      onDelete={showActions && showDelete ? noop : undefined}
    />
  ),
  parameters: {
    // The Figma properties of Card.PaymentMethod.Minimal: State (Disabled; Hover & Tap is a CSS
    // state), then the Base ones. The network logo is a nested instance.
    controls: {
      include: ["disabled", "showActions", "cardNumber", "expireDate", "showEdit", "showDelete"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Always mask the card number — only show the last 4 digits for security",
        "Use on the My Account overview, where one saved card is shown",
        "Use Card.PaymentMethod.Extended on the Payment Methods page and in checkout",
      ],
      dont: [
        "Don't display full card numbers — always use masked format",
        "Don't hide Expire Date — users need it to identify and manage expiring cards",
        "Don't add a Make Default action — set the default card on the Payment Methods page",
      ],
    },
    docs: {
      description: {
        component:
          "A payment card showing masked card details with Edit and Delete actions — used on the My Account overview. State: Default, Hover & Tap, Disabled. Full management lives in Card.PaymentMethod.Extended.",
      },
    },
  },
  argTypes: {
    disabled: {
      description: "Figma `State=Disabled`. Hover & Tap is a CSS state.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showActions: {
      description: "Figma `Show Actions`: the Edit and Delete column.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    cardNumber: {
      description:
        "Figma `Card Number` (“**** **** **** 5012”). In code: `last4`, the last four digits.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "5012" } },
    },
    expireDate: {
      description: "Figma `Expire Date`. In code: `expiry`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "01/30" } },
    },
    showEdit: {
      description: "Figma `Show Edit`. In code: pass `onEdit`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showDelete: {
      description: "Figma `Show Delete`. In code: pass `onDelete`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma State=Default. */
export const Default: Story = {};

/** Figma State=Hover & Tap: interactive-subtle-hover fill and border (hover the card). */
export const Hover: Story = { parameters: { controls: { disable: true } } };

/** Figma State=Disabled. */
export const Disabled: Story = { args: { disabled: true } };
