import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroBanner, type HeroBannerProps, type HeroBannerSlide } from "./hero-banner";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  layout: HeroBannerProps["layout"];
  overlineText: string;
  titleText: string;
  copyText: string;
  showButton: boolean;
  showPagination: boolean;
  autoplayInterval?: number;
  priority?: boolean;
};

const WIDE = {
  src: "/dev/sample-wide.webp",
  alt: "Skincare bottles on a pink plinth",
  width: 1600,
  height: 900,
};
const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
/** Worst case for the Centered scrim: a plain white photo. */
const WHITE = { src: "/dev/sample-white.webp", alt: "White backdrop", width: 1024, height: 1024 };

const SLIDES: HeroBannerSlide[] = [
  {
    id: "balance",
    overline: "Feel The Balance",
    title: "Caring For Your Everyday Well-Being",
    copy: "With trusted, high-quality standards, we bring calm and confidence to your daily care routine.",
    image: WIDE,
    action: { label: "Shop Skincare", href: "/c/skincare" },
  },
  {
    id: "serums",
    overline: "New In",
    title: "Serums For Every Season",
    copy: "Lightweight formulas that layer under anything.",
    image: SQUARE,
    action: { label: "Shop Serums", href: "/c/skincare/serums" },
  },
  {
    id: "gifts",
    overline: "Gift Guide",
    title: "Thoughtful Gifts Under €30",
    image: WHITE,
    action: { label: "Shop Gifts", href: "/collections/gifts" },
  },
];

/** The slides after the first, which Figma shows as pagination. */
const MORE_SLIDES = SLIDES.slice(1);

const meta = {
  title: "Patterns/Promotions & Marketing/Hero Banner",
  // The defaults of Figma's `Hero Banner`.
  args: {
    layout: "split-left",
    overlineText: "Feel The Balance",
    titleText: "Caring For Your Everyday Well-Being",
    copyText:
      "With trusted, high-quality standards, we bring calm and confidence to your daily care routine.",
    showButton: true,
    showPagination: true,
  },
  render: ({ overlineText, titleText, copyText, showButton, showPagination, ...args }) => {
    const first: HeroBannerSlide = {
      id: "balance",
      overline: overlineText,
      title: titleText,
      copy: copyText,
      image: WIDE,
      action: showButton ? { label: "Shop Skincare", href: "/c/skincare" } : undefined,
    };
    // Pagination shows once the hero has more than one slide.
    return <HeroBanner {...args} slides={showPagination ? [first, ...MORE_SLIDES] : [first]} />;
  },
  parameters: {
    layout: "fullscreen",
    controls: {
      include: ["layout", "overlineText", "titleText", "copyText", "showButton", "showPagination"],
    },
    figma: {
      architecture:
        "This component uses a Single-Layer Architecture. It does not have a Base layer; properties are on the component set itself.",
      do: [
        "Lead with one clear headline and one primary CTA",
        "Keep text contrast ≥ 4.5:1 over the image",
        "Limit the carousel to 3–5 slides with visible pagination",
        "Use art direction to crop images per breakpoint",
      ],
      dont: [
        "Don't autoplay without a pause control",
        "Don't put long copy in the hero",
        "Don't use more than two buttons",
        "Don't rely on the image to carry the message",
      ],
    },
    docs: {
      description: {
        component:
          "The top-of-page campaign hero on the home and landing pages. Split layouts pair copy with an image and carousel pagination; Centered places copy over a full-bleed image with side arrows.",
      },
    },
  },
  argTypes: {
    layout: {
      description: "Figma `Layout`: Split (content left / right) or Centered over the image.",
      control: "inline-radio",
      options: ["split-left", "split-right", "centered"],
      table: {
        type: { summary: '"split-left" | "split-right" | "centered"' },
        defaultValue: { summary: "split-left" },
      },
    },
    overlineText: {
      description: "Figma `Overline Text`. In code: the slide's `overline`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Feel The Balance" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: the slide's `title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Caring For Your Everyday Well-Being" },
      },
    },
    copyText: {
      description: "Figma `Copy Text`. In code: the slide's `copy`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "With trusted, high-quality standards, we bring calm and confidence to your daily care routine.",
        },
      },
    },
    showButton: {
      description: "Figma `Show Button`. In code: the slide has an `action`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showPagination: {
      description:
        "Figma `Show Pagination`. In code: pagination shows once there is more than one slide.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Layout=Split Left`: copy left, image right, dots pagination. */
export const SplitLeft: Story = {};

/** Figma `Layout=Split Right`. */
export const SplitRight: Story = { args: { layout: "split-right" } };

/** Figma `Layout=Centered`: copy on a scrim over the image, round arrows. */
export const Centered: Story = { args: { layout: "centered" } };

/** Centered on a white photo: the scrim keeps the copy AA. */
export const CenteredOnWhite: Story = {
  parameters: { controls: { disable: true } },
  render: () => <HeroBanner layout="centered" slides={[SLIDES[2], SLIDES[0]]} />,
};

/** Opt-in rotation: Pause / Play, held on hover and focus, off for reduced motion. */
export const Autoplay: Story = { args: { autoplayInterval: 6000 } };

/** One slide: a plain hero without carousel controls (Figma `Show Pagination=false`). */
export const SingleSlide: Story = { args: { showPagination: false, priority: true } };
