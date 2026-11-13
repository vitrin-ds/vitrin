import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button/button";
import { Link } from "@/components/ui/link/link";
import { Text } from "@/components/ui/text/text";
import { formatMoney } from "@/lib/format/money";
import { CouponField } from "@/components/patterns/coupon-field/coupon-field";
import {
  MOCK_COUPONS,
  validateMockCoupon,
} from "@/components/patterns/coupon-field/coupon-field.fixtures";
import { FreeShippingProgress } from "./free-shipping-progress";
import { OrderSummary } from "./order-summary";
import { CART_TOTALS, SUMMARY_LINES, SUMMARY_TOTALS, eur } from "./order-summary.fixtures";
import { computeOrderTotals } from "./order-totals";

const meta = {
  title: "Patterns/Account & Cart & Checkout/Order Summary",
  component: OrderSummary,
  args: { totals: SUMMARY_TOTALS },
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: { disable: true },
    figma: {
      architecture:
        "Composition pattern: assembled from library components, no base layer of its own. Structures and dependencies below; the live versions are in the WEB pages (09.02 · 09.03).",
      do: [
        "Show every cost before the final step",
        "Show the discount as a separate negative line",
        "Keep the total visually strongest",
        "Repeat the primary action in a sticky bar on mobile",
      ],
      dont: [
        "Don't add surprise fees at the last step",
        "Don't hide VAT information",
        "Don't place secondary actions above the primary one",
        "Don't round prices differently in summary and lines",
      ],
    },
    docs: {
      story: { inline: false, iframeHeight: 560 },
      description: {
        component:
          "The price breakdown shown next to the bag and checkout: items, promo code, subtotal, discount, delivery, VAT and total, followed by the primary action and trust information. Sticky in the right column on desktop, below the content on mobile.",
      },
    },
  },
} satisfies Meta<typeof OrderSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

const INFO = (
  <Text variant="body-md" className="text-center">
    By placing your order you agree to our{" "}
    <Link href="/legal/terms" size="inline">
      Terms of Sale
    </Link>{" "}
    and confirm you&apos;ve read our{" "}
    <Link href="/legal/privacy" size="inline">
      Privacy Notice
    </Link>
    . You can cancel within 14 days of delivery.
  </Text>
);

/** Checkout aside (Figma 31510:5279): thumbnails, applied code, every cost, Pay, Info List. */
export const Checkout: Story = {
  args: {
    items: SUMMARY_LINES,
    editHref: "/cart",
    promo: (
      <CouponField
        applied={["WELCOME10"]}
        onApply={validateMockCoupon}
        onRemove={() => undefined}
      />
    ),
    action: (
      <Button size="lg" className="w-full">
        Pay {formatMoney(SUMMARY_TOTALS.total)}
      </Button>
    ),
    info: INFO,
  },
};

/** Cart page: shipping not known yet, Checkout as the action. */
export const Cart: Story = {
  args: {
    totals: CART_TOTALS,
    action: (
      <ButtonLink href="/checkout" size="lg" className="w-full">
        Checkout
      </ButtonLink>
    ),
  },
};

/** Figma WD.09.02.01 Cart › Order Detail: the free-shipping progress leads the card. */
export const CartWithFreeShipping: Story = {
  args: {
    totals: CART_TOTALS,
    lead: <FreeShippingProgress subtotal={eur(13800)} threshold={eur(15000)} />,
    action: (
      <ButtonLink href="/checkout" size="lg" className="w-full">
        Checkout
      </ButtonLink>
    ),
  },
};

/** Live: applying or removing a code updates the discount line and the total. */
export const WithCoupon: Story = {
  render: function Render(args) {
    const [applied, setApplied] = useState<string[]>([]);
    const totals = computeOrderTotals({
      lines: SUMMARY_LINES,
      discounts: applied.map((code) => {
        const coupon = MOCK_COUPONS[code as keyof typeof MOCK_COUPONS];
        return { code, label: coupon.label, type: "percent", percent: coupon.percent };
      }),
      shipping: eur(495),
      taxRate: 0.2,
    });
    return (
      <OrderSummary
        {...args}
        totals={totals}
        promo={
          <CouponField
            applied={applied}
            onApply={(code) => {
              const result = validateMockCoupon(code);
              if (result.ok) setApplied([code]);
              return result;
            }}
            onRemove={() => setApplied([])}
          />
        }
        action={
          <Button size="lg" className="w-full">
            Pay {formatMoney(totals.total)}
          </Button>
        }
      />
    );
  },
};

/** 375 (Figma 31510:6026): the same rows, full width. */
export const Mobile: Story = {
  ...Checkout,
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** 744. */
export const Tablet: Story = {
  ...Checkout,
  parameters: { viewport: { defaultViewport: "tablet" } },
};

/** The compact block of the Order Confirmation (Figma 31511:6058). */
export const Plain: Story = { args: { variant: "plain" } };
