import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Avatar } from "./avatar";

/** Figma's `Show Status` is Storybook only: in code the status shows when it is given. */
type Args = {
  variant: "photo" | "letter" | "icon";
  size: "sm" | "md" | "lg" | "xl";
  showStatus: boolean;
  status: "info" | "success" | "error" | "warning" | "neutral";
  initialsText: string;
  icon: IconName;
};

const VARIANTS = ["photo", "letter", "icon"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;
const STATUSES = ["info", "success", "error", "warning", "neutral"] as const;
const MATRIX_SIZES = ["xl", "lg", "md", "sm"] as const;
const online = { status: "success", label: "Online" } as const;

const meta = {
  title: "Components/Data Display/Avatar",
  // The defaults of Figma's `Avatar` (Photo, X-Large) and its `.Base Avatar`.
  args: {
    variant: "photo",
    size: "xl",
    showStatus: true,
    status: "success",
    initialsText: "JD",
    icon: "upload",
  },
  render: ({ variant, size, showStatus, status, initialsText, icon }) => {
    const common = {
      size,
      status: showStatus ? { status, label: `Status: ${status}` } : undefined,
    };
    if (variant === "photo") {
      return <Avatar {...common} variant="photo" src="/dev/sample-square.webp" alt="Jane Doe" />;
    }
    if (variant === "letter") {
      return <Avatar {...common} variant="letter" initials={initialsText} name="Jane Doe" />;
    }
    return <Avatar {...common} variant="icon" icon={icon} label="Add profile photo" />;
  },
  parameters: {
    // The Figma properties: Style, Size, Show Status, Status, Initials Text, Icon.
    controls: {
      include: ["variant", "size", "showStatus", "status", "initialsText", "icon"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Photo style when a user-uploaded image is available",
        "Use Letter style as a fallback when no photo exists",
        "Use Status Dot to indicate real-time presence (online, away, offline)",
        "Use Small size in dense layouts like table cells and list items, Large for profile pages",
      ],
      dont: [
        "Don't show Status Dot in contexts where presence is irrelevant (e.g., order history, reviews)",
        "Don't mix Photo, Letter and Icon styles inconsistently for the same user across the interface",
        "Don't use Large size in compact components like navigation or table rows",
        "Don't rely solely on the status dot color to communicate state — pair with labels where possible",
      ],
    },
    docs: {
      description: {
        component:
          "A circular user representation displaying either a profile photo or an initial letter, with optional online/offline status indication.",
      },
    },
  },
  argTypes: {
    variant: {
      name: "variant",
      description: "Figma `Style`: Photo shows an image, Letter the initials, Icon a glyph.",
      control: "inline-radio",
      options: VARIANTS,
      table: {
        type: { summary: VARIANTS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "photo" },
      },
    },
    size: {
      description:
        "Figma `Size`: Small 36 · Default 48 · Large 60 · X-Large 88 (code: sm · md · lg · xl).",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: SIZES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "xl" },
      },
    },
    showStatus: {
      description: "Figma `Show Status`. In code: pass `status`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    status: {
      description:
        "Figma `Status`: the Status Dot instance. In code: `status.status`, with a `label` that is announced.",
      control: "select",
      options: STATUSES,
      if: { arg: "showStatus" },
      table: {
        type: { summary: "StatusDotStatus" },
        defaultValue: { summary: "success" },
      },
    },
    initialsText: {
      description:
        "Figma `Initials Text`: one or two initials. In code: `initials`. Letter style only.",
      control: "text",
      if: { arg: "variant", eq: "letter" },
      table: { type: { summary: "string" }, defaultValue: { summary: "JD" } },
    },
    icon: {
      description: "Figma `Icon`: a Material Symbols name. Icon style only.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "variant", eq: "icon" },
      table: {
        type: { summary: "IconName" },
        defaultValue: { summary: "upload" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma default: a photo at X-Large with the status dot. Letter is the fallback without a photo. */
export const Default: Story = {};

/** Mirrors the Figma set: Size × Photo · Letter · Icon, with the status dot. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-3 items-center justify-items-start gap-24">
      {MATRIX_SIZES.flatMap((size) => [
        <Avatar
          key={`${size}-p`}
          variant="photo"
          src="/dev/sample-square.webp"
          alt="Jane Doe"
          size={size}
          status={online}
        />,
        <Avatar
          key={`${size}-l`}
          variant="letter"
          initials="JD"
          name="Jane Doe"
          size={size}
          status={online}
        />,
        <Avatar
          key={`${size}-i`}
          variant="icon"
          label="Add profile photo"
          size={size}
          status={online}
        />,
      ])}
    </div>
  ),
};

/** Without status (Figma Don't: no presence where it is irrelevant). */
export const WithoutStatus: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-16">
      <Avatar variant="photo" src="/dev/sample-square.webp" alt="Jane Doe" />
      <Avatar variant="letter" initials="AK" name="Ali Kaya" />
      <Avatar variant="icon" label="Add profile photo" />
    </div>
  ),
};
