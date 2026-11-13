import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardRewards, type CardRewardsProps } from "./card-rewards";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: CardRewardsProps["state"];
  showProgress: boolean;
  topIcon: IconName;
  labelText: string;
  valueText: string;
  subContextText: string;
  identifierText: string;
  metaText: string;
};

/** The gift card of Figma WD.03.P002 Rewards, as real data. */
const GIFT: CardRewardsProps = {
  icon: "redeem",
  label: { text: "Default", color: "info", icon: "circle" },
  overline: "Balance",
  value: "€42.50",
  caption: "of €50",
  progress: { value: 4250, max: 5000, label: "Balance left", valueText: "€42.50 of €50" },
  title: "Birthday from Mum",
  details: "Gift card · •••• 7K2M",
};
const COUPON: CardRewardsProps = {
  icon: "sell",
  label: { text: "Ready", color: "success", icon: "check" },
  overline: "Save",
  value: "-€25",
  caption: "off orders over €100",
  title: "SUMMER25",
  details: "Coupon · Single use",
};
const EXPIRING: CardRewardsProps = {
  state: "warning",
  icon: "sell",
  label: { text: "13 days", color: "warning", icon: "schedule" },
  overline: "Save",
  value: "-25%",
  caption: "make-up · min €40",
  title: "WELCOME20",
  details: "Coupon · Expires 14 Nov",
};
const PROMO: CardRewardsProps = {
  icon: "redeem",
  label: { text: "Promo", color: "neutral", icon: "circle" },
  overline: "Balance",
  value: "€45",
  caption: "of €75",
  progress: { value: 4500, max: 7500, label: "Balance left", valueText: "€45 of €75" },
  title: "Welcome credit",
  details: "Gift card · •••• 3B9N",
};

/** Maps the Figma properties to the code props: a slot shows when it is given. */
function rewardsProps(args: Args): CardRewardsProps {
  return {
    state: args.state,
    icon: args.topIcon,
    label: GIFT.label,
    overline: args.labelText,
    value: args.valueText,
    caption: args.subContextText,
    progress: args.showProgress ? GIFT.progress : undefined,
    title: args.identifierText,
    details: args.metaText,
  };
}

const meta = {
  title: "Patterns/Account & Cart & Checkout/Gift & Rewards/Rewards Card",
  // The defaults of Figma's `Card.Rewards` and `.Base.Card.Rewards`.
  args: {
    state: "default",
    showProgress: true,
    topIcon: "redeem",
    labelText: "BALANCE",
    valueText: "[Value]",
    subContextText: "[Sub-context]",
    identifierText: "[Identifier]",
    metaText: "[Meta]",
  },
  render: (args) => <CardRewards {...rewardsProps(args)} />,
  parameters: {
    controls: {
      include: [
        "state",
        "showProgress",
        "topIcon",
        "labelText",
        "valueText",
        "subContextText",
        "identifierText",
        "metaText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use a short, all-caps Label Text (BALANCE, POINTS, TIER) for instant scanability",
        'Pair Value Text with Sub-context so the number is never ambiguous (e.g., "pts", "TL")',
        "Hide Progress when no tier system applies — don't show an empty bar",
        'Keep Meta Text actionable or time-bound (e.g., "Expires Dec 31", "120 pts to Gold")',
        "Use Disabled state when the program is inactive or the balance is unavailable",
      ],
      dont: [
        "Don't use this card for non-loyalty information — keep it dedicated to rewards data",
        'Don\'t leave placeholder text ("[Value]", "[Meta]") in production',
        "Don't show the redeem action when balance is zero or below the redemption threshold",
        "Don't stack multiple rewards cards in the same view — surface one program at a time",
      ],
    },
    docs: {
      description: {
        component:
          "A loyalty rewards card displaying point balance, progress toward the next tier, member identifiers, and a redeem action, typically surfaced in account dashboards, order summaries, and checkout flows to expose loyalty program status.",
      },
    },
  },
  argTypes: {
    state: {
      description: "Figma `State`: Default · Warning · Disabled. Hover & Tap is a CSS state.",
      control: "inline-radio",
      options: ["default", "warning", "disabled"],
      table: {
        type: { summary: '"default" | "warning" | "disabled"' },
        defaultValue: { summary: "default" },
      },
    },
    showProgress: {
      description: "Figma `Show Progress`. In code: pass `progress`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    topIcon: {
      description: "Figma `Top Icon`: a Material Symbols name. In code: `icon`.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "redeem" } },
    },
    labelText: {
      description: "Figma `Label Text`. In code: `overline`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "BALANCE" } },
    },
    valueText: {
      description: "Figma `Value Text`. In code: `value`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Value]" } },
    },
    subContextText: {
      description: "Figma `Sub-context Text`. In code: `caption`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Sub-context]" } },
    },
    identifierText: {
      description: "Figma `Identifier Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Identifier]" } },
    },
    metaText: {
      description: "Figma `Meta Text`. In code: `details`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "[Meta]" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults: placeholder text, with the progress bar. */
export const Default: Story = {};

/** Figma WD.03.P002 Rewards, first card: the default gift card with what's left of it. */
export const GiftCard: Story = {
  args: {
    labelText: "Balance",
    valueText: GIFT.value,
    subContextText: GIFT.caption,
    identifierText: GIFT.title,
    metaText: String(GIFT.details),
  },
};

/** A coupon ready to use (Label Success). */
export const Coupon: Story = {
  args: {
    topIcon: "sell",
    showProgress: false,
    labelText: "Save",
    valueText: COUPON.value,
    subContextText: COUPON.caption,
    identifierText: COUPON.title,
    metaText: String(COUPON.details),
  },
};

/** Figma State=Warning: a coupon about to expire (border-warning, text-warning). */
export const ExpiringSoon: Story = {
  args: {
    state: "warning",
    topIcon: "sell",
    showProgress: false,
    labelText: "Save",
    valueText: EXPIRING.value,
    subContextText: EXPIRING.caption,
    identifierText: EXPIRING.title,
    metaText: String(EXPIRING.details),
  },
};

/** The wallet as on the account overview: a row of 180-wide cards. */
export const Wallet: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="flex gap-8">
      {[GIFT, COUPON, EXPIRING, PROMO].map((card) => (
        <li key={card.title} className="w-180 shrink-0">
          <CardRewards {...card} />
        </li>
      ))}
    </ul>
  ),
};

/** Figma State=Disabled: surface-disabled and border-disabled; the text stays. */
export const Disabled: Story = { args: { state: "disabled" } };
