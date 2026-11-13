import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHeaderLeft } from "./page-header";
import {
  pageHeaderMeta,
  renderPageHeader,
  type PageHeaderStoryArgs,
} from "./page-header.story-meta";

type Args = PageHeaderStoryArgs;

const meta = {
  ...pageHeaderMeta,
  title: "Components/Layout & Utility/Page Header/Page Header Left",
  render: renderPageHeader(PageHeaderLeft),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const CONTENT_PAGE = {
  showAvatar: false,
  showSubtitle: false,
  showActions: false,
} as const;

/** The Figma default: breadcrumb, avatar, titles and two Outline actions (My Account). */
export const Default: Story = {};

/** A content page (PLP, static content, help): breadcrumb and title only. */
export const ContentPage: Story = {
  args: {
    ...CONTENT_PAGE,
    mainTitleText: "Serums",
    breadcrumb: {
      items: [
        { label: "Skincare", href: "/c/skincare" },
        { label: "Face", href: "/c/skincare/face" },
      ],
      current: "Serums",
    },
  },
};

/** Breadcrumb only (05 Intermediary WD.05.01): no title; the page's h1 sits in its content. */
export const BreadcrumbOnly: Story = {
  args: { showPageDetails: false, breadcrumb: { items: [], current: "Make-up" } },
};

/** With a one-line subtitle, e.g. the result count on a product list. */
export const WithSubtitle: Story = {
  args: {
    ...CONTENT_PAGE,
    showSubtitle: true,
    mainTitleText: "Serums",
    subtitleText: "128 products",
  },
};

/** Figma `PageHeader.Left` default: avatar, titles and two Outline actions (My Account). */
export const Profile: Story = {};

/** Figma `Hyper Links` (shown on the Mobile breakpoint): contextual links under the titles. */
export const WithLinks: Story = {
  args: {
    showActions: false,
    showHyperLinks: true,
    linkPrimaryText: "View profile",
    linkSecondaryText: "Edit settings",
  },
};

/** A legal document (module 11) with a long title that wraps. */
export const LongTitle: Story = {
  args: {
    ...CONTENT_PAGE,
    showSubtitle: true,
    mainTitleText: "Terms and conditions of sale for online orders",
    subtitleText: "Last updated 12 October 2026",
    breadcrumb: { items: [{ label: "Legal Centre", href: "/legal" }], current: "Terms" },
  },
};
