import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardCategoryCircle } from "./card-category-circle";

/** Figma's text properties. Storybook only. */
type Args = {
  titleText: string;
  showTitle: boolean;
};

const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
/** A cut-out on transparent: the card's fill shows behind it. */
const PACKSHOT = { src: "/dev/sample-white.webp", alt: "", width: 1024, height: 1024 };
const BASE = { title: "Serums", href: "/c/skincare/serums", image: SQUARE };

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Circle",
  // The defaults of Figma's `.Base.Card.Category.Circle`.
  args: { titleText: "Title Text", showTitle: true },
  render: ({ titleText, showTitle }) => (
    <CardCategoryCircle {...BASE} title={titleText} showTitle={showTitle} />
  ),
  parameters: {
    // The Figma properties of Card.Category.Circle: Title Text. State (Default, Hover & Tap) is a CSS
    // state.
    controls: { include: ["titleText", "showTitle"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        'Use for brand logo showcases in mega menus and "Shop by Brand" sections',
        "Use for circular category navigation in mobile homepages and carousels",
        "Keep Title Text to one or two words — the circular format demands brevity",
        "Hide Title when the image (e.g., a brand logo) is self-explanatory",
      ],
      dont: [
        "Don't use for product cards — circles are reserved for category and brand navigation",
        "Don't mix with square or horizontal category cards in the same row",
        "Don't use long titles — they break the visual balance below the circle",
        "Don't use without meaningful imagery — the circular crop requires intentional visual content",
      ],
    },
    docs: {
      description: {
        component:
          "A circular category card displaying an image with an optional title label below — used for brand showcases, circular category grids, and visually distinctive navigation elements. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    showTitle: {
      description:
        "Figma `Show Title`. In code: `showTitle`. Off keeps the name for screen readers.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description:
        "Figma `Title Text`. In code: `title`. `Show Title` is not a control: the title names the link.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Title Text" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Figma `Card.Category.Circle`: brand showcases and circular category navigation. */
export const Circle: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="flex flex-wrap gap-16">
      <li>
        <CardCategoryCircle {...BASE} />
      </li>
      <li>
        <CardCategoryCircle {...BASE} title="Hair care" />
      </li>
      <li>
        <CardCategoryCircle {...BASE} title="Fragrance" image={undefined} />
      </li>
    </ul>
  ),
};

/** `media="packshot"` (Home): a cut-out product on surface-secondary. */
export const CirclePackshot: Story = {
  parameters: { controls: { disable: true } },
  render: () => <CardCategoryCircle {...BASE} image={PACKSHOT} media="packshot" />,
};

/** `media="logo"` (Mega Menu Trending Brands): the brand wordmark, uncropped, on white. */
export const CircleLogo: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="flex flex-wrap gap-16">
      {["velora", "nuve", "marrel"].map((slug) => (
        <li key={slug}>
          <CardCategoryCircle
            title={slug === "nuve" ? "Nuvé" : slug[0]!.toUpperCase() + slug.slice(1)}
            href={`/collections/${slug}`}
            image={{ src: `/mock/brands/${slug}.svg`, alt: slug, width: 80, height: 32 }}
            media="logo"
          />
        </li>
      ))}
    </ul>
  ),
};
