import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { RadioCardGroup } from "@/components/base/radio-card/radio-card";
import { ActionMenu } from "../action-menu/action-menu";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardAddress, type CardAddressProps } from "./card-address";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  disabled: boolean;
  selected: boolean;
  type: CardAddressProps["type"];
  showActions: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showRightAction: boolean;
  topLeftIcon: IconName;
  titleText: string;
  showLabelDefaultShip: boolean;
  showLabelDefaultBill: boolean;
  showLabelBusiness: boolean;
  nameSurnameText: string;
  showAddressLine1: boolean;
  addressLine1Text: string;
  showAddressLine2: boolean;
  addressLine2Text: string;
  showCityCountry: boolean;
  cityCountryText: string;
  showPhone: boolean;
  phoneText: string;
  showInvoiceDetails: boolean;
  showInvoiceNameText: boolean;
  invoiceNameText: string;
  showVatNumber: boolean;
  vatNumberText: string;
};

const noop = () => undefined;

/** Maps the Figma properties to the code props: a slot shows when it is given. */
function addressProps(args: Args): CardAddressProps {
  const actions = args.showActions;
  return {
    title: args.titleText,
    type: args.type,
    disabled: args.disabled,
    icon: args.topLeftIcon,
    roles: {
      defaultShipping: args.showLabelDefaultShip,
      defaultBilling: args.showLabelDefaultBill,
      business: args.showLabelBusiness,
    },
    name: args.nameSurnameText,
    lines: [
      args.showAddressLine1 ? args.addressLine1Text : undefined,
      args.showAddressLine2 ? args.addressLine2Text : undefined,
      args.showCityCountry ? args.cityCountryText : undefined,
    ].filter((line): line is string => Boolean(line)),
    phone: args.showPhone ? args.phoneText : undefined,
    invoice: args.showInvoiceDetails
      ? {
          name: args.showInvoiceNameText ? args.invoiceNameText : "",
          vatNumber: args.showVatNumber ? args.vatNumberText : undefined,
        }
      : undefined,
    onEdit: actions && args.showEdit ? noop : undefined,
    onDelete: actions && args.showDelete ? noop : undefined,
    onMore: args.showRightAction ? noop : undefined,
  };
}

const meta = {
  title: "Patterns/Account & Cart & Checkout/Address Card",
  // The defaults of Figma's `Card.Address` (Type=List Item) and `.Base.Card.Address`.
  args: {
    disabled: false,
    selected: false,
    type: "list",
    showActions: true,
    showEdit: true,
    showDelete: true,
    showRightAction: true,
    topLeftIcon: "star",
    titleText: "[Address Title]",
    showLabelDefaultShip: true,
    showLabelDefaultBill: true,
    showLabelBusiness: true,
    nameSurnameText: "[Name Surname]",
    showAddressLine1: true,
    addressLine1Text: "[Address line 1]",
    showAddressLine2: true,
    addressLine2Text: "[Address line 2]",
    showCityCountry: true,
    cityCountryText: "[City & Country]",
    showPhone: true,
    phoneText: "Phone",
    showInvoiceDetails: true,
    showInvoiceNameText: true,
    invoiceNameText: "[Invoice Name]",
    showVatNumber: true,
    vatNumberText: "[VAT Number]",
  },
  render: (args) =>
    args.selected ? (
      // Selected is the checked card of a radio group; room for the corner badge.
      <div className="p-8">
        <RadioCardGroup label="Address" value="address" onValueChange={noop}>
          <CardAddress {...addressProps(args)} value="address" />
        </RadioCardGroup>
      </div>
    ) : (
      <CardAddress {...addressProps(args)} />
    ),
  parameters: {
    controls: {
      include: [
        "disabled",
        "selected",
        "type",
        "showActions",
        "showEdit",
        "showDelete",
        "showRightAction",
        "topLeftIcon",
        "titleText",
        "showLabelDefaultShip",
        "showLabelDefaultBill",
        "showLabelBusiness",
        "nameSurnameText",
        "showAddressLine1",
        "addressLine1Text",
        "showAddressLine2",
        "addressLine2Text",
        "showCityCountry",
        "cityCountryText",
        "showPhone",
        "phoneText",
        "showInvoiceDetails",
        "showInvoiceNameText",
        "invoiceNameText",
        "showVatNumber",
        "vatNumberText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Labels to indicate address roles — Default Ship, Default Bill, and Business can coexist on one address",
        "Show both address lines for complete street-level detail",
        "Use the Card type in account address book, List Item type during checkout selection",
        "Always display City & Country for clear location identification",
      ],
      dont: [
        "Don't show Edit and Delete during checkout selection — reserve them for account management",
        "Don't show all three labels unless the address genuinely serves all roles",
        "Don't hide Address line 1 — it's the core address content",
        "Don't leave Address line 2 visible when it's empty — hide it if there's no secondary detail",
      ],
    },
    docs: {
      description: {
        component:
          "A saved address card displaying structured address fields with type labels, contact info, and management actions, used in account address book and checkout address selection.",
      },
    },
  },
  argTypes: {
    disabled: {
      description: "Figma `State=Disabled`. Hover & Tap and Focus are CSS states.",
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
      description: "Figma `Type`: List Item in checkout selection, Card in the address book.",
      control: "inline-radio",
      options: ["list", "card"],
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `onEdit` / `onDelete`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
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
    showRightAction: {
      description: "Figma `Show Right Action`. In code: pass `onMore`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    topLeftIcon: {
      description: "Figma `Top Left Icon`: a Material Symbols name. In code: `icon`.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "star" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Address Title]" } },
    },
    showLabelDefaultShip: {
      description: "Figma `Show Label [Default Ship]`. In code: `roles.defaultShipping`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabelDefaultBill: {
      description: "Figma `Show Label [Default Bill]`. In code: `roles.defaultBilling`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabelBusiness: {
      description: "Figma `Show Label [Business]`. In code: `roles.business`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    nameSurnameText: {
      description: "Figma `Name Surname Text`. In code: `name`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Name Surname]" } },
    },
    showAddressLine1: {
      description: "Figma `Show Address line 1`. In code: the first entry of `lines`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    addressLine1Text: {
      description: "Figma `Address line 1 Text`. In code: an entry of `lines`.",
      control: "text",
      if: { arg: "showAddressLine1" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Address line 1]" } },
    },
    showAddressLine2: {
      description: "Figma `Show Address line 2`. In code: an entry of `lines`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    addressLine2Text: {
      description: "Figma `Address line 2 Text`. In code: an entry of `lines`.",
      control: "text",
      if: { arg: "showAddressLine2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Address line 2]" } },
    },
    showCityCountry: {
      description: "Figma `Show City & Country`. In code: an entry of `lines`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    cityCountryText: {
      description: "Figma `City & Country Text`. In code: an entry of `lines`.",
      control: "text",
      if: { arg: "showCityCountry" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[City & Country]" } },
    },
    showPhone: {
      description: "Figma `Show Phone`. In code: pass `phone`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    phoneText: {
      description: "Figma `Phone Text`. In code: `phone`.",
      control: "text",
      if: { arg: "showPhone" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Phone" } },
    },
    showInvoiceDetails: {
      description: "Figma `Show Invoice Details`. In code: pass `invoice`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showInvoiceNameText: {
      description: "Figma `Show Invoice Name Text`. In code: `invoice.name`.",
      control: "boolean",
      if: { arg: "showInvoiceDetails" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    invoiceNameText: {
      description: "Figma `Invoice Name Text`. In code: `invoice.name`.",
      control: "text",
      if: { arg: "showInvoiceNameText" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[Invoice Name]" } },
    },
    showVatNumber: {
      description: "Figma `Show VAT Number`. In code: `invoice.vatNumber`.",
      control: "boolean",
      if: { arg: "showInvoiceDetails" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    vatNumberText: {
      description: "Figma `VAT Number Text`. In code: `invoice.vatNumber`.",
      control: "text",
      if: { arg: "showVatNumber" },
      table: { type: { summary: "string" }, defaultValue: { summary: "[VAT Number]" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Card.Address` (List Item), all slots. */
export const Default: Story = {};

/** Card type in the address book, a checkout row without actions, and Disabled. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-16">
      <CardAddress {...addressProps(args)} type="card" title="Home address" />
      <CardAddress
        title="Office"
        name="Jane Doe"
        lines={["Keizersgracht 221", "1016 DV Amsterdam, Netherlands"]}
        phone="+31 20 7654321"
      />
      <CardAddress {...addressProps(args)} type="card" title="Old address" disabled />
    </div>
  ),
};

/** My Address (Figma 03.02): the whole card opens it, and the Action Menu is its Right Action. */
export const WithMenu: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="max-w-676 pb-160">
      <CardAddress
        {...addressProps(args)}
        type="card"
        title="Home"
        icon="home"
        onEdit={undefined}
        onDelete={undefined}
        onMore={undefined}
        onOpen={() => undefined}
        menu={
          <ActionMenu
            label="More actions for Home"
            items={[
              { label: "Edit", icon: "edit_square", onSelect: () => undefined },
              { label: "Remove default shipping", icon: "cancel", onSelect: () => undefined },
              { label: "Delete", icon: "delete", onSelect: () => undefined },
            ]}
          />
        }
      />
    </div>
  ),
};

function AddressSelection() {
  const [value, setValue] = useState<string | undefined>("home");
  return (
    <RadioCardGroup
      label="Shipping address"
      value={value}
      onValueChange={setValue}
      className="flex flex-col gap-16"
    >
      <CardAddress
        value="home"
        type="card"
        title="Home"
        roles={{ defaultShipping: true }}
        name="Jane Doe"
        lines={["Lindenstraße 12", "10969 Berlin, Germany"]}
        phone="+49 30 1234567"
      />
      <CardAddress
        value="office"
        type="card"
        title="Office"
        roles={{ business: true }}
        name="Jane Doe"
        lines={["Keizersgracht 221", "1016 DV Amsterdam, Netherlands"]}
      />
      <CardAddress
        value="old"
        type="card"
        title="Old address"
        name="Jane Doe"
        lines={["Hauptstraße 1", "80331 Munich, Germany"]}
        disabled
      />
    </RadioCardGroup>
  );
}

/** Figma `State=Selected`: checkout selection as a radio group (arrow keys move and select). */
export const Selection: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    // Room for the corner badge, which sits outside the card.
    <div className="p-8">
      <AddressSelection />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole("radio", { name: "Home" });
    await expect(home).toHaveAttribute("aria-checked", "true");
    home.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Office" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.keyboard("{ArrowUp}");
  },
};
