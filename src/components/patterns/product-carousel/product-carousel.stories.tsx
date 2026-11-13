import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CardCategoryVerticalFeatured } from "@/components/ui/card-category/card-category-vertical-featured";
import { CardProductVertical } from "@/components/ui/card-product/card-product-vertical";
import { CAROUSEL_PRODUCTS, DAILY_EDIT_CATEGORY } from "./product-carousel.fixtures";
import { ProductCarousel } from "./product-carousel";

const cards = (count: number) =>
  CAROUSEL_PRODUCTS.slice(0, count).map(({ id, ...product }) => (
    <CardProductVertical key={id} {...product} className="w-full" />
  ));

const meta = {
  title: "Patterns/Discovery/Product Carousel",
  component: ProductCarousel,
  args: {
    title: "New Arrivals",
    description:
      "Refresh your routine with the newest drops. Trend-driven formulas and exciting innovations are waiting to be explored. Be the first to try what’s new.",
    action: { label: "View All", href: "/collections/new-arrivals" },
    children: cards(10),
  },
} satisfies Meta<typeof ProductCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Home New Arrivals (30198:193329): 10 cards run past the edge, the Slider Pagination Bar shows. */
export const Default: Story = {};

/** Fewer cards than fit: nothing overflows, so no pagination bar. */
export const Few: Story = { args: { children: cards(3) } };

/** Home Your Daily Edit (30198:193542): a featured category card first, no `Options` action. */
export const FeaturedFirst: Story = {
  args: {
    title: "Your Daily Edit",
    description:
      "A curated collection made to simplify decisions and elevate everyday moments effortlessly.",
    action: undefined,
    children: [
      <CardCategoryVerticalFeatured
        key={DAILY_EDIT_CATEGORY.id}
        className="w-full"
        overline={DAILY_EDIT_CATEGORY.overline}
        title={DAILY_EDIT_CATEGORY.title}
        href={DAILY_EDIT_CATEGORY.href}
        image={DAILY_EDIT_CATEGORY.image}
        cta={DAILY_EDIT_CATEGORY.cta}
      />,
      ...cards(6),
    ],
  },
};

/** Mobile: the rail is swiped (scroll-snap); the bar tracks the scroll position. */
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };

/** Tablet width: the arrows and the Slider Pagination Bar. */
export const Tablet: Story = { parameters: { viewport: { defaultViewport: "tablet" } } };

/** 05 Intermediary "Best Sellers In Make Up" (31100:186493): the Medium Section Header. */
export const MediumHeader: Story = {
  args: { title: "Best Sellers In Make Up", description: undefined, headerSize: "md" },
};

/** The arrows work from the keyboard: Next moves one card, Previous is enabled once moved. */
export const KeyboardArrows: Story = {
  // End state depends on scroll timing; behaviour is covered by the story test, not a snapshot.
  tags: ["no-visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "New Arrivals" });
    const next = await within(region).findByRole("button", { name: "Scroll forward" });
    const previous = within(region).getByRole("button", { name: "Scroll back" });
    const progress = within(region).getByRole("progressbar", { name: "Carousel position" });
    await expect(previous).toBeDisabled();
    await expect(progress).toHaveAttribute("aria-valuenow", "1");

    next.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(progress).toHaveAttribute("aria-valuenow", "2"));
    await expect(previous).toBeEnabled();

    previous.focus();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(progress).toHaveAttribute("aria-valuenow", "1"));
    await waitFor(() => expect(previous).toBeDisabled());
  },
};
