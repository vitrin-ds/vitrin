"use client";

import { useId, useRef, type ReactNode } from "react";
import { BaseModal } from "@/components/base/modal/base-modal";
import { CloseButton } from "@/components/base/modal/close-button";
import { Button } from "../button/button";

// Figma `Dialog` (Usage) on `.Base Dialog`: a 360px panel, radius 8, shadow/md, padding 12, gap 6:
// title (title-medium) with the overlay close button (top right), the message (body-medium,
// text-secondary, padding-y 8) and the actions (Small Buttons, Outline + Filled, gap 8,
// right-aligned). Centred over the scrim with 16px page margins on mobile; fades and scales in.
// Raised surface: surface-raised + shadow-md. Destructive is an `alertdialog` with
// a Filled Error primary, and focuses the secondary (safe) action first (APG). One width: 360,
// capped to the viewport less the 16px margin; the panel scrolls when it is taller. A wider panel
// (Quick View, 3D Secure) is its own composition on BaseModal.

export interface DialogAction {
  label: string;
  onClick: () => void;
}

export interface DialogLabels {
  close: string;
}

export const DIALOG_LABELS: DialogLabels = { close: "Close" };

export const DIALOG_DEFAULTS = { usage: "default" } as const;

export interface DialogProps {
  open: boolean;
  /** Escape, the scrim and the close button call this. */
  onClose: () => void;
  /** Figma `Usage`: Default (confirmations) · Informative (tips) · Destructive (delete, remove). */
  usage?: "default" | "informative" | "destructive";
  /** Figma `Title Text`. */
  title: string;
  /** Figma `Body Text`: one focused decision. Also describes the dialog. */
  children: ReactNode;
  /** Figma `Button [Primary]`. */
  primaryAction?: DialogAction;
  /** Figma `Button [Secondary]`: usually Cancel. */
  secondaryAction?: DialogAction;
  labels?: DialogLabels;
}

export function Dialog({
  open,
  onClose,
  usage = DIALOG_DEFAULTS.usage,
  title,
  children,
  primaryAction,
  secondaryAction,
  labels = DIALOG_LABELS,
}: DialogProps) {
  const id = useId();
  const secondaryRef = useRef<HTMLButtonElement>(null);
  const destructive = usage === "destructive";

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      role={destructive ? "alertdialog" : "dialog"}
      labelledBy={`${id}-title`}
      describedBy={`${id}-body`}
      initialFocus={destructive && secondaryAction ? secondaryRef : undefined}
      motion="dialog"
      layoutClassName="items-center justify-center p-16"
      className="max-h-full w-full max-w-360 gap-6 overflow-y-auto rounded-overlay p-12 shadow-md"
    >
      <div className="flex items-center gap-8">
        <h2 id={`${id}-title`} className="min-w-0 flex-1 text-title-md text-text-primary">
          {title}
        </h2>
        <CloseButton label={labels.close} onClick={onClose} />
      </div>
      <div id={`${id}-body`} className="py-8 text-body-md text-text-secondary">
        {children}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap justify-end gap-8">
          {secondaryAction && (
            <Button
              ref={secondaryRef}
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={destructive ? "filled-error" : "filled"}
              size="sm"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </BaseModal>
  );
}
