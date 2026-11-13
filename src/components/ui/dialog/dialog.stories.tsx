import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import { Dialog, type DialogProps } from "./dialog";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  usage: DialogProps["usage"];
  titleText: string;
  bodyText: string;
  showActions: boolean;
  showButtonPrimary: boolean;
  showButtonSecondary: boolean;
  /** Not Figma properties: the button labels are fixed per story. */
  primaryLabel: string;
  secondaryLabel: string;
};

const USAGES = ["default", "informative", "destructive"] as const;

function Demo(props: DialogProps) {
  const [open, setOpen] = useState(props.open);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        {...props}
        open={open}
        onClose={close}
        primaryAction={props.primaryAction && { ...props.primaryAction, onClick: close }}
        secondaryAction={props.secondaryAction && { ...props.secondaryAction, onClick: close }}
      />
    </>
  );
}

const meta = {
  title: "Components/Feedback/Dialogs",
  // The defaults of Figma's `Dialog` and `.Base Dialog`.
  args: {
    usage: "default",
    titleText: "Message Title",
    bodyText: "Message Body",
    showActions: true,
    showButtonPrimary: true,
    showButtonSecondary: true,
    primaryLabel: "Confirm",
    secondaryLabel: "Cancel",
  },
  render: ({
    titleText,
    bodyText,
    showActions,
    showButtonPrimary,
    showButtonSecondary,
    primaryLabel,
    secondaryLabel,
    ...args
  }) => (
    <Demo
      {...args}
      open
      onClose={() => undefined}
      title={titleText}
      primaryAction={
        showActions && showButtonPrimary
          ? { label: primaryLabel, onClick: () => undefined }
          : undefined
      }
      secondaryAction={
        showActions && showButtonSecondary
          ? { label: secondaryLabel, onClick: () => undefined }
          : undefined
      }
    >
      {bodyText}
    </Demo>
  ),
  parameters: {
    // The Figma properties: Usage, Title Text, Body Text, Show Actions, Show Button
    // [Primary], Show Button [Secondary]. `Show Title` and `Show Close` are not controls: the
    // code always renders the title and the close button.
    controls: {
      include: [
        "usage",
        "titleText",
        "bodyText",
        "showActions",
        "showButtonPrimary",
        "showButtonSecondary",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Default for general confirmations (save, submit, continue)",
        "Use Informative for information-only dialogs (tips, announcements)",
        "Use Destructive for dangerous actions (delete, remove, cancel subscription)",
        "Always provide a clear way to dismiss (close button or secondary action)",
        "Keep content concise and focused on a single decision",
      ],
      dont: [
        "Don't use for non-blocking feedback — use Toast instead",
        "Don't stack multiple dialogs",
        "Don't hide both close button and secondary action",
        "Don't include complex forms — use a dedicated page instead",
      ],
    },
    docs: {
      description: {
        component:
          "A modal overlay that requires user attention and action, used for confirmations, alerts, or focused tasks that interrupt the main workflow.",
      },
      story: { inline: false, iframeHeight: 560 },
    },
  },
  argTypes: {
    usage: {
      description: "Figma `Usage`: semantic intent and button styling.",
      control: "inline-radio",
      options: USAGES,
      table: {
        type: { summary: '"default" | "informative" | "destructive"' },
        defaultValue: { summary: "default" },
      },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Message Title" } },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `children`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Message Body" } },
    },
    showActions: {
      description: "Figma `Show Actions`. In code: pass `primaryAction` / `secondaryAction`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonPrimary: {
      description: "Figma `Show Button [Primary]`. In code: pass `primaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showButtonSecondary: {
      description: "Figma `Show Button [Secondary]`. In code: pass `secondaryAction`.",
      control: "boolean",
      if: { arg: "showActions" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A general confirmation: save, submit, continue. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    // Reopen from the trigger: Escape returns focus to it.
    const trigger = body.getByRole("button", { name: "Open dialog" });
    await userEvent.click(trigger);
    await expect(body.getByRole("dialog", { name: "Message Title" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
  },
};

/** Information only: a tip or announcement, with one action. */
export const Informative: Story = {
  args: {
    usage: "informative",
    titleText: "Free delivery",
    bodyText: "Orders over €50 ship free within the EU.",
    primaryLabel: "Got it",
    showButtonSecondary: false,
  },
};

/** A dangerous action: delete, remove, cancel subscription. An alertdialog; focus starts on Cancel. */
export const Destructive: Story = {
  args: {
    usage: "destructive",
    titleText: "Remove from basket?",
    bodyText: "Glow serum 30 ml will be removed from your basket.",
    primaryLabel: "Remove",
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("alertdialog")).toBeInTheDocument();
    await expect(body.getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
};
