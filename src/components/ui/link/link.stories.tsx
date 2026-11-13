import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Link, LinkButton, type LinkProps } from "./link";

type Args = {
  variant: LinkProps["variant"];
  size: LinkProps["size"];
  underline: LinkProps["underline"];
  error: boolean;
  disabled: boolean;
  linkText: string;
};

const meta = {
  title: "Components/Actions/Link",
  // The defaults of Figma's `Link` and its `.Base Link`.
  args: {
    variant: "accent",
    size: "default",
    underline: "always",
    error: false,
    disabled: false,
    linkText: "Link Text",
  },
  render: ({ linkText, ...args }) => (
    <Link href="#delivery" {...args}>
      {linkText}
    </Link>
  ),
  parameters: {
    // The Figma properties: State (Error, Disabled), Style, Size, Underline, Link Text.
    controls: { include: ["error", "disabled", "variant", "size", "underline", "linkText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use descriptive link text that indicates the destination",
        "Ensure links are visually distinguishable from regular text",
        "Use Neutral for in-content links, Accent for standalone CTAs",
        "Maintain consistent underline style across the interface",
      ],
      dont: [
        'Don\'t use vague text like "click here" or "read more"',
        "Don't remove underline — it's essential for accessibility",
        "Don't use links for actions — use Button instead",
        "Don't place multiple links too close together",
      ],
    },
    docs: {
      description: {
        component:
          "An inline navigational element that directs users to another page, section, or resource, styled to stand out within body text. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    error: {
      description: "Figma `State=Error`, e.g. a link inside an error message.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    variant: {
      description: "Figma `Style`: Accent for standalone CTAs, Neutral for in-content links.",
      control: "inline-radio",
      options: ["neutral", "accent"],
      table: {
        type: { summary: '"neutral" | "accent"' },
        defaultValue: { summary: "accent" },
      },
    },
    size: {
      description:
        "Figma `Size`: Default (label-large) · Small (label-medium) · X-Small (label-small). Code-only: `inline` takes the text style of its sentence.",
      control: "inline-radio",
      options: ["default", "sm", "xs"],
      table: {
        type: { summary: '"default" | "sm" | "xs" | "inline"' },
        defaultValue: { summary: "default" },
      },
    },
    underline: {
      description:
        "Figma `Underline`: Always (dotted, solid on hover) · Hover (none until hover; for a link that stands on its own).",
      control: "inline-radio",
      options: ["hover", "always"],
      table: { type: { summary: '"hover" | "always"' }, defaultValue: { summary: "always" } },
    },
    linkText: {
      description: "Figma `Link Text`: describe the destination. In code: `children`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Link Text" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A standalone link to another page: Accent for a call to action. */
export const Default: Story = {};

/** Mirrors the Figma set: Style × State (Default · Error · Disabled; Hover is a CSS state). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 justify-items-start gap-16">
      {(["accent", "neutral"] as const).map((variant) => (
        <div key={variant} className="flex flex-col items-start gap-16">
          <Link href="#a" variant={variant}>
            Link Text
          </Link>
          <Link href="#b" variant={variant} error>
            Link Text
          </Link>
          <Link href="#c" variant={variant} disabled>
            Link Text
          </Link>
        </div>
      ))}
    </div>
  ),
};

/** Size Small: the "View All" of an account overview section (label-medium, 44px hit area). */
export const Small: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center justify-between gap-8 p-8">
      <h2 className="text-title-md text-text-primary">My Orders (4)</h2>
      <Link href="#orders" size="sm">
        View All
      </Link>
    </div>
  ),
};

/** A Neutral link inside a sentence, at the sentence's own text style. */
export const InBodyText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="max-w-(--breakpoint-tablet) text-body-md text-text-primary">
      Orders placed before 2 pm ship the same day. See{" "}
      <Link href="#delivery" variant="neutral" size="inline">
        delivery options
      </Link>{" "}
      for weekend and express rates.
    </p>
  ),
};

/**
 * `LinkButton`: an action that looks like a Link (Active Filters "Clear all", checkout "Change").
 * Same Style × State set; a real button, with a 44-tall hit area at Size Default.
 */
export const AsButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      <div className="flex gap-24">
        {(["accent", "neutral"] as const).map((variant) => (
          <div key={variant} className="flex flex-col items-start gap-16">
            <LinkButton variant={variant}>Clear all</LinkButton>
            <LinkButton variant={variant} error>
              Clear all
            </LinkButton>
            <LinkButton variant={variant} disabled>
              Clear all
            </LinkButton>
          </div>
        ))}
      </div>
      <p className="text-body-sm text-text-primary">
        Filter removed.{" "}
        <LinkButton size="inline" variant="neutral">
          Undo
        </LinkButton>
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const [first] = canvas.getAllByRole("button", { name: "Clear all" });
    await expect(first).toHaveFocus();
    await expect(first).toHaveAttribute("type", "button");
    await expect(getComputedStyle(first, "::before").height).toBe("44px");
  },
};
