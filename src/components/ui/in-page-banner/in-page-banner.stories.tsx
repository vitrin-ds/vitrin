import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CarouselPagination } from "../hero-banner/carousel-pagination";
import {
  BannerHorizontal,
  BannerImageCentered,
  BannerImageBackgroundCompact,
} from "./banner-image";
import { BannerText } from "./banner-text";
import { BannerWide, type BannerWideProps } from "./banner-wide";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  contentDirection: BannerWideProps["contentDirection"];
  showOverline: boolean;
  overlineText: string;
  titleText: string;
  showCopy: boolean;
  copyText: string;
  showButton: boolean;
  showPagination: boolean;
  showCardProductVertical: boolean;
};

const WIDE = {
  src: "/dev/sample-wide.webp",
  alt: "Skincare bottles on a bathroom shelf",
  width: 1600,
  height: 900,
};
const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
/** Worst case for the scrim: a plain white photo. */
const WHITE = { src: "/dev/sample-white.webp", alt: "White backdrop", width: 1024, height: 1024 };

const COPY = {
  overline: "Feel The Balance",
  title: "Caring For Your Everyday Well-Being",
  copy: "With trusted, high-quality standards, we bring calm and confidence to your daily care routine.",
  action: { label: "Shop Skincare", href: "/c/skincare" },
};

const PRODUCT = (
  <article className="flex h-382 flex-col justify-end gap-4 rounded-8 bg-surface-raised p-12 shadow-base">
    <p className="text-body-sm text-text-accent">Face serum</p>
    <p className="text-title-sm text-text-primary">Aureline Glow Activating Serum</p>
  </article>
);

const meta = {
  title: "Patterns/Promotions & Marketing/In Page Banners",
  // The defaults of Figma's `Banner [Wide]` (Content Direction=Left, Breakpoint=Desktop).
  args: {
    contentDirection: "left",
    showOverline: true,
    overlineText: COPY.overline,
    titleText: COPY.title,
    showCopy: true,
    copyText: COPY.copy,
    showButton: true,
    showPagination: true,
    showCardProductVertical: true,
  },
  render: (args) => (
    <BannerWide
      contentDirection={args.contentDirection}
      overline={args.showOverline ? args.overlineText : undefined}
      title={args.titleText}
      copy={args.showCopy ? args.copyText : undefined}
      image={WIDE}
      action={args.showButton ? COPY.action : undefined}
      product={args.showCardProductVertical ? PRODUCT : undefined}
      pagination={
        args.showPagination ? (
          <CarouselPagination
            variant="fraction"
            index={0}
            count={2}
            onPrevious={fn()}
            onNext={fn()}
          />
        ) : undefined
      }
    />
  ),
  parameters: {
    controls: {
      include: [
        "contentDirection",
        "showOverline",
        "overlineText",
        "titleText",
        "showCopy",
        "copyText",
        "showButton",
        "showPagination",
        "showCardProductVertical",
      ],
    },
    figma: {
      architecture:
        "This component uses a Single-Layer Architecture. It does not have a Base layer; properties are on the component set itself.",
      do: [
        "Use one primary message and one call to action per banner",
        "Use Banner [Wide] for campaign sections, compact types inside grids",
        "Keep copy short — overline, title and one line of copy",
        "Provide meaningful alt text for banner images",
      ],
      dont: [
        "Don't stack several wide banners in a row",
        "Don't put essential information only in the image",
        "Don't use more than one sticker per banner",
        "Don't autoplay banner carousels without a pause control",
      ],
    },
    docs: {
      description: {
        component:
          "Promotional banners placed inside page content: campaign bands on the home page, promo tiles in product listings and editorial pages. Each type has a Default (desktop) and a Mobile breakpoint.",
      },
    },
  },
  argTypes: {
    contentDirection: {
      description:
        "Figma `Content Direction` of Banner [Wide]: copy on the left or right of the image. Breakpoint is responsive CSS in code.",
      control: "inline-radio",
      options: ["left", "right"],
      table: { type: { summary: '"left" | "right"' }, defaultValue: { summary: "left" } },
    },
    showOverline: {
      description: "Figma `Show Overline`. In code: pass `overline`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    overlineText: {
      description: "Figma `Overline Text`. In code: `overline`.",
      control: "text",
      if: { arg: "showOverline" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Feel The Balance" } },
    },
    titleText: {
      description:
        "Figma `Title Text`. In code: `title`. `Show Title` is not a control: code requires the title.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Caring For Your Everyday Well-Being" },
      },
    },
    showCopy: {
      description: "Figma `Show Copy`. In code: pass `copy`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    copyText: {
      description: "Figma `Copy Text`. In code: `copy`.",
      control: "text",
      if: { arg: "showCopy" },
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "With trusted, high-quality standards, we bring calm and confidence to your daily care routine.",
        },
      },
    },
    showButton: {
      description: "Figma `Show Button`. In code: pass `action`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showPagination: {
      description: "Figma `Show Pagination`. In code: pass `pagination`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showCardProductVertical: {
      description: "Figma `Show Card.Product.Vertical`. In code: pass `product` (desktop only).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Banner [Wide]`, Content Direction Left, with the product card and fraction pagination. */
export const Wide: Story = {};

/** Content Direction Right. */
export const WideRight: Story = {
  args: { contentDirection: "right", showPagination: false },
};

/** Figma `Banner [Text]`: a tinted band, Button Filled Medium. */
export const Text: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <BannerText
      overline="Members only"
      title="20% off all serums"
      description="Until Sunday, in store and online."
      action={{ label: "Shop Now", href: "/c/skincare/serums" }}
    />
  ),
};

/** Figma `Banner [Image Background / Compact]` with a sticker; the white photo shows the scrim. */
export const ImageBackgroundCompact: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-8 tablet:grid-cols-2">
      <BannerImageBackgroundCompact
        overline="Overline"
        title="Title Text"
        image={SQUARE}
        action={COPY.action}
        sticker={{ text: "20% Off", icon: "loyalty" }}
      />
      <BannerImageBackgroundCompact
        overline="Overline"
        title="Title Text"
        image={WHITE}
        action={COPY.action}
        sticker={{ text: "20% Off", icon: "loyalty" }}
      />
    </div>
  ),
};

/** Figma `Banner [Image - Centered]`. */
export const ImageCentered: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-448">
      <BannerImageCentered
        overline="Overline"
        title="Title Text"
        image={SQUARE}
        action={COPY.action}
      />
    </div>
  ),
};

/** Figma `Banner.Horizontal`: the whole banner is a link; hover draws the inner frame. */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-8 desktop:grid-cols-2">
      <BannerHorizontal
        overline="New in"
        title="The Summer Edit"
        image={SQUARE}
        href="/collections/summer"
        cta="Shop Skincare"
        sticker={{ text: "20% Off", icon: "loyalty" }}
      />
      <BannerHorizontal
        overline="Gift guide"
        title="Gifts Under €30"
        image={WHITE}
        href="/collections/gifts"
        cta="Shop Gifts"
      />
    </div>
  ),
};
