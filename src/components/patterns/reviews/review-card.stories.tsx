import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { REVIEW_CARD_MAX_PHOTOS, ReviewCard, type ReviewCardProps } from "./review-card";
import { ReviewHelpful } from "./review-helpful";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  type: ReviewCardProps["variant"];
  userNameText: string;
  dateText: string;
  commentText: string;
  showPhotos: boolean;
  showMorePhotosButton: boolean;
  showActions: boolean;
};

const PHOTO = {
  src: "/brand/add-image.svg",
  alt: "Customer photo of the gloss",
  width: 1024,
  height: 1024,
};

/** Photos for the strip: one more than fits makes the "+N" tile (Figma `Show More Photos Button`). */
const photosFor = (showPhotos: boolean, showMore: boolean) =>
  showPhotos
    ? Array.from({ length: REVIEW_CARD_MAX_PHOTOS + (showMore ? 2 : 0) }, () => PHOTO)
    : undefined;

const meta = {
  title: "Patterns/Social Proof & Reviews/Review Card",
  // The defaults of Figma's `Card.UserReview` (Type=List) and `.Base.Card.UserReview`.
  args: {
    type: "list",
    userNameText: "S****** S*******",
    dateText: "2026-12-21T00:00:00.000Z",
    commentText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse non fringilla ipsum. Aliquam erat volutpat.",
    showPhotos: true,
    showMorePhotosButton: true,
    showActions: true,
  },
  render: ({
    type,
    userNameText,
    dateText,
    commentText,
    showPhotos,
    showMorePhotosButton,
    showActions,
  }) => (
    <ReviewCard
      variant={type}
      author={userNameText}
      date={dateText}
      rating={4}
      body={commentText}
      photos={photosFor(showPhotos, showMorePhotosButton)}
      actions={
        showActions ? (
          <ReviewHelpful helpfulCount={12} notHelpfulCount={1} onVote={() => undefined} />
        ) : undefined
      }
    />
  ),
  parameters: {
    controls: {
      include: [
        "type",
        "showPhotos",
        "showMorePhotosButton",
        "showActions",
        "userNameText",
        "dateText",
        "commentText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Card type for horizontal review strips on product detail pages and carousels",
        "Use List type for stacked reviews on the full reviews page",
        "Hide Show Photos and Show More Photos Button together when a review has no images",
        "Hide Show Comment for rating-only reviews — the card collapses cleanly",
      ],
      dont: [
        "Don't enable Show More Photos Button while Show Photos is off — it leaves an orphaned tile",
        "Don't hide Show Score — the rating is the review's primary signal",
        "Don't hide Show User & Date — undated reviews read as untrustworthy",
        "Don't use Card type inside already-contained surfaces like Sheet or PopUp",
      ],
    },
    docs: {
      description: {
        component:
          "A single customer review displaying the reviewer's identity, star rating, written comment, customer photos, and a helpfulness vote, available as a bordered card or a borderless list item.",
      },
    },
  },
  argTypes: {
    type: {
      description:
        "Figma `Type`: Card is a bordered standalone surface; List is borderless for stacked listings. In code: `variant`.",
      control: "inline-radio",
      options: ["list", "card"],
      table: { type: { summary: '"list" | "card"' }, defaultValue: { summary: "list" } },
    },
    userNameText: {
      description: "Figma `User Name Text`. In code: `author`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "S****** S*******" } },
    },
    dateText: {
      description: "Figma `Date Text`. In code: `date`, ISO 8601 (Figma writes DD.MM.YYYY).",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "2026-12-21T00:00:00.000Z" } },
    },
    commentText: {
      description: "Figma `Comment Text`. In code: `body`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse non fringilla ipsum. Aliquam erat volutpat.",
        },
      },
    },
    showPhotos: {
      description: "Figma `Show Photos`. In code: pass `photos`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showMorePhotosButton: {
      description:
        'Figma `Show More Photos Button`. In code: the "+N" tile appears when there are more than 5 `photos`.',
      control: "boolean",
      if: { arg: "showPhotos" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `actions` (a `ReviewHelpful`).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma default: a borderless list item with photos and the helpfulness row. */
export const Default: Story = {};

/** A single review as a bordered card, for strips and carousels. */
export const Card: Story = {
  args: { type: "card", showPhotos: false, showMorePhotosButton: false, showActions: false },
};

/** Five photos and the "+N" tile (Figma Photos strip). */
export const WithPhotos: Story = { args: { type: "card", showActions: false } };

/** Borderless list item. */
export const List: Story = {
  args: { type: "list", showPhotos: false, showMorePhotosButton: false, showActions: false },
};

/** Figma `Actions`: the helpfulness row (ReviewHelpful in the `actions` slot). */
export const WithHelpful: Story = {
  args: { showPhotos: false, showMorePhotosButton: false, showActions: true },
};

/** After a vote: the chosen thumb is filled and both are disabled. */
export const Voted: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ReviewCard
      variant={args.type}
      author={args.userNameText}
      date={args.dateText}
      rating={4}
      body={args.commentText}
      actions={<ReviewHelpful helpfulCount={12} notHelpfulCount={1} vote="helpful" />}
    />
  ),
};

/** The visitor's own review, awaiting moderation (no votes yet). */
export const Pending: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ReviewCard
      variant={args.type}
      author={args.userNameText}
      date={args.dateText}
      rating={4}
      body={args.commentText}
      pendingLabel="Awaiting moderation"
    />
  ),
};
