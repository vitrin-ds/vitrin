import type { Meta } from "@storybook/nextjs-vite";
import { Avatar } from "@/components/ui/avatar/avatar";
import { Button } from "@/components/ui/button/button";
import type { BreadcrumbProps } from "@/components/ui/breadcrumb/breadcrumb";
import { Link } from "@/components/ui/link/link";
import type { PageHeaderLeft } from "./page-header";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
export type PageHeaderStoryArgs = {
  showBreadcrumb: boolean;
  showAvatar: boolean;
  showPageDetails: boolean;
  showTitles: boolean;
  showMainTitle: boolean;
  mainTitleText: string;
  showSubtitle: boolean;
  subtitleText: string;
  showActions: boolean;
  showButtonPrimary: boolean;
  showButtonSecondary: boolean;
  showLinkPrimary: boolean;
  linkPrimaryText: string;
  showLinkSecondary: boolean;
  linkSecondaryText: string;
  showHyperLinks: boolean;
  // Not a Figma property: the nested Breadcrumb's data.
  breadcrumb: BreadcrumbProps;
};

// The shared `.Base.PageHeader.*` controls of Page Header Left and Center (Storybook only).
export const pageHeaderMeta = {
  // The defaults of Figma's `PageHeader.Left` (Breakpoint=Default) and its `.Base.PageHeader.Left`.
  args: {
    showBreadcrumb: true,
    showAvatar: true,
    showPageDetails: true,
    showTitles: true,
    showMainTitle: true,
    mainTitleText: "Alfie A.",
    showSubtitle: true,
    subtitleText: "alfie@example.com",
    showActions: true,
    showButtonPrimary: true,
    showButtonSecondary: true,
    showLinkPrimary: true,
    linkPrimaryText: "Link [Primary]",
    showLinkSecondary: true,
    linkSecondaryText: "Link [Secondary]",
    showHyperLinks: false,
    breadcrumb: {
      items: [{ label: "My Account", href: "/account" }],
      current: "Profile",
    },
  },
  parameters: {
    layout: "fullscreen",
    // The Figma properties: the component (PageHeader.Left or .Center; Breakpoint is responsive
    // CSS), then `.Base.PageHeader.*`.
    controls: {
      include: [
        "showBreadcrumb",
        "showAvatar",
        "showPageDetails",
        "showTitles",
        "showMainTitle",
        "mainTitleText",
        "showSubtitle",
        "subtitleText",
        "showActions",
        "showButtonPrimary",
        "showButtonSecondary",
        "showLinkPrimary",
        "linkPrimaryText",
        "showLinkSecondary",
        "linkSecondaryText",
        "showHyperLinks",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Breadcrumb to maintain wayfinding context, especially on deeper pages",
        "Use Avatar + Main Title for user profile pages; hide Avatar for generic content pages",
        'Use hyperlinks for contextual navigation (e.g., "View Profile", "Edit Settings")',
        'Use action buttons for primary page-level actions (e.g., "Save", "Export")',
      ],
      dont: [
        "Don't show all elements at once — curate visibility based on the page context",
        "Don't use both hyperlinks and action buttons for the same purpose — choose the right pattern",
        "Don't hide Breadcrumb on deep navigation pages — users need a way back",
        "Don't use long subtitles — keep them to a single line of supporting context",
      ],
    },
    docs: {
      description: {
        component:
          "A left-aligned page header providing contextual navigation and identity, combining breadcrumbs, user/page details with avatar, hyperlinks, and action buttons.",
      },
    },
  },
  argTypes: {
    showBreadcrumb: {
      description: "Figma `Show Breadcrumb`. In code: pass `breadcrumb`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showAvatar: {
      description: "Figma `Show Avatar`. In code: pass `avatar`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showPageDetails: {
      description:
        "Figma `Show Page Details`: the avatar, titles, actions and links row. In code: leave those out.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTitles: {
      description:
        "Figma `Show Titles`: main title and subtitle. In code: pass `title` / `subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showMainTitle: {
      description: "Figma `Show Main Title`. In code: pass `title`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    mainTitleText: {
      description:
        "Figma `Main Title Text`: the primary heading, e.g. a user name or page title. In code: `title`.",
      control: "text",
      if: { arg: "showMainTitle" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Alfie A." } },
    },
    showSubtitle: {
      description: "Figma `Show Subtitle`. In code: pass `subtitle`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    subtitleText: {
      description: "Figma `Subtitle Text`: supporting text, e.g. an email. In code: `subtitle`.",
      control: "text",
      if: { arg: "showSubtitle" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "alfie@example.com" } },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `actions`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonPrimary: {
      description: "Figma `Show Button [Primary]`: the first action button.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonSecondary: {
      description: "Figma `Show Button [Secondary]`: the second action button.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLinkPrimary: {
      description: "Figma `Show Link [Primary]`. Part of the hyperlinks (`links`).",
      control: "boolean",
      if: { arg: "showHyperLinks" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    linkPrimaryText: {
      description: "Figma `Link [Primary] Text`.",
      control: "text",
      if: { arg: "showLinkPrimary" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Link [Primary]" } },
    },
    showLinkSecondary: {
      description: "Figma `Show Link [Secondary]`. Part of the hyperlinks (`links`).",
      control: "boolean",
      if: { arg: "showHyperLinks" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    linkSecondaryText: {
      description: "Figma `Link [Secondary] Text`.",
      control: "text",
      if: { arg: "showLinkSecondary" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Link [Secondary]" } },
    },
    showHyperLinks: {
      description:
        "Figma `Show Hyper Links`: contextual links under the titles. In code: pass `links`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Partial<Meta<PageHeaderStoryArgs>>;

export function renderPageHeader(Component: typeof PageHeaderLeft) {
  return function PageHeaderStory({
    showBreadcrumb,
    showAvatar,
    showPageDetails,
    showTitles,
    showMainTitle,
    mainTitleText,
    showSubtitle,
    subtitleText,
    showActions,
    showButtonPrimary,
    showButtonSecondary,
    showLinkPrimary,
    linkPrimaryText,
    showLinkSecondary,
    linkSecondaryText,
    showHyperLinks,
    breadcrumb,
  }: PageHeaderStoryArgs) {
    const details = showPageDetails;
    const hasActions = details && showActions && (showButtonPrimary || showButtonSecondary);
    const hasLinks = details && showHyperLinks && (showLinkPrimary || showLinkSecondary);
    return (
      <Component
        breadcrumb={showBreadcrumb ? breadcrumb : undefined}
        avatar={
          details && showAvatar ? (
            <Avatar
              variant="letter"
              initials="AA"
              name="Alfie A."
              size="xl"
              status={{ status: "success", label: "Online" }}
            />
          ) : undefined
        }
        title={details && showTitles && showMainTitle ? mainTitleText : undefined}
        subtitle={details && showTitles && showSubtitle ? subtitleText : undefined}
        actions={
          hasActions ? (
            <>
              {showButtonPrimary && (
                <Button variant="outline" size="sm">
                  Edit profile
                </Button>
              )}
              {showButtonSecondary && (
                <Button variant="outline" size="sm">
                  Sign out
                </Button>
              )}
            </>
          ) : undefined
        }
        links={
          hasLinks ? (
            <>
              {showLinkPrimary && (
                <Link href="/account/profile" variant="neutral">
                  {linkPrimaryText}
                </Link>
              )}
              {showLinkSecondary && (
                <Link href="/account/settings" variant="neutral">
                  {linkSecondaryText}
                </Link>
              )}
            </>
          ) : undefined
        }
      />
    );
  };
}
