import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ImageAsset } from "@/lib/api/types/catalog";
import { CardOrderHistory, type CardOrderHistoryProps } from "./card-order-history";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  disabled: boolean;
  type: CardOrderHistoryProps["type"];
  showOrderNoDate: boolean;
  orderNoText: string;
  orderDateText: string;
  addressTitleText: string;
  showChipOrderStatus: boolean;
  showProductList: boolean;
  showImg2: boolean;
  showImg3: boolean;
  showImg4: boolean;
  showImg5: boolean;
  showProductCount: boolean;
  productCountText: string;
  showBottomSection: boolean;
  showTotalPrice: boolean;
  totalPriceText: string;
  showRightIcon: boolean;
  rightIcon: IconName;
};

const image = (alt: string): ImageAsset => ({
  src: "/brand/add-image.svg",
  alt,
  width: 1024,
  height: 1024,
});

const PRODUCTS = [
  { name: "Glow Serum", image: image("Glow Serum") },
  { name: "Calm Cleansing Gel", image: image("Calm Cleansing Gel") },
  { name: "Velvet Lip Colour, Rosewood", image: image("Velvet Lip Colour, Rosewood") },
  { name: "Velvet Lip Colour, Cinnamon", image: image("Velvet Lip Colour, Cinnamon") },
  { name: "Night Repair Cream" },
];

/** Maps the Figma properties to the code props: a slot shows when it is given. */
function orderProps(args: Args): CardOrderHistoryProps {
  const date = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(args.orderDateText.trim());
  const thumbs = [true, args.showImg2, args.showImg3, args.showImg4, args.showImg5];
  const products = args.showProductList ? PRODUCTS.filter((_, i) => thumbs[i]) : [];
  const extra = Number.parseInt(args.productCountText.replace(/\D/g, ""), 10);
  const amount = Number.parseFloat(args.totalPriceText.replace(/[^\d.]/g, ""));
  return {
    href: "/account/orders/o-1007",
    type: args.type,
    disabled: args.disabled,
    orderNumber: args.showOrderNoDate ? args.orderNoText.replace(/^\s*#/, "") : undefined,
    rightIcon: args.showRightIcon ? args.rightIcon : null,
    date: date
      ? `${date[3]}-${date[2].padStart(2, "0")}-${date[1].padStart(2, "0")}`
      : "2026-10-12",
    timeZone: "UTC",
    title: args.addressTitleText,
    products,
    productCount:
      args.showProductCount && !Number.isNaN(extra) ? products.length + extra : products.length,
    total:
      args.showBottomSection && args.showTotalPrice && !Number.isNaN(amount)
        ? { amount: Math.round(amount * 100), currency: "EUR" }
        : undefined,
    status: args.showChipOrderStatus ? "delivered" : undefined,
  };
}

const meta = {
  title: "Patterns/Order Management/Order History/Order History Card",
  // The defaults of Figma's `Card.OrderHistory` (Type=List Item) and `.Base.Card.OrderHistory`.
  args: {
    disabled: false,
    type: "list",
    showOrderNoDate: true,
    orderNoText: "#TH-48211",
    orderDateText: "12.10.2026",
    addressTitleText: "[Shipping Address]",
    showChipOrderStatus: true,
    showProductList: true,
    showImg2: true,
    showImg3: true,
    showImg4: true,
    showImg5: true,
    showProductCount: true,
    productCountText: "+ 2 Products",
    showBottomSection: true,
    showTotalPrice: true,
    totalPriceText: "€412",
    showRightIcon: true,
    rightIcon: "keyboard_arrow_right",
  },
  render: (args) => <CardOrderHistory {...orderProps(args)} />,
  parameters: {
    controls: {
      include: [
        "disabled",
        "type",
        "showOrderNoDate",
        "orderNoText",
        "orderDateText",
        "addressTitleText",
        "showChipOrderStatus",
        "showProductList",
        "showImg2",
        "showImg3",
        "showImg4",
        "showImg5",
        "showProductCount",
        "productCountText",
        "showBottomSection",
        "showTotalPrice",
        "totalPriceText",
        "showRightIcon",
        "rightIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Show product thumbnails to give users a quick visual reminder of what they ordered",
        "Hide extra img slots (img-3, img-4, img-5) when the order has fewer products — show only what's needed",
        "Use Product Count to indicate remaining items when the order exceeds the visible thumbnail slots",
        'Use Chip [Order Status] to communicate delivery states like "Shipped", "Delivered", "Processing"',
        "Use as a direct replacement for Card.OrderHistory when the order list is empty",
        "Keep Label Text friendly and encouraging — guide the user toward their first purchase",
        'Use the Button to direct users to the shop or product discovery pages (e.g., "Start Shopping")',
        "Maintain consistent placement within the order history page layout",
      ],
      dont: [
        "Don't show empty thumbnail slots — hide unused img properties to avoid placeholder gaps",
        "Don't hide Order No & Date — it's the primary identifier for the user to locate their order",
        "Don't use the Card type inside already-contained surfaces like modals — use List Item in those cases",
        "Don't show Total Price without the status chip — users need both price and status context together",
        "Don't hide both Label and Button — the empty state needs at least one guiding element",
        "Don't use generic error language — this isn't an error, it's an opportunity to convert",
        "Don't show this card alongside populated order cards — it replaces the list entirely",
        "Don't use a vague CTA — be specific about where the button leads",
      ],
    },
    docs: {
      description: {
        component:
          "An order summary card displaying order metadata, product image thumbnails, pricing, and delivery status, used in order history lists and account order management sections. Card.OrderHistory.Empty is the empty state card shown when the user has no order history.",
      },
    },
  },
  argTypes: {
    disabled: {
      description: "Figma `State=Disabled`. Hover & Tap and Focus are CSS states.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    type: {
      description: "Figma `Type`: List Item for stacked rows, Card for a standalone surface.",
      control: "inline-radio",
      options: ["list", "card"],
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    showOrderNoDate: {
      description: "Figma `Show Order No & Date`. In code: pass `orderNumber` (and `date`).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: `rightIcon`; `null` hides it.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_right" } },
    },
    orderNoText: {
      description: 'Figma `Order No Text`. In code: `orderNumber`, without the "#".',
      control: "text",
      if: { arg: "showOrderNoDate" },
      table: { type: { summary: "string" }, defaultValue: { summary: "#TH-48211" } },
    },
    orderDateText: {
      description: "Figma `Order Date Text`: DD.MM.YYYY. In code: `date`, ISO 8601.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "12.10.2026" } },
    },
    addressTitleText: {
      description: "Figma `Address & Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Shipping Address]" } },
    },
    showChipOrderStatus: {
      description: "Figma `Show Chip [Order Status]`. In code: pass `status`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showProductList: {
      description: "Figma `Show Product List`. In code: pass `products`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showImg2: {
      description: "Figma `Show img-2`. In code: the second entry of `products`.",
      control: "boolean",
      if: { arg: "showProductList" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showImg3: {
      description: "Figma `Show img-3`. In code: the third entry of `products`.",
      control: "boolean",
      if: { arg: "showProductList" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showImg4: {
      description: "Figma `Show img-4`. In code: the fourth entry of `products`.",
      control: "boolean",
      if: { arg: "showProductList" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showImg5: {
      description: "Figma `Show img-5`. In code: the fifth entry of `products`.",
      control: "boolean",
      if: { arg: "showProductList" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showProductCount: {
      description:
        "Figma `Show Product Count`. In code: `productCount` higher than the shown `products`.",
      control: "boolean",
      if: { arg: "showProductList" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    productCountText: {
      description:
        "Figma `Product Count Text`. In code: `productCount` (the digits plus the shown thumbnails).",
      control: "text",
      if: { arg: "showProductCount" },
      table: { type: { summary: "string" }, defaultValue: { summary: "+ 2 Products" } },
    },
    showBottomSection: {
      description: "Figma `Show Bottom Section`. In code: pass `total`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTotalPrice: {
      description: "Figma `Show Total Price`. In code: pass `total`.",
      control: "boolean",
      if: { arg: "showBottomSection" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    totalPriceText: {
      description: "Figma `Total Price Text`. In code: `total`, in minor units.",
      control: "text",
      if: { arg: "showTotalPrice" },
      table: { type: { summary: "string" }, defaultValue: { summary: "\u20ac412" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Card.OrderHistory` (List Item), all slots. Hover and focus are CSS states. */
export const Default: Story = {};

/** Card type, a short order without the product count, a cancelled order and Disabled. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-16">
      <CardOrderHistory {...orderProps(args)} type="card" />
      <CardOrderHistory
        {...orderProps(args)}
        type="card"
        orderNumber="TH-48196"
        products={PRODUCTS.slice(0, 1)}
        productCount={1}
        total={{ amount: 2455, currency: "EUR" }}
        status="processing"
      />
      <CardOrderHistory
        {...orderProps(args)}
        type="card"
        orderNumber="TH-47518"
        products={PRODUCTS.slice(4)}
        productCount={1}
        status="cancelled"
      />
      <CardOrderHistory {...orderProps(args)} type="card" disabled />
    </div>
  ),
};

/** The order list as stacked List Items. */
export const List: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ul>
      {(["in-delivery", "processing", "delivered"] as const).map((status, index) => (
        <li key={status}>
          <CardOrderHistory
            {...orderProps(args)}
            href={`/account/orders/${index}`}
            orderNumber={`TH-4821${index}`}
            status={status}
          />
        </li>
      ))}
    </ul>
  ),
};
