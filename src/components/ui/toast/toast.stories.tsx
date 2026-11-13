import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Toast, ToastProvider, useToast, type ToastProps } from "./toast";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  usage: ToastProps["usage"];
  tone: ToastProps["tone"];
  leftIcon: IconName;
  bodyText: string;
  showInnerAction: boolean;
  innerActionText: string;
  showBottomAction: boolean;
  bottomActionText: string;
  showClose: boolean;
};

const TONES = ["neutral", "success", "error", "warning", "info"] as const;
const USAGES = ["multiple", "single"] as const;
const dismiss = () => undefined;

const meta = {
  title: "Components/Feedback/Toast",
  // The defaults of Figma's `Toast` and `.Base Toast`. Single Line shows the Inner Action.
  args: {
    usage: "single",
    tone: "neutral",
    leftIcon: "info",
    bodyText: "Toast Content",
    showInnerAction: true,
    innerActionText: "Inner Action",
    showBottomAction: false,
    bottomActionText: "Bottom Action",
    showClose: true,
  },
  // One `action` in code: Single Line uses the Inner Action, Multiple Line the Bottom Action.
  render: ({
    bodyText,
    leftIcon,
    showInnerAction,
    innerActionText,
    showBottomAction,
    bottomActionText,
    showClose,
    ...args
  }) => {
    const shown = args.usage === "multiple" ? showBottomAction : showInnerAction;
    const label = args.usage === "multiple" ? bottomActionText : innerActionText;
    return (
      <Toast
        {...args}
        icon={leftIcon}
        showClose={showClose}
        onDismiss={dismiss}
        action={shown ? { label, onClick: dismiss } : undefined}
      >
        {bodyText}
      </Toast>
    );
  },
  parameters: {
    // The Figma properties: Usage, Tone, Left Icon, Body Text, Inner / Bottom Action, Show Close.
    // `Show Left Icon` and `Show Body Text` are not controls: the code always renders both.
    controls: {
      include: [
        "usage",
        "tone",
        "leftIcon",
        "bodyText",
        "showInnerAction",
        "innerActionText",
        "showBottomAction",
        "bottomActionText",
        "showClose",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for brief, non-critical feedback (saved, copied, sent)",
        "Auto-dismiss after 3-5 seconds",
        "Use Single Line for simple confirmations",
        "Use Multiple Line when action buttons are needed",
        "Position consistently (typically bottom-center or top-right)",
      ],
      dont: [
        "Don't use for critical errors — use Alert or Dialog instead",
        "Don't stack multiple toasts simultaneously",
        "Don't require user action to dismiss (except for important actions like Undo)",
        "Don't include lengthy text — keep messages under 2 lines",
      ],
    },
    docs: {
      description: {
        component:
          "A brief, non-blocking notification that appears temporarily to provide feedback about an action or system event.",
      },
    },
  },
  argTypes: {
    usage: {
      description:
        "Figma `Usage`: content density. Multiple Line moves the action to its own row. In code: `single` | `multiple`.",
      control: "inline-radio",
      options: USAGES,
      table: {
        type: { summary: '"multiple" | "single"' },
        defaultValue: { summary: "single" },
      },
    },
    tone: {
      description:
        "Figma `Tone`: Neutral (dark) for most feedback; the others for success / problems.",
      control: "inline-radio",
      options: TONES,
      table: {
        type: { summary: TONES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "neutral" },
      },
    },
    leftIcon: {
      description:
        "Figma `Left Icon`: a Material Symbols name. In code: `icon`, which defaults to the Tone's glyph.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "info" } },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `children`. Keep it under two lines.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Toast Content" } },
    },
    showInnerAction: {
      description:
        "Figma `Show Inner Action`. In code: pass `action`. Applies to Single Line only.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    innerActionText: {
      description: "Figma `Inner Action Text`. In code: `action.label`.",
      control: "text",
      if: { arg: "showInnerAction" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Inner Action" } },
    },
    showBottomAction: {
      description:
        "Figma `Show Bottom Action`. In code: pass `action`. Applies to Multiple Line only.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    bottomActionText: {
      description: "Figma `Bottom Action Text`. In code: `action.label`.",
      control: "text",
      if: { arg: "showBottomAction" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Bottom Action" } },
    },
    showClose: {
      description: "Figma `Show Close`. The button renders when there is an `onDismiss`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-389">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Brief, non-critical feedback: saved, copied, sent. */
export const Default: Story = {};

/** Every Usage (Single Line · Multiple Line) in every tone. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      {TONES.map((tone) => (
        <div key={tone} className="flex flex-col gap-16">
          <Toast tone={tone} onDismiss={dismiss} action={{ label: "Undo", onClick: dismiss }}>
            Removed from basket
          </Toast>
          <Toast
            tone={tone}
            usage="multiple"
            onDismiss={dismiss}
            action={{ label: "View basket", onClick: dismiss }}
          >
            Glow serum 30 ml was added to your basket. Free delivery from €50.
          </Toast>
        </div>
      ))}
    </div>
  ),
};

function Demo() {
  const toast = useToast();
  return (
    <Button onClick={() => toast({ children: "Saved to wishlist" })} variant="outline">
      Save
    </Button>
  );
}

/** Through useToast(): bottom centre, polite, one at a time, hides after 5 s. */
export const WithProvider: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved to wishlist");
  },
};
