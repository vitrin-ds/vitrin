import type { ImageAsset, Money } from "./catalog";
import type { Address, PaymentMethod } from "./customer";

/** Why a customer cancels an order (Figma 03.01.03 "Why are you cancelling?"). */
export type CancelReason =
  | "change-address"
  | "change-payment"
  | "change-items"
  | "too-slow"
  | "better-price"
  | "by-mistake"
  | "other";

/**
 * Cancel Order's answer: cancelled (with the updated order), or not, because the order entered
 * shipping while the request was processed (Figma 03.01.03 P0O3 "We couldn't cancel your order").
 */
export type CancelOrderOutcome =
  | { status: "cancelled"; order: Order }
  | { status: "partially-cancelled"; order: Order; cancelledLineIds: string[] }
  | { status: "not-cancellable"; order: Order };

/** Why an item comes back (Figma 03.01.05 Reason for return). */
export type ReturnReason =
  | "doesnt-fit"
  | "not-as-described"
  | "quality"
  | "damaged"
  | "wrong-item"
  | "changed-mind"
  | "better-price"
  | "arrived-late"
  | "no-longer-needed"
  | "other";

/** How a return is settled (03.01.05 Resolution). */
export type ReturnResolution = "refund" | "exchange" | "store-credit";

/** How it travels back (03.01.05 Return method). */
export type ReturnMethod = "drop-off" | "pickup" | "store";

export interface ReturnItemInput {
  lineId: string;
  reason: ReturnReason;
  note?: string;
  /** Photos added to the reason (the mock keeps the count, not the files). */
  photoCount?: number;
}

export interface ReturnInput {
  items: ReturnItemInput[];
  resolution: ReturnResolution;
  method: ReturnMethod;
}

/** Where a return has got to (Figma 03.01.06 Status). */
export type ReturnStage = "label-created" | "in-transit" | "inspection" | "settled";

/** The parcel on its way back. */
export interface ReturnParcel {
  carrier: string;
  trackingNumber: string;
  /** The carrier's own tracking page. */
  trackingUrl: string;
  /** The latest scan's place, e.g. "Parcel Express Hub · London". */
  lastSeen: string;
}

/** A return set up for some lines of an order. */
export interface OrderReturn extends ReturnInput {
  /** The customer-facing id, e.g. "RMA-92847-TH". */
  id: string;
  orderId: string;
  /** ISO 8601. */
  createdAt: string;
  /** The value of the returned lines. */
  total: Money;
  stage: ReturnStage;
  /** ISO 8601: the latest change of stage or scan. */
  updatedAt: string;
  /** ISO 8601: handed over; the label has been used. */
  droppedOffAt?: string;
  /** Where it was handed over. */
  droppedOffPlace?: string;
  /** ISO 8601: expected at the warehouse. */
  expectedAt?: string;
  parcel?: ReturnParcel;
}

/**
 * Where an order is in fulfilment: the five OrderTracking stages, in order (Figma
 * `.Asset.OrderTracking.Status`), plus the two ends that leave the flow.
 */
export type OrderStage = "confirmed" | "processing" | "shipped" | "in-delivery" | "delivered";
export type OrderStatus = OrderStage | "cancelled" | "returned";

export interface OrderLine {
  id: string;
  productId: string;
  variantId: string;
  /** Product page slug at the time of the order (orders placed through checkout). */
  slug?: string;
  /** Product name at the time of the order, so history survives catalogue changes. */
  name: string;
  /** The variant's option values, e.g. "Rosewood" or "30 ml" (Card.OrderHistory.Product). */
  variantTitle?: string;
  /** The card thumbnail; missing when the product had no image. */
  image?: ImageAsset;
  quantity: number;
  unitPrice: Money;
  /** unitPrice × quantity. */
  lineTotal: Money;
  /** Packed and moving to shipping: it can no longer be cancelled (03.01.04 "Already Prepared"). */
  prepared?: boolean;
  /** Cancelled on its own (03.01.04 Partial Cancel); the rest of the order goes on. */
  cancelled?: boolean;
  /** Why it can't be returned (03.01.05 "Not Eligible"). */
  returnBlock?: ReturnBlock;
  /** The return it is part of (03.01.05), once one is set up. */
  returnId?: string;
}

/** Final sale and custom-made items can't be returned. */
export type ReturnBlock = "final-sale" | "custom-made";

/** One step of the order lifecycle log (Figma `Order Timeline`). */
export interface OrderEvent {
  id: string;
  /** "Order placed", "Payment received" … */
  title: string;
  /** ISO 8601. */
  occurredAt: string;
}

/** One carrier scan (Figma `Shipment (Cargo) Tracking`). */
export interface ShipmentEvent {
  id: string;
  /** "Out for delivery" … */
  title: string;
  /** ISO 8601. */
  occurredAt: string;
  /** Depot or town, e.g. "Camden Town Delivery Office · London". */
  location?: string;
}

export interface Shipment {
  carrier: string;
  trackingNumber: string;
  /** Oldest first. */
  events: ShipmentEvent[];
}

export interface Order {
  id: string;
  /** The customer-facing order number. */
  number: string;
  /** ISO 8601. */
  placedAt: string;
  status: OrderStatus;
  /** A delivery problem at the current stage (Figma StatusIcon `Failed`). */
  issue?: { message: string };
  lines: OrderLine[];
  shippingAddress: Address;
  subtotal: Money;
  discounts: Money;
  shipping: Money;
  total: Money;
  /** Oldest first. */
  timeline: OrderEvent[];
  /** Set once the parcel is handed to the carrier. */
  shipment?: Shipment;
  /** Where the confirmation e-mail went (orders placed through checkout). */
  email?: string;
  /** Defaults to the shipping address. */
  billingAddress?: Address;
  /** How it was paid: a card keeps its network and last four digits only. */
  payment?: PaymentMethod;
  /** The delivery option chosen at checkout. */
  shippingMethod?: { id: string; name: string };
  /** Promo codes applied to the order. */
  discountCodes?: string[];
  /** Last day of the return window (ISO 8601); default: 30 days after delivery. */
  returnBy?: string;
  /** Returns set up on this order, newest first (03.01.06). */
  returns?: OrderReturn[];
}
