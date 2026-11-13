"use client";

import { useId, type ReactNode, type RefObject } from "react";
import { BaseModal } from "@/components/base/modal/base-modal";
import { ToolbarPopupTitle } from "@/components/ui/toolbar/toolbar-popup-title";

// Figma `Pop Up` (30704:22803, State=Default) on `.Base.PopUp`: a centred modal panel, 445 wide
// (full width less the 16px margin on phones), radius 24, surface-primary with no shadow (Figma;
// the scrim sets it apart). Toolbar.PopUp.Title on top, then the Content slot, 12 apart; the
// content scrolls when it is taller than the screen. Modal behaviour (focus trap, Escape, scrim,
// return focus) comes from BaseModal.

export interface PopUpLabels {
  close: string;
}

export const POP_UP_LABELS: PopUpLabels = { close: "Close" };

export interface PopUpProps {
  open: boolean;
  /** Escape, the scrim and the close button call this. */
  onClose: () => void;
  /** Toolbar.PopUp.Title `Main Title Text`; names the pop-up. */
  title: string;
  /** Toolbar.PopUp.Title `Subtitle Text`. */
  subtitle?: string;
  /** Figma `Content` slot: any component or frame. */
  children: ReactNode;
  /** Receives focus on open; the panel itself otherwise. */
  initialFocus?: RefObject<HTMLElement | null>;
  labels?: PopUpLabels;
}

export function PopUp({
  open,
  onClose,
  title,
  subtitle,
  children,
  initialFocus,
  labels = POP_UP_LABELS,
}: PopUpProps) {
  const id = useId();
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      labelledBy={`${id}-title`}
      initialFocus={initialFocus}
      motion="dialog"
      layoutClassName="items-center justify-center p-16"
      className="max-h-full w-full max-w-445 gap-12 overflow-hidden rounded-24 bg-surface-primary"
    >
      <ToolbarPopupTitle
        title={title}
        subtitle={subtitle}
        titleId={`${id}-title`}
        rightAction={{ label: labels.close, onClick: onClose }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </BaseModal>
  );
}
