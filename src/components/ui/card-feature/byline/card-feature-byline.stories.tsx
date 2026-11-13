import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardFeatureByline } from "./card-feature-byline";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  authorName: string;
  authorRole: string;
  showReviewer: boolean;
  reviewerName: string;
  reviewerRole: string;
  showMeta: boolean;
  published: string;
  updated: string;
  readingMinutes: number;
  /** Not a Figma property: the author page link and photo. */
  authorHref?: string;
  authorPhoto?: string;
};

const meta = {
  title: "Patterns/Discovery/Tactical Feature Cards/Feature Card Byline",
  // The defaults of Figma's `Card.Feature.Byline`.
  args: {
    authorName: "Maya Chen",
    authorRole: "Senior Beauty Editor",
    showReviewer: true,
    reviewerName: "Dr. Lena Ortiz",
    reviewerRole: "Consultant Dermatologist, MD",
    showMeta: true,
    published: "2026-10-14",
    updated: "2026-10-22",
    readingMinutes: 7,
    authorHref: "/journal/authors/maya-chen",
  },
  render: ({
    authorName,
    authorRole,
    showReviewer,
    reviewerName,
    reviewerRole,
    showMeta,
    published,
    updated,
    readingMinutes,
    authorHref,
    authorPhoto,
  }) => (
    <CardFeatureByline
      author={{ name: authorName, role: authorRole, href: authorHref, photo: authorPhoto }}
      reviewer={
        showReviewer
          ? { name: reviewerName, role: reviewerRole, href: "/journal/authors/lena-ortiz" }
          : undefined
      }
      published={showMeta ? published : undefined}
      updated={showMeta ? updated : undefined}
      readingMinutes={showMeta ? readingMinutes : undefined}
    />
  ),
  parameters: {
    // The Figma properties: Author Name, Author Role, Show Reviewer, Reviewer Name, Reviewer Role,
    // Show Meta, Meta Text (code builds it from published, updated and readingMinutes).
    controls: {
      include: [
        "authorName",
        "authorRole",
        "showReviewer",
        "reviewerName",
        "reviewerRole",
        "showMeta",
        "published",
        "updated",
        "readingMinutes",
      ],
    },
    figma: {
      architecture:
        "Single-Layer component: no base layer, properties are on the component itself.",
      do: [
        "Always show published and updated dates on articles",
        "Show a reviewer for health-related content",
        "Link the author name to the author page",
        "Use the same data for JSON-LD",
      ],
      dont: [
        "Don't fake 'updated' dates",
        "Don't show a reviewer who didn't review",
        "Don't hide the author on editorial content",
        "Don't use initials only",
      ],
    },
    docs: {
      description: {
        component:
          "Shows who wrote an article, who reviewed it and when it was published and updated. Supports E-E-A-T and Article structured data (author, reviewedBy, datePublished, dateModified).",
      },
    },
  },
  argTypes: {
    authorName: {
      description: "Figma `Author Name`. In code: `author.name` (the component adds 'By').",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Maya Chen" } },
    },
    authorRole: {
      description: "Figma `Author Role`. In code: `author.role`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Senior Beauty Editor" } },
    },
    showReviewer: {
      description:
        "Figma `Show Reviewer`. In code: pass `reviewer`; only for someone who actually reviewed.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    reviewerName: {
      description:
        "Figma `Reviewer Name`. In code: `reviewer.name` (the component adds 'Medically reviewed by').",
      control: "text",
      if: { arg: "showReviewer" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Dr. Lena Ortiz" } },
    },
    reviewerRole: {
      description: "Figma `Reviewer Role`. In code: `reviewer.role`.",
      control: "text",
      if: { arg: "showReviewer" },
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Consultant Dermatologist, MD" },
      },
    },
    showMeta: {
      description: "Figma `Show Meta`. In code: pass `published`, `updated` or `readingMinutes`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    published: {
      description:
        "Figma `Meta Text` (publication date). In code: `published`, an ISO string or Date.",
      control: "text",
      if: { arg: "showMeta" },
      table: { type: { summary: "Date | string" }, defaultValue: { summary: "2026-10-14" } },
    },
    updated: {
      description:
        "Figma `Meta Text` (last real update). In code: `updated`, an ISO string or Date.",
      control: "text",
      if: { arg: "showMeta" },
      table: { type: { summary: "Date | string" }, defaultValue: { summary: "2026-10-22" } },
    },
    readingMinutes: {
      description: "Figma `Meta Text` (reading time). In code: `readingMinutes`.",
      control: "number",
      if: { arg: "showMeta" },
      table: { type: { summary: "number" }, defaultValue: { summary: "7" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-790">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Under an article headline: author, medical reviewer and meta. */
export const Default: Story = {};

/** Without a reviewer (Figma `Show Reviewer` off) for non-health content, with an author photo. */
export const AuthorOnly: Story = {
  args: {
    showReviewer: false,
    authorHref: undefined,
    authorPhoto: "/dev/sample-square.webp",
    updated: "",
  },
};

/** Mobile width: the groups wrap. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
};
