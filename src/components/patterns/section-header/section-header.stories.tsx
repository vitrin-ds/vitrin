import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeader } from "./section-header";

const meta = {
  title: "Patterns/Other/Section Header",
  component: SectionHeader,
  args: {
    id: "section-title",
    title: "New Arrivals",
    description:
      "Refresh your routine with the newest drops. Trend-driven formulas and exciting innovations are waiting to be explored. Be the first to try what’s new.",
    action: { label: "View All", href: "/collections/new-arrivals" },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Home New Arrivals Title (30198:193330): title, body (max 666 wide) and a View All link. */
export const Default: Story = {};

/** Trending Products / Blog: title and action, no body. */
export const WithoutDescription: Story = {
  args: {
    title: "Trending Products",
    description: undefined,
    action: { label: "Best Sellers", href: "/collections/best-sellers" },
  },
};

/** Your Daily Edit: title and body, no action. */
export const WithoutAction: Story = {
  args: {
    title: "Your Daily Edit",
    description:
      "A curated collection made to simplify decisions and elevate everyday moments effortlessly.",
    action: undefined,
  },
};

/** Seasonal Categories / Discover Our Brands: the title alone. */
export const TitleOnly: Story = {
  args: { title: "Discover Our Brands", description: undefined, action: undefined },
};

/** The action as an accent, underlined link with an icon after it. */
export const ActionWithIcon: Story = {
  args: { action: { label: "View All", href: "#all", rightIcon: "arrow_forward" } },
};

/** Mobile: the action stays on the right, bottom-aligned with the wrapped body. */
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };

/** Size Medium (content pages: Help Centre, Legal Centre, About): headline-small. */
export const Medium: Story = {
  args: {
    size: "md",
    title: "Everything you agree to, in one place",
    description:
      "These documents explain how we handle your data, how buying from us works and what you can expect from us.",
    action: undefined,
  },
};

/** Size Small (My Account WD.03.P002 Title): title-medium with a Small "View All" link. */
export const Small: Story = {
  args: {
    size: "sm",
    title: "My Orders (4)",
    description: undefined,
    action: { label: "View All", href: "/account/orders" },
  },
};
