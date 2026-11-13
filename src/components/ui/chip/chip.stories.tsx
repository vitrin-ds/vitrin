import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Chip } from "./chip";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: (typeof OPTIONS)[number];
  disabled: boolean;
  selected: boolean;
  labelText: string;
  showAvatar: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showRightIcon: boolean;
  rightIcon: IconName;
  showDot: boolean;
  showCancel: boolean;
};

// Figma order: Primary · Success · Warning · Error · Light · Info.
const OPTIONS = ["primary", "success", "warning", "error", "light", "info"] as const;

const noop = () => undefined;

const meta = {
  title: "Components/Actions/Chip",
  // The defaults of Figma's `.Base Chip`: every slot is shown.
  args: {
    color: "primary",
    disabled: false,
    selected: false,
    labelText: "Chip",
    showAvatar: true,
    showLeftIcon: true,
    leftIcon: "loyalty",
    showRightIcon: true,
    rightIcon: "qr_code_scanner",
    showDot: true,
    showCancel: true,
  },
  render: ({
    color,
    disabled,
    selected,
    labelText,
    showAvatar,
    showLeftIcon,
    leftIcon,
    showRightIcon,
    rightIcon,
    showDot,
    showCancel,
  }) => {
    const slots = {
      disabled,
      dot: showDot,
      avatar: showAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/dev/sample-square.webp" alt="" className="size-16 object-cover" />
      ) : undefined,
      leftIcon: showLeftIcon ? leftIcon : undefined,
      rightIcon: showRightIcon ? rightIcon : undefined,
    };
    // Selected is a toggle: always Light, and a button chip has no cancel.
    return selected ? (
      <Chip {...slots} pressed onClick={noop}>
        {labelText}
      </Chip>
    ) : (
      <Chip {...slots} color={color} onRemove={showCancel ? noop : undefined}>
        {labelText}
      </Chip>
    );
  },
  parameters: {
    // The Figma properties: Color, State (Disabled, Selected), and the .Base Chip slots.
    controls: {
      include: [
        "color",
        "disabled",
        "selected",
        "labelText",
        "showAvatar",
        "showLeftIcon",
        "leftIcon",
        "showRightIcon",
        "rightIcon",
        "showDot",
        "showCancel",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for filtering, tagging, or displaying removable selections",
        "Keep chip text concise — ideally under 20 characters",
        "Use semantic colors consistently (Success for positive, Error for negative)",
        "Include cancel icon for user-removable chips",
      ],
      dont: [
        "Don't use chips for primary actions — use Button instead",
        "Don't overload chips with too many visible elements at once",
        "Don't mix different chip sizes in the same context",
        "Don't use chips for navigation — use Tabs or Links instead",
      ],
    },
    docs: {
      description: {
        component:
          "A compact, interactive element for displaying tags, filters, or selections with optional visual indicators and dismissible actions. Hover and Focus are CSS states: use the pointer and the keyboard on the example to see them.",
      },
    },
  },
  argTypes: {
    color: {
      description:
        "Figma `Color`: the semantic colour theme. Ignored while `selected` (always Light).",
      control: "select",
      options: OPTIONS,
      table: {
        type: { summary: OPTIONS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "primary" },
      },
    },
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      description:
        "Figma `State=Selected`. Only Light has it: the chip becomes a toggle button (`pressed`) with no cancel.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    labelText: {
      description: "Figma `Label Text`: under 20 characters. In code: `children`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Chip" } },
    },
    showAvatar: {
      description: "Figma `Show Avatar`. In code: pass `avatar`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "loyalty" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: pass `rightIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "qr_code_scanner" } },
    },
    showDot: {
      description: "Figma `Show Dot`: a status dot before the text. In code: `dot`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showCancel: {
      description:
        "Figma `Show Cancel`: the cancel button. In code: pass `onRemove`. Not on a selected chip.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A tag or quick action. Pick the Color for its meaning. */
export const Default: Story = {};

/** Mirrors the Figma set: Color × Default · Disabled, with the Figma slots (dot, icons, cancel). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 justify-items-start gap-16 tablet:grid-cols-3 desktop:grid-cols-6">
      {[false, true].flatMap((disabled) =>
        OPTIONS.map((color) => (
          <Chip
            key={`${color}-${disabled}`}
            color={color}
            disabled={disabled}
            dot
            leftIcon="loyalty"
            rightIcon="qr_code_scanner"
            onRemove={() => undefined}
          >
            Chip
          </Chip>
        )),
      )}
    </div>
  ),
};

/** Link chips: Light chips that navigate, e.g. the related categories on the 410 page (14.02). */
export const Links: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <nav aria-label="Related categories" className="flex flex-wrap gap-8">
      <Chip color="light" href="/c/skin-care/face/serums">
        Serums
      </Chip>
      <Chip color="light" href="/c/skin-care/face/masks">
        Masks
      </Chip>
      <Chip color="light" href="/collections/serein">
        Serein
      </Chip>
    </nav>
  ),
};

/** Filter links (15.03 Help search topics): the link to the page being shown is `current`. */
export const FilterLinks: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <nav aria-label="Filter by topic" className="flex flex-wrap gap-8">
      <Chip href="/help/search?q=refund" current>
        All (8)
      </Chip>
      <Chip color="light" href="/help/search?q=refund&topic=returns">
        Returns & refunds (5)
      </Chip>
      <Chip color="light" href="/help/search?q=refund&topic=payment">
        Payments & promotions (2)
      </Chip>
    </nav>
  ),
};

/** Quick filters: Light chips that toggle; pressed is Figma `Light / Selected`. */
export const Filters: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Chip onClick={() => undefined} pressed={false}>
        Vegan
      </Chip>
      <Chip onClick={() => undefined} pressed>
        On sale
      </Chip>
      <Chip onClick={() => undefined} pressed={false}>
        New in
      </Chip>
    </div>
  ),
};

/** Figma `Show Avatar`: a 16px picture before the text, for a person or a brand. */
export const WithAvatar: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Chip
      color="light"
      // eslint-disable-next-line @next/next/no-img-element
      avatar={<img src="/dev/sample-square.webp" alt="" className="size-16 object-cover" />}
    >
      Jane Doe
    </Chip>
  ),
};
