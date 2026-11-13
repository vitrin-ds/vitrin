import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActionMenu } from "../action-menu/action-menu";
import { CardOrderHistoryProduct } from "./card-order-history-product";

// Neutral sample art (public/dev): the stories ship without product photography.
const PACKSHOT = { src: "/dev/sample-square.webp", alt: "", width: 1024, height: 1024 };

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "disabled";
  type: "card" | "list";
  showEstimatedDeliveryDate: boolean;
  estimatedDeliveryDateText: string;
  showChipOrderStatus: boolean;
  productNameText: string;
  showVariantName: boolean;
  variantNameText: string;
  priceText: number;
  showActions: boolean;
  showShipmentTracking: boolean;
  showCancelOrder: boolean;
  showReturn: boolean;
  showRateReview: boolean;
  showMoreIcon: boolean;
};

const meta = {
  title: "Patterns/Order Management/Order Detail/Order History Product",
  // The defaults of Figma's `Card.OrderHistory.Product` (State=Default, Type=Card) and its Base.
  // Price is in euro cents.
  args: {
    state: "default",
    type: "card",
    showEstimatedDeliveryDate: true,
    estimatedDeliveryDateText: "[Estimated Delivery Date]",
    showChipOrderStatus: true,
    productNameText: "[Product Name]",
    showVariantName: true,
    variantNameText: "[Variant Name]",
    priceText: 7000,
    showActions: true,
    showShipmentTracking: true,
    showCancelOrder: true,
    showReturn: true,
    showRateReview: true,
    showMoreIcon: true,
  },
  render: (a) => {
    const actions = a.showActions
      ? [
          a.showShipmentTracking && { label: "Shipment Tracking", href: "#tracking" },
          a.showCancelOrder && { label: "Cancel Order", href: "#cancel" },
          a.showReturn && { label: "Return", href: "#return" },
          a.showRateReview && { label: "Rate & Review", href: "#review" },
        ].filter((action): action is { label: string; href: string } => Boolean(action))
      : [];
    return (
      <div className="max-w-450">
        <CardOrderHistoryProduct
          type={a.type}
          disabled={a.state === "disabled"}
          delivery={a.showEstimatedDeliveryDate ? a.estimatedDeliveryDateText : undefined}
          status={a.showChipOrderStatus ? "in-delivery" : undefined}
          name={a.productNameText}
          href="/p/velvet-lip-colour"
          variant={a.showVariantName ? a.variantNameText : undefined}
          price={{ amount: a.priceText, currency: "EUR" }}
          image={PACKSHOT}
          actions={actions}
          menu={
            a.showActions && a.showMoreIcon ? (
              <ActionMenu
                label="More actions"
                items={[{ label: "Buy again", icon: "autorenew", onSelect: () => undefined }]}
              />
            ) : undefined
          }
        />
      </div>
    );
  },
  parameters: {
    // The Figma properties: State (Disabled; Hover and Active & Focus are CSS states), Type, then
    // the Base ones.
    controls: {
      include: [
        "state",
        "type",
        "showEstimatedDeliveryDate",
        "estimatedDeliveryDateText",
        "showChipOrderStatus",
        "productNameText",
        "showVariantName",
        "variantNameText",
        "priceText",
        "showActions",
        "showShipmentTracking",
        "showCancelOrder",
        "showReturn",
        "showRateReview",
        "showMoreIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Show actions contextually based on order status — Shipment Tracking when shipped, Rate & Review when delivered",
        "Show Estimated Delivery Date only while the order is in transit",
        "Use the Card type on order detail pages, List type when embedded in denser layouts",
        "Always display Product Name and Price — they are the primary identifiers",
      ],
      dont: [
        "Don't show Cancel Order and Return simultaneously — they apply to different order stages",
        "Don't show Rate & Review before delivery is confirmed",
        "Don't show Shipment Tracking before the order has been shipped",
        "Don't enable all actions at once — curate visibility based on the current order lifecycle stage",
      ],
    },
    docs: {
      description: {
        component:
          "A detailed product-level order card displaying delivery estimate, product details, variant info, pricing, and contextual actions like shipment tracking, cancellation, return, and review, used within order detail pages.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default or Disabled (a cancelled item). Hover and Active & Focus are CSS states.",
      control: "inline-radio",
      options: ["default", "disabled"],
      table: { type: { summary: '"default" | "disabled"' }, defaultValue: { summary: "default" } },
    },
    type: {
      description: "Figma `Type`: Card (radius 8, border all round) or List (bottom border).",
      control: "inline-radio",
      options: ["card", "list"],
      table: { type: { summary: '"card" | "list"' }, defaultValue: { summary: "card" } },
    },
    showEstimatedDeliveryDate: {
      description: "Figma `Show Estimated Delivery Date`. In code: pass `delivery`.",
      control: "boolean",
    },
    estimatedDeliveryDateText: {
      description: "Figma `Estimated Delivery Date Text`.",
      control: "text",
      if: { arg: "showEstimatedDeliveryDate" },
    },
    showChipOrderStatus: {
      description: "Figma `Show Chip [Order Status]`. In code: pass `status`.",
      control: "boolean",
    },
    productNameText: {
      description: "Figma `Product Name Text`. In code: `name`.",
      control: "text",
    },
    showVariantName: {
      description: "Figma `Show Variant Name`. In code: pass `variant`.",
      control: "boolean",
    },
    variantNameText: {
      description: "Figma `Variant Name Text`.",
      control: "text",
      if: { arg: "showVariantName" },
    },
    priceText: {
      description: "Figma `Price Text`. In code: `price`, a Money; here in cents.",
      control: "number",
    },
    showActions: {
      description: "Figma `Show Actions`: the actions row. In code: pass `actions` / `menu`.",
      control: "boolean",
    },
    showShipmentTracking: {
      description: "Figma `Show Shipment Tracking`.",
      control: "boolean",
      if: { arg: "showActions" },
    },
    showCancelOrder: {
      description: "Figma `Show Cancel Order`.",
      control: "boolean",
      if: { arg: "showActions" },
    },
    showReturn: {
      description: "Figma `Show Return`.",
      control: "boolean",
      if: { arg: "showActions" },
    },
    showRateReview: {
      description: "Figma `Show Rate & Review`.",
      control: "boolean",
      if: { arg: "showActions" },
    },
    showMoreIcon: {
      description: "Figma `Show More Icon`. In code: pass `menu` (an Action Menu).",
      control: "boolean",
      if: { arg: "showActions" },
    },
  },
} satisfies Meta<Args>;

export default meta;

/** The Figma defaults (State=Default, Type=Card). */
export const Default: StoryObj<Args> = {};

/** Figma State=Disabled: a cancelled item. */
export const Disabled: StoryObj<Args> = { args: { state: "disabled" } };

/** Figma Type=List. */
export const List: StoryObj<Args> = { args: { type: "list" } };
