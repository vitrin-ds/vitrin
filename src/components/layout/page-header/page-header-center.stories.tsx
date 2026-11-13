import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHeaderCenter } from "./page-header";
import {
  pageHeaderMeta,
  renderPageHeader,
  type PageHeaderStoryArgs,
} from "./page-header.story-meta";

type Args = PageHeaderStoryArgs;

const meta = {
  ...pageHeaderMeta,
  title: "Components/Layout & Utility/Page Header/Page Header Center",
  render: renderPageHeader(PageHeaderCenter),
  parameters: {
    ...pageHeaderMeta.parameters,
    docs: {
      description: {
        component:
          "A center-aligned page header providing contextual navigation and identity, combining breadcrumbs, user/page details with avatar, hyperlinks, and action buttons.",
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma default: breadcrumb, avatar, titles and two Outline actions, stacked and centred. */
export const Default: Story = {};

/** A content page: breadcrumb and a centred title only. */
export const ContentPage: Story = {
  args: { showAvatar: false, showSubtitle: false, showActions: false, mainTitleText: "About us" },
};

/** Figma `Hyper Links`: contextual links under the titles. */
export const WithLinks: Story = {
  args: {
    showActions: false,
    showHyperLinks: true,
    linkPrimaryText: "View profile",
    linkSecondaryText: "Edit settings",
  },
};
